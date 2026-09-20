#!/usr/bin/env python3
"""Internal change detection and baseline promotion; Python 3.10+, stdlib only.

Never runs a project command. source_roots must cover the real dependency closure.
Browser/privacy evidence is asserted by the exporter, not executed by this helper.
"""
from __future__ import annotations

import argparse
from contextlib import contextmanager
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import stat
import sys
import tempfile
import zipfile

from handoff import HandoffError, MAX_FILES, MAX_TOTAL, safe_rel, verify

CONFIG = '.interface-handoff/config.json'
STATE = '.interface-handoff/state.json'
EXCLUDED = {'.ssh', '.aws', '.azure', '.git', 'node_modules', '.interface-handoff', '__pycache__', '.next', '.nuxt', '.cache'}
PRIVATE_EXT = {'.pem', '.key', '.p12', '.pfx', '.sqlite', '.sqlite3', '.db', '.har'}
PRIVATE_NAMES = {'.npmrc', '.yarnrc', '.yarnrc.yml', '.netrc', 'credentials', 'id_rsa', 'id_ed25519'}
VERSION = '0.4.0'


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def local(root: Path, name: str) -> Path:
    """Resolve only portable relative names; reject symlinks in all path components."""
    safe_rel(name)
    cur = root
    for part in name.split('/'):
        cur /= part
        if cur.is_symlink():
            raise HandoffError(f'symlink rejected: {name}')
    if not cur.resolve().is_relative_to(root.resolve()):
        raise HandoffError('path escapes project')
    return cur


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def object_hash(value: object) -> str:
    data = json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':'))
    return hashlib.sha256(data.encode('utf-8')).hexdigest()


def read_object(path: Path) -> dict:
    if path.stat().st_size > 16 * 1024 * 1024:
        raise HandoffError('local JSON exceeds 16 MiB limit')
    value = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(value, dict):
        raise HandoffError('JSON must be an object')
    return value


def under(path: str, prefix: str) -> bool:
    return path == prefix or path.startswith(prefix + '/')


def excluded(name: str, config: dict) -> bool:
    parts = name.split('/')
    return (any(p in EXCLUDED or p in PRIVATE_NAMES or p == '.env' or p.startswith('.env.') for p in parts)
            or Path(name).suffix.lower() in PRIVATE_EXT
            or under(name, config['output_dir']) or name == config.get('task_file'))


def load_config(root: Path) -> dict:
    cfg = read_object(local(root, CONFIG))
    if cfg.get('schema_version') not in ('1.0', '1.1'):
        raise HandoffError('unsupported config schema')
    for key in ('project_id', 'scope', 'portability_target'):
        if not isinstance(cfg.get(key), str) or not cfg[key].strip():
            raise HandoffError(f'invalid config.{key}')
    if cfg['portability_target'] not in ('file', 'localhost', 'evidence-only'):
        raise HandoffError('invalid target')
    for key in ('source_roots', 'global_inputs', 'integration_files'):
        paths = cfg.get(key)
        if not isinstance(paths, list) or not paths or len(paths) != len(set(map(str, paths))):
            raise HandoffError(f'config.{key} must be a nonempty unique path array')
        for name in paths:
            local(root, name)
    command = cfg.get('export_command')
    if not isinstance(command, list) or not command or not all(isinstance(x, str) and x.strip() for x in command):
        raise HandoffError('export_command must be an argv array; it is never executed here')
    for key in ('output_dir', 'task_file'):
        local(root, cfg.get(key))
    if not isinstance(cfg.get('capture_profile'), dict) or not isinstance(cfg.get('toolchain'), dict):
        raise HandoffError('capture_profile and toolchain objects required')
    if any(under(cfg['output_dir'], p) or under(p, cfg['output_dir']) for p in cfg['source_roots']):
        raise HandoffError('output_dir must not overlap source_roots')
    for name in cfg['integration_files'] + cfg['global_inputs']:
        if not any(under(name, p) for p in cfg['source_roots']):
            raise HandoffError(f'input outside watched roots: {name}')
    if cfg['schema_version'] == '1.1':
        from handoff_reconcile import config_check
        config_check(root, cfg)
    return cfg


