#!/usr/bin/env python3
"""Fail-closed reconciliation gate for an evolving interface. Python 3.10+, stdlib.

Hashes bounded local files; never runs project commands or infers UI semantics.
The agent/project adapter supplies the current inventory and reasoned resolutions.
A mechanically valid report is not proof of fidelity, privacy or browser behavior.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import sys

import handoff_state as hs
from handoff import HandoffError

REPORT = '.interface-handoff/reconciliation.json'
CHECKS = ('current_inventory', 'scope_and_dependencies', 'exporter_and_adapters',
          'scenarios_and_fixtures', 'capture_and_checks', 'documentation', 'stale_artifacts')
STRATEGIES = ('reuse', 'incremental', 'full')
EXTRA_EXCLUDED = {'.venv', 'venv', '.tox', '.mypy_cache', '.pytest_cache'}


def config_check(root: Path, cfg: dict) -> None:
    if cfg.get('schema_version') != '1.1':
        raise HandoffError('migrate configuration to 1.1 before reconciliation/export')
    name = cfg.get('inventory_file')
    hs.local(root, name)
    if hs.excluded(name, cfg) or not any(hs.under(name, p) for p in cfg['source_roots']):
        raise HandoffError('inventory_file must be a watched, nonexcluded source file')
    d = cfg.get('discovery')
    if not isinstance(d, dict):
        raise HandoffError('discovery configuration required')
    for key, upper in (('max_files', 100000), ('max_bytes', 4 * 1024**3)):
        value = d.get(key)
        if type(value) is not int or not 0 < value <= upper:
            raise HandoffError(f'invalid discovery.{key}')
    roots = d.get('exclude_roots')
    if not isinstance(roots, list):
        raise HandoffError('discovery.exclude_roots must be an array')
    seen = set()
    for item in roots:
        if not isinstance(item, dict) or not isinstance(item.get('reason'), str) or not item['reason'].strip():
            raise HandoffError('each discovery exclusion requires a reason')
        name = item.get('path')
        hs.local(root, name)
        if name in seen:
            raise HandoffError('duplicate discovery exclusion')
        seen.add(name)
        if any(hs.under(p, name) or hs.under(name, p) for p in cfg['source_roots']):
            raise HandoffError('discovery exclusion overlaps watched inputs')


def discover(root: Path, cfg: dict) -> dict:
    """Hash regular files beyond yesterday's roots. Bounds or unreadable files fail.

    Deliberately does not honor .gitignore: untracked/ignored source can affect UI.
    Explicit generated roots must be configured instead. Secret files are skipped.
    """
    config_check(root, cfg)
    excluded_roots = cfg['discovery']['exclude_roots']
    records = {}
    total_bytes = 0

    def skip(name: str) -> bool:
        return (hs.excluded(name, cfg) or any(p in EXTRA_EXCLUDED for p in name.split('/'))
                or any(hs.under(name, p['path']) for p in excluded_roots))

    def walk_error(error: OSError) -> None:
        raise error  # os.walk otherwise silently skips unreadable directories.

    for directory, dirs, files in os.walk(root, followlinks=False, onerror=walk_error):
        keep = []
        for item in sorted(dirs):
            name = (Path(directory)/item).relative_to(root).as_posix()
            if not skip(name):
                hs.local(root, name)  # Reject symlinks; don't silently hide a source tree.
                keep.append(item)
        dirs[:] = keep
        for item in sorted(files):
            name = (Path(directory)/item).relative_to(root).as_posix()
            if skip(name):
                continue
            path = hs.local(root, name)
            if not path.is_file():
                raise HandoffError(f'nonregular discovery input: {name}')
            total_bytes += path.stat().st_size
            if len(records) + 1 > cfg['discovery']['max_files'] or total_bytes > cfg['discovery']['max_bytes']:
                raise HandoffError('discovery budget exceeded; inspect scope/exclusions; never assume unchanged')
            records[name] = hs.digest(path)
    records = dict(sorted(records.items()))
    policy = {'exclude_roots': excluded_roots, 'builtin_exclusions': sorted(hs.EXCLUDED | EXTRA_EXCLUDED),
              'private_extensions': sorted(hs.PRIVATE_EXT), 'output_dir': cfg['output_dir'],
              'task_file': cfg['task_file'], 'secret_names': '.env/.env.*; .npmrc/.yarnrc*; private credential names'}
    return {'files': records, 'fingerprint': hs.object_hash({'files': records, 'policy': policy}),
            'policy_sha256': hs.object_hash(policy), 'file_count': len(records), 'bytes_hashed': total_bytes}


def required_text(value: object, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise HandoffError(f'{label} must be nonempty text')
    return value


def source_refs(root: Path, value: object, cfg: dict, label: str) -> None:
    if not isinstance(value, list) or not value or len(value) != len(set(map(str, value))):
        raise HandoffError(f'{label} requires unique source_refs')
    for name in value:
        path = hs.local(root, name)
        if not path.is_file() or hs.excluded(name, cfg):
            raise HandoffError(f'stale/private inventory source reference: {name}')
        if not any(hs.under(name, p) for p in cfg['source_roots']):
            raise HandoffError(f'inventory dependency outside watched roots: {name}')


def inventory(root: Path, cfg: dict) -> dict:
    value = hs.read_object(hs.local(root, cfg['inventory_file']))
    if value.get('schema_version') != '1.0' or value.get('project_id') != cfg['project_id']:
        raise HandoffError('inventory schema/project identity mismatch')
    for group in ('views', 'surfaces', 'flows', 'excluded'):
        entries = value.get(group)
        if not isinstance(entries, list):
            raise HandoffError(f'inventory.{group} must be an array')
        ids = set()
        for entry in entries:
            if not isinstance(entry, dict):
                raise HandoffError(f'inventory.{group} entries must be objects')
            id_ = required_text(entry.get('id'), f'{group}.id')
            if id_ in ids:
                raise HandoffError(f'duplicate inventory {group} id: {id_}')
            ids.add(id_)
            if group == 'excluded':
                required_text(entry.get('reason'), 'excluded.reason')
                continue
            source_refs(root, entry.get('source_refs'), cfg, id_)
            if group == 'views':
                required_text(entry.get('title'), 'view.title')
                states = entry.get('states')
                if not isinstance(states, list) or not states:
                    raise HandoffError('each inventory view needs implemented states')
                state_ids = set()
                for state in states:
                    if not isinstance(state, dict):
                        raise HandoffError('inventory state must be an object')
                    sid = required_text(state.get('id'), 'state.id')
                    if sid in state_ids:
                        raise HandoffError('duplicate state id')
                    state_ids.add(sid)
                    if 'entry' not in state:
                        raise HandoffError('inventory state.entry is required (null when unavailable)')
                    entry_url = state['entry']
                    if entry_url is not None:
                        required_text(entry_url, 'state.entry')
                        # Entry points must be local paths with an optional hash/query.
                        hs.safe_rel(entry_url.split('#', 1)[0].split('?', 1)[0])
            if group == 'surfaces':
                required_text(entry.get('kind'), 'surface.kind')
            if group == 'flows':
                required_text(entry.get('description'), 'flow.description')
    views = {v['id'] for v in value['views']}
    if not views:
        raise HandoffError('inventory must contain implemented views; evidence-only is a partial result')
    if views & {e['id'] for e in value['excluded']}:
        raise HandoffError('a view cannot be both included and excluded')
    for flow in value['flows']:
        refs = flow.get('view_ids')
        if not isinstance(refs, list) or not refs or not all(isinstance(v, str) and v in views for v in refs):
            raise HandoffError('flow references stale/missing views')
    return value


def inventory_delta(before: dict | None, after: dict) -> dict:
    result = {}
    for group in ('views', 'surfaces', 'flows', 'excluded'):
        a = {x['id']: x for x in (before or {}).get(group, [])}
        b = {x['id']: x for x in after[group]}
        result[group] = {'added': sorted(b.keys() - a.keys()), 'removed': sorted(a.keys() - b.keys()),
                         'changed': sorted(k for k in a.keys() & b.keys() if a[k] != b[k])}
    # Retired state IDs are explicit, not merely hidden behind "view changed".
    a = {(v['id'], s['id']) for v in (before or {}).get('views', []) for s in v['states']}
    b = {(v['id'], s['id']) for v in after['views'] for s in v['states']}
    result['states'] = {'added': [list(x) for x in sorted(b-a)], 'removed': [list(x) for x in sorted(a-b)]}
    return result


def prepare(root: Path, cfg: dict | None = None, current: dict | None = None) -> dict:
    root = root.resolve()
    cfg = cfg or hs.load_config(root)
    config_check(root, cfg)
    current = current or hs.inputs(root, cfg)
    inv = inventory(root, cfg)
    discovery = discover(root, cfg)
    previous = hs.read_object(hs.local(root, hs.STATE)) if hs.local(root, hs.STATE).is_file() else {}
    if previous and (previous.get('project_id') != cfg['project_id'] or previous.get('status') != 'verified'):
        raise HandoffError('inspect invalid previous baseline before reconciliation')
    old = previous.get('discovery', {}).get('files', {})
    new = discovery['files']
    changes = []
    for path in sorted(old.keys() | new.keys()):
        if old.get(path) != new.get(path):
            kind = 'added' if path not in old else 'removed' if path not in new else 'modified'
            changes.append({'path': path, 'change': kind,
                            'watched': any(hs.under(path, p) for p in cfg['source_roots']),
                            'disposition': 'pending', 'reason': ''})
    delta = inventory_delta(previous.get('inventory'), inv)
    old_inputs = previous.get('inputs', {})
    full = (not previous.get('discovery') or old_inputs.get('config_sha256') != current['config_sha256']
            or any(values for group in delta.values() for values in group.values())
            or any(item['watched'] and (item['change'] != 'modified'
                   or any(hs.under(item['path'], p) for p in cfg['global_inputs'])) for item in changes))
    minimum = 'full' if full else 'incremental' if old_inputs.get('fingerprint') != current['fingerprint'] else 'reuse'
    return {'schema_version': '1.0', 'project_id': cfg['project_id'], 'status': 'pending',
            'created_at': hs.utcnow(), 'previous_state_sha256': hs.state_hash(root),
            'previous_export_id': previous.get('export_id'), 'inputs_fingerprint': current['fingerprint'],
            'discovery_fingerprint': discovery['fingerprint'], 'inventory_sha256': hs.object_hash(inv),
            'minimum_strategy': minimum, 'strategy': minimum, 'inventory_delta': delta,
            'decisions': changes, 'unresolved': [],
            'assessments': {key: {'status': 'pending', 'basis': 'source-inspection', 'evidence_refs': [], 'note': ''}
                            for key in CHECKS}}


def check(root: Path, cfg: dict | None = None, current: dict | None = None) -> dict:
    root = root.resolve()
    cfg = cfg or hs.load_config(root)
    expected = prepare(root, cfg, current)
    report = hs.read_object(hs.local(root, REPORT))
    for key in ('schema_version', 'project_id', 'previous_state_sha256', 'previous_export_id',
                'inputs_fingerprint', 'discovery_fingerprint', 'inventory_sha256', 'minimum_strategy', 'inventory_delta'):
        if report.get(key) != expected[key]:
            raise HandoffError(f'reconciliation is stale or mismatched: {key}; reconcile again')
    if report.get('status') != 'resolved' or report.get('unresolved') != []:
        raise HandoffError('unresolved interface drift; agent must adapt integration and finish reconciliation')
    strategy = report.get('strategy')
    if strategy not in STRATEGIES or STRATEGIES.index(strategy) < STRATEGIES.index(expected['minimum_strategy']):
        raise HandoffError('reconciliation strategy skips required invalidation')
    decisions = report.get('decisions')
    if not isinstance(decisions, list):
        raise HandoffError('reconciliation decisions missing')
    expected_paths = {d['path']: d for d in expected['decisions']}
    actual = {}
    for d in decisions:
        if not isinstance(d, dict) or d.get('path') not in expected_paths or d['path'] in actual:
            raise HandoffError('unknown/duplicate reconciliation decision')
        exp = expected_paths[d['path']]
        if any(d.get(k) != exp[k] for k in ('change', 'watched')):
            raise HandoffError('reconciliation decision path status differs')
        if d.get('disposition') not in ('adapted', 'covered', 'unrelated', 'retired'):
            raise HandoffError('pending reconciliation decision')
        required_text(d.get('reason'), 'decision.reason')
        if d['disposition'] == 'unrelated' and d['watched']:
            raise HandoffError('watched inputs cannot be discarded as unrelated; repair scope or adapt')
        if not d['watched'] and d['change'] != 'removed' and d['disposition'] != 'unrelated':
            raise HandoffError('relevant discovery outside source_roots; expand dependency closure before export')
        if d['change'] != 'removed' and d['disposition'] == 'retired':
            raise HandoffError('only removed files can be retired')
        actual[d['path']] = d
    if actual.keys() != expected_paths.keys():
        raise HandoffError('changed/discovered paths lack a reconciliation decision')
    assessments = report.get('assessments')
    if not isinstance(assessments, dict) or set(assessments) != set(CHECKS):
        raise HandoffError('reconciliation assessment coverage incomplete')
    for key, item in assessments.items():
        if not isinstance(item, dict) or item.get('status') != 'resolved':
            raise HandoffError(f'unresolved assessment: {key}')
        required_text(item.get('note'), f'{key}.note')
        if item.get('basis') not in ('source-inspection', 'typecheck', 'runtime', 'reused-inspection'):
            raise HandoffError('unknown assessment basis')
        if item['basis'] == 'reused-inspection':
            if expected['minimum_strategy'] != 'reuse' or item.get('source_export_id') != expected['previous_export_id']:
                raise HandoffError('reused assessment requires matching current inputs and baseline provenance')
        refs = item.get('evidence_refs')
        if not isinstance(refs, list) or not refs:
            raise HandoffError(f'{key} requires inspection/test evidence references')
        for ref in refs:
            path = hs.local(root, ref)
            if not path.is_file() or hs.excluded(ref, cfg):
                raise HandoffError(f'missing/private assessment evidence: {ref}')
    return {'status': 'reconciled', 'strategy': strategy, 'inventory': inventory(root, cfg),
            'discovery': discover(root, cfg), 'report_sha256': hs.digest(hs.local(root, REPORT)),
            'inventory_delta': expected['inventory_delta'], 'qa_basis': 'agent assertions; not browser tests'}


def compare_manifest(manifest: dict, inv: dict) -> None:
    expected = {v['id']: v for v in inv['views']}
    actual = {v['id']: v for v in manifest['views']}
    if actual.keys() != expected.keys() or set(manifest['scope']['included']) != expected.keys():
        raise HandoffError('manifest coverage differs from reconciled current inventory')
    if {v['id']: v['reason'] for v in manifest['scope']['excluded']} != {v['id']: v['reason'] for v in inv['excluded']}:
        raise HandoffError('manifest exclusions differ from reconciled inventory')
    for id_, view in actual.items():
        e = expected[id_]
        if view['title'] != e['title'] or set(view['source_refs']) != set(e['source_refs']):
            raise HandoffError(f'manifest title/source mapping stale: {id_}')
        states = {s['id']: s['entry'] for s in view['states']}
        if states != {s['id']: s['entry'] for s in e['states']}:
            raise HandoffError(f'manifest states/entries stale: {id_}')


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    for command in ('scan', 'plan', 'check'):
        p = sub.add_parser(command)
        p.add_argument('root', type=Path)
    args = parser.parse_args()
    try:
        if args.root.is_symlink() or not args.root.is_dir():
            raise HandoffError('root must be an existing nonsymlink directory')
        root = args.root.resolve()
        if args.command == 'scan':
            result = discover(root, hs.load_config(root))
        elif args.command == 'plan':
            result = prepare(root)
            hs.atomic_json(root, REPORT, result)
            result = {'status': 'pending-agent-reconciliation', 'report': REPORT,
                      'changed_paths': len(result['decisions']), 'minimum_strategy': result['minimum_strategy'],
                      'inventory_delta': result['inventory_delta']}
        else:
            result = check(root)
            result.pop('discovery')
            result.pop('inventory')
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except (OSError, ValueError, TypeError, KeyError, UnicodeError) as exc:
        print(f'ERROR: {type(exc).__name__}: {exc}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