def inputs(root: Path, config: dict) -> dict:
    entries: dict[str, str | None] = {}
    count = 0
    for name in config['source_roots']:
        if excluded(name, config):
            raise HandoffError(f'excluded source root: {name}')
        source = local(root, name)
        if not source.exists():
            entries[name] = None
            continue
        if source.is_file():
            entries[name] = digest(source)
            continue
        if not source.is_dir():
            raise HandoffError(f'nonregular input: {name}')
        for directory, dirs, files in os.walk(source, followlinks=False):
            dirs[:] = sorted(d for d in dirs if not excluded((Path(directory)/d).relative_to(root).as_posix(), config))
            for d in dirs:
                local(root, (Path(directory)/d).relative_to(root).as_posix())
            for f in sorted(files):
                rel = (Path(directory)/f).relative_to(root).as_posix()
                if excluded(rel, config):
                    continue
                p = local(root, rel)
                if not p.is_file():
                    raise HandoffError(f'nonregular input: {rel}')
                entries[rel] = digest(p)
                count += 1
                if count > 100000:
                    raise HandoffError('too many inputs; inspect scope')
    cfg_hash = object_hash(config)
    return {'config_sha256': cfg_hash, 'files': dict(sorted(entries.items())),
            'fingerprint': object_hash({'config': cfg_hash, 'files': entries})}


def state_hash(root: Path) -> str | None:
    path = local(root, STATE)
    return digest(path) if path.is_file() else None


def legacy_signals(root: Path) -> list[str]:
    found = []
    for name in ('docs/tasks/interface-handoff.md', 'docs/interface-handoff.md',
                 'scripts/export-interface.mjs', 'scripts/export-interface.js', 'src/review'):
        if local(root, name).exists():
            found.append(name)
    p = local(root, 'package.json')
    if p.is_file():
        try:
            scripts = read_object(p).get('scripts', {})
            if isinstance(scripts, dict) and 'handoff:export' in scripts:
                found.append('package.json:scripts.handoff:export')
        except (ValueError, OSError):
            pass
    return found


def atomic_json(root: Path, name: str, value: dict, *, exclusive: bool = False) -> None:
    if not under(name, '.interface-handoff'):
        raise HandoffError('local state writes must stay inside .interface-handoff')
    target = local(root, name)
    target.parent.mkdir(parents=True, exist_ok=True)
    # Recheck created directory chain before writing.
    target = local(root, name)
    data = json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    if exclusive:
        with target.open('x', encoding='utf-8') as stream:
            stream.write(data)
        return
    fd, temp = tempfile.mkstemp(prefix='.handoff-', suffix='.tmp', dir=target.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temp, target)
    finally:
        Path(temp).unlink(missing_ok=True)


def _probe_inputs(root: Path) -> dict:
    if root.is_symlink() or not root.is_dir():
        raise HandoffError('project root must be an existing nonsymlink directory')
    root = root.resolve()
    result = {'helper_version': VERSION, 'route': 'bootstrap', 'reason': '',
              'changes': {'added': [], 'modified': [], 'deleted': []},
              'inputs': None, 'previous_state_sha256': None,
              'always_required': ['privacy', 'structure', 'offline-smoke', 'navigation-reset', 'extracted-zip-smoke']}
    try:
        result['previous_state_sha256'] = state_hash(root)
        if not local(root, CONFIG).is_file():
            found = legacy_signals(root)
            result.update(route='adopt' if found else 'bootstrap', legacy_signals=found,
                          reason='Inspect and reuse existing integration.' if found else 'Create integration and continue through ZIP delivery.')
            return result
        cfg = load_config(root)
        missing = [n for n in cfg['integration_files'] if not local(root, n).is_file()]
        if missing:
            result.update(route='repair', reason='Integration files missing.', missing=missing)
            return result
        current = inputs(root, cfg)
        result['inputs'] = current
        if result['previous_state_sha256'] is None:
            result.update(route='refresh-full', reason='Integration exists; no approved baseline yet.')
            return result
        state = read_object(local(root, STATE))
        if state.get('schema_version') != '1.0' or state.get('status') != 'verified':
            raise HandoffError('invalid baseline; preserve it for inspection')
        if state.get('project_id') != cfg['project_id']:
            raise HandoffError('baseline project identity differs')
        previous = state.get('inputs')
        if not isinstance(previous, dict) or not isinstance(previous.get('files'), dict):
            raise HandoffError('baseline inputs missing')
        artifact = state.get('artifact')
        if not isinstance(artifact, dict):
            raise HandoffError('baseline artifact missing')
        archive = local(root, artifact.get('path'))
        if not archive.is_file() or digest(archive) != artifact.get('sha256'):
            result.update(route='refresh-full', reason='Previous archive missing or modified; do not trust cache.')
            return result
        old, new = previous['files'], current['files']
        result['changes'] = {
            'added': sorted(p for p in new if p not in old),
            'modified': sorted(p for p in new if p in old and new[p] != old[p]),
            'deleted': sorted(p for p in old if p not in new)}
        changed = sum(result['changes'].values(), [])
        config_changed = previous.get('config_sha256') != current['config_sha256']
        global_change = any(under(n, g) for n in changed for g in cfg['global_inputs'])
        if config_changed or global_change or result['changes']['added'] or result['changes']['deleted']:
            result.update(route='refresh-full', reason='Configuration, global inputs or file inventory changed.')
        elif changed:
            result.update(route='refresh-incremental', reason='Changed known files; expand to dependents, or full scope when uncertain.')
        elif previous.get('fingerprint') == current['fingerprint']:
            result.update(route='refresh-reuse', reason='Watched inputs and archive match; verify cache and runtime before reuse.')
        else:
            result.update(route='refresh-full', reason='Fingerprint inconsistency; rebuild rather than reuse.')
        return result
    except (ValueError, OSError, UnicodeError, TypeError) as exc:
        result.update(route='repair', reason=f'Inspect local integration/state: {type(exc).__name__}. No project command was executed.')
        return result


def probe(root: Path) -> dict:
    """Old fingerprint route is only a candidate until current-UI reconciliation passes."""
    result = _probe_inputs(root)
    result['candidate_route'] = result['route']
    result['ready_for_export'] = False
    result['always_required'].insert(0, 'current-interface-reconciliation')
    if result['route'] in ('bootstrap', 'adopt', 'repair'):
        return result
    try:
        cfg = load_config(root)
        if cfg['schema_version'] != '1.1':
            result.update(route='adapt-integration', reason='Migrate existing integration to config 1.1; do not duplicate it.')
            return result
        from handoff_reconcile import check
        reconciled = check(root, cfg, result['inputs'])
        strategy = reconciled['strategy']
        chosen = {'reuse': 'refresh-reuse', 'incremental': 'refresh-incremental', 'full': 'refresh-full'}[strategy]
        rank = {'refresh-reuse': 0, 'refresh-incremental': 1, 'refresh-full': 2}
        if rank.get(chosen, 2) > rank.get(result['route'], 2):
            result['route'] = chosen
        result.update(ready_for_export=True, reconciliation={'status': 'resolved', 'strategy': strategy,
                      'report_sha256': reconciled['report_sha256'],
                      'discovery_fingerprint': reconciled['discovery']['fingerprint']})
    except (ValueError, OSError, UnicodeError, TypeError, KeyError) as exc:
        result.update(route='reconcile', reason=f'Current-interface reconciliation required: {exc}')
    return result


def inspect_archive(archive: Path, expected_inventory: dict | None = None) -> dict:
    """Safely extract a bounded allowlisted archive and verify its checksums."""
    with tempfile.TemporaryDirectory(prefix='interface-handoff-verify-') as folder:
        target = Path(folder)
        with zipfile.ZipFile(archive) as z:
            infos = z.infolist()
            if len(infos) > MAX_FILES + 2 or sum(i.file_size for i in infos) > MAX_TOTAL:
                raise HandoffError('archive exceeds safety budget')
            names = set()
            for info in infos:
                name = safe_rel(info.filename)
                if info.is_dir() or name in names:
                    raise HandoffError('duplicate/directory archive entry rejected')
                names.add(name)
                kind = stat.S_IFMT(info.external_attr >> 16)
                if kind not in (0, stat.S_IFREG):
                    raise HandoffError('nonregular archive entry rejected')
                dest = local(target, name)
                dest.parent.mkdir(parents=True, exist_ok=True)
                written = 0
                with z.open(info) as source, dest.open('xb') as stream:
                    for block in iter(lambda: source.read(1024 * 1024), b''):
                        written += len(block)
                        if written > info.file_size or written > MAX_TOTAL:
                            raise HandoffError('archive entry size mismatch')
                        stream.write(block)
        verify(target)
        manifest = read_object(target/'manifest.json')
        if expected_inventory is not None:
            from handoff_reconcile import compare_manifest
            if 'context/interface-inventory.json' not in manifest['files'] or 'context/changes.md' not in manifest['files']:
                raise HandoffError('current inventory and adaptation summary must be exported')
            if read_object(target/'context/interface-inventory.json') != expected_inventory:
                raise HandoffError('packaged inventory differs from reconciled current inventory')
            compare_manifest(manifest, expected_inventory)
        return manifest


@contextmanager
def promotion_lock(root: Path):
    path = local(root, '.interface-handoff/promotion.lock')
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    except FileExistsError as exc:
        raise HandoffError('promotion lock exists; inspect active/interrupted run before removal') from exc
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            stream.write(json.dumps({'pid': os.getpid(), 'created_at': utcnow()}))
        yield
    finally:
        path.unlink(missing_ok=True)


def seal(root: Path, archive_name: str, snapshot_name: str) -> dict:
    root = root.resolve()
    if not under(snapshot_name, '.interface-handoff'):
        raise HandoffError('snapshot must be local handoff state')
    snapshot = read_object(local(root, snapshot_name))
    expected = snapshot.get('inputs')
    if not isinstance(expected, dict) or not snapshot.get('ready_for_export') or snapshot.get('route') in ('bootstrap', 'adopt', 'repair', 'reconcile', 'adapt-integration'):
        raise HandoffError('fresh successful probe required after integration/repair')
    with promotion_lock(root):
        if state_hash(root) != snapshot.get('previous_state_sha256'):
            raise HandoffError('baseline changed during run; probe again')
        cfg = load_config(root)
        if inputs(root, cfg) != expected:
            raise HandoffError('inputs changed during export; regenerate from a fresh probe')
        from handoff_reconcile import check
        reconciled = check(root, cfg, expected)
        if reconciled['report_sha256'] != snapshot.get('reconciliation', {}).get('report_sha256'):
            raise HandoffError('reconciliation changed after snapshot; probe again')
        if not under(archive_name, cfg['output_dir']):
            raise HandoffError('archive must be inside configured output_dir')
        archive = local(root, archive_name)
        archive_sha = digest(archive)
        manifest = inspect_archive(archive, reconciled['inventory'])
        if manifest.get('schema_version') != '1.1':
            raise HandoffError('new baseline requires manifest 1.1 with current agent-ready delivery')
        if local(root, STATE).is_file():
            prior = read_object(local(root, STATE))
            if prior.get('export_id') == manifest['export_id']:
                raise HandoffError('new export_id required; old ZIP is not a new execution')
        if manifest['project']['source_fingerprint'] != expected['fingerprint']:
            raise HandoffError('manifest fingerprint does not match current build inputs')
        if not manifest['portability']['verified'] or manifest['portability']['target'] == 'evidence-only':
            raise HandoffError('partial/unverified output cannot replace approved baseline')
        if manifest['portability']['target'] != cfg['portability_target']:
            raise HandoffError('target does not match configuration')
        if any(c['status'] not in ('pass', 'not_applicable') for c in manifest['checks'].values()):
            raise HandoffError('required QA incomplete; keep previous baseline')
        if any(s['test'] not in ('pass', 'not_applicable') for v in manifest['views'] for s in v['states']):
            raise HandoffError('scenario QA incomplete; keep previous baseline')
        # Validate once more after ZIP work; do not seal a stale checkout or swapped archive.
        if inputs(root, load_config(root)) != expected or digest(archive) != archive_sha:
            raise HandoffError('inputs/archive changed during final verification')
        final_reconciliation = check(root, load_config(root))
        if final_reconciliation != reconciled:
            raise HandoffError('reconciliation/discovery changed during final verification')
        state = {'schema_version': '1.0', 'helper_version': VERSION, 'status': 'verified',
                 'sealed_at': utcnow(), 'export_id': manifest['export_id'],
                 'project_id': cfg['project_id'], 'inputs': expected,
                 'inventory': reconciled['inventory'], 'discovery': reconciled['discovery'],
                 'reconciliation_sha256': reconciled['report_sha256'],
                 'artifact': {'path': archive_name, 'sha256': archive_sha},
                 'qa_basis': 'exporter-declared evidence; helper checks structure and checksums, not browser behavior'}
        atomic_json(root, STATE, state)
        return {'status': 'baseline-promoted', 'export_id': manifest['export_id'], 'archive': archive_name}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    p = sub.add_parser('probe')
    p.add_argument('root', type=Path)
    p.add_argument('--snapshot', help='New local .interface-handoff/*.json snapshot; never overwritten')
    p = sub.add_parser('seal')
    p.add_argument('root', type=Path)
    p.add_argument('archive', help='Archive path relative to project')
    p.add_argument('--snapshot', required=True)
    args = parser.parse_args()
    try:
        if args.command == 'probe':
            result = probe(args.root)
            if args.snapshot and result['ready_for_export']:
                atomic_json(args.root.resolve(), args.snapshot, result, exclusive=True)
            summary = dict(result)
            if result['inputs']:
                summary['inputs'] = {k: v for k, v in result['inputs'].items() if k != 'files'}
                summary['input_count'] = len(result['inputs']['files'])
            summary['change_counts'] = {k: len(v) for k, v in result['changes'].items()}
            summary['changes'] = {k: v[:60] for k, v in result['changes'].items()}
            summary['snapshot_written'] = bool(args.snapshot and result['ready_for_export'])
            print(json.dumps(summary, ensure_ascii=False, indent=2))
            if args.snapshot and not result['ready_for_export']:
                return 2
        else:
            print(json.dumps(seal(args.root, args.archive, args.snapshot), indent=2))
        return 0
    except (ValueError, OSError, UnicodeError, TypeError, zipfile.BadZipFile) as exc:
        print(f'ERROR: {type(exc).__name__}: {exc}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
