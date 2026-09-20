#!/usr/bin/env python3
"""Validate, package and verify UI handoff folders. Python 3.10+, stdlib only.

This performs selected structural/safety checks, not full JSON Schema validation,
secret certification, browser execution or code sandboxing. Never run untrusted code.
"""
from __future__ import annotations

import argparse
from datetime import datetime
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import sys
import unicodedata
from urllib.parse import unquote, urlsplit
import zipfile

RESERVED = {'manifest.json', 'SHA256SUMS.txt'}
STATUSES = {'pass', 'failed', 'not_run', 'not_applicable'}
ARTIFACTS = ('start_here', 'review_prompt', 'product', 'design_system', 'coverage', 'source_map', 'limitations', 'qa')
CHECKS = ('portability', 'fidelity', 'interactions', 'privacy')
RENDERS = {'original-components', 'original-static', 'approximation', 'unavailable'}
BEHAVIORS = {'original-local', 'simulated', 'mixed', 'unavailable'}
MAX_TOTAL = 250 * 1024 * 1024
MAX_FILES = 5000
DENY_EXT = {'.pem', '.key', '.p12', '.pfx', '.db', '.sqlite', '.sqlite3', '.har', '.map', '.exe', '.dll', '.msi', '.zip'}
DENY_DIR = {'.git', 'node_modules', '.ssh', '.aws', '.azure', '.interface-handoff'}
WIN_RESERVED = {'con', 'prn', 'aux', 'nul'} | {f'{x}{n}' for x in ('com', 'lpt') for n in range(1, 10)}
SECRET_PATTERNS = (
    (re.compile(r'-----BEGIN (?:[A-Z ]+)?PRIVATE KEY-----'), 'private-key marker'),
    (re.compile(r'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b'), 'GitHub token pattern'),
    (re.compile(r'\bAKIA[A-Z0-9]{16}\b'), 'AWS access-key pattern'),
    (re.compile(r'\bsk-proj-[A-Za-z0-9_-]{25,}\b'), 'API-key pattern'),
)

class HandoffError(ValueError):
    pass


def safe_rel(value: str) -> str:
    """Accept portable literal file names; never paths or URLs escaping the root."""
    if not isinstance(value, str) or not value:
        raise HandoffError('path must be a non-empty string')
    if any(ord(c) < 32 for c in value) or any(c in value for c in '\\:?#%') or value.startswith('/'):
        raise HandoffError('absolute, encoded, URL or control-character path rejected')
    parts = value.split('/')
    for part in parts:
        if part in ('', '.', '..') or part.endswith((' ', '.')):
            raise HandoffError('empty, traversal or non-portable path component')
        if any(c in part for c in '<>"|*') or part.split('.')[0].casefold() in WIN_RESERVED:
            raise HandoffError('non-portable Windows filename')
    return value


def checked_file(root: Path, rel: str) -> Path:
    rel = safe_rel(rel)
    cur = root
    for part in rel.split('/'):
        cur = cur / part
        if cur.is_symlink():
            raise HandoffError(f'symlink rejected: {rel}')
    if not cur.is_file():
        raise HandoffError(f'missing file: {rel}')
    if not cur.resolve().is_relative_to(root.resolve()):
        raise HandoffError(f'outside root: {rel}')
    return cur


def read_manifest(root: Path) -> dict:
    if root.is_symlink() or not root.is_dir():
        raise HandoffError('staging must be an existing directory, not a symlink')
    path = checked_file(root, 'manifest.json')
    if path.stat().st_size > 2 * 1024 * 1024:
        raise HandoffError('manifest exceeds 2 MiB safety limit')
    obj = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(obj, dict):
        raise HandoffError('manifest must be a JSON object')
    return obj


def tree_files(root: Path) -> set[str]:
    found: set[str] = set()
    for current, dirs, names in os.walk(root, followlinks=False):
        for name in dirs + names:
            p = Path(current) / name
            if p.is_symlink():
                raise HandoffError(f'symlink rejected: {p.relative_to(root)}')
        for name in names:
            found.add((Path(current) / name).relative_to(root).as_posix())
            if len(found) > MAX_FILES:
                raise HandoffError(f'file count exceeds safety limit ({MAX_FILES})')
    return found


class RemoteAssets(HTMLParser):
    """Only detects literal remote HTML assets, not runtime JS/CSS dependencies."""
    def __init__(self):
        super().__init__()
        self.remote: list[str] = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        candidates = []
        if tag in ('script', 'img', 'iframe', 'audio', 'video', 'source', 'embed', 'input'):
            candidates.append(a.get('src', ''))
            candidates.append(a.get('poster', ''))
        if tag == 'link' and set(a.get('rel', '').split()) & {'stylesheet', 'preload', 'modulepreload', 'preconnect', 'dns-prefetch', 'icon'}:
            candidates.append(a.get('href', ''))
        if tag == 'object':
            candidates.append(a.get('data', ''))
        if any(urlsplit(v.strip()).scheme in ('http', 'https', 'ws', 'wss') or v.strip().startswith('//') for v in candidates):
            self.remote.append(tag)


def validate(root: Path) -> tuple[dict, list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    try:
        m = read_manifest(root)
    except (HandoffError, OSError, json.JSONDecodeError, UnicodeError) as exc:
        return {}, [str(exc)], []
    def error(message):
        errors.append(message)
    if m.get('schema_version') not in ('1.0', '1.1'):
        error('schema_version must be 1.0 (legacy) or 1.1 (agent-ready)')
    if m.get('schema_version') == '1.0':
        warnings.append('legacy manifest 1.0: not an agent-ready 0.4 delivery')
    if not isinstance(m.get('export_id'), str) or not re.fullmatch(r'[a-zA-Z0-9][a-zA-Z0-9._-]*', m.get('export_id', '')):
        error('export_id must be a portable non-empty identifier')
    try:
        stamp = datetime.fromisoformat(str(m.get('created_at', '')).replace('Z', '+00:00'))
        if stamp.tzinfo is None:
            error('created_at must include a timezone')
    except ValueError:
        error('created_at must be an ISO date-time')
    project = m.get('project')
    if not isinstance(project, dict):
        error('project must be an object')
    else:
        if not isinstance(project.get('name'), str) or not project['name'].strip():
            error('project.name is required')
        if project.get('working_tree') not in ('clean', 'dirty', 'unknown'):
            error('invalid project.working_tree')
        for key in ('revision', 'source_fingerprint'):
            if key not in project or (project[key] is not None and not isinstance(project[key], str)):
                error(f'project.{key} must be string or null')
        fp = project.get('source_fingerprint')
        if isinstance(fp, str) and not re.fullmatch(r'[a-f0-9]{64}', fp):
            error('source_fingerprint must be SHA-256 hex or null')
        if project.get('working_tree') == 'dirty' and not fp:
            warnings.append('dirty working tree without source fingerprint: snapshot is not fully identified')
    raw = m.get('files')
    if not isinstance(raw, list) or not raw:
        return m, errors + ['files must be a non-empty array'], warnings
    if len(raw) > MAX_FILES:
        return m, errors + ['too many allowlisted files'], warnings
    allowed: set[str] = set()
    keys = set()
    total = 0
    for item in raw:
        try:
            name = safe_rel(item)
            key = unicodedata.normalize('NFC', name).casefold()
            if key in keys:
                raise HandoffError(f'duplicate or case-insensitive collision: {name}')
            keys.add(key)
            if key in {x.casefold() for x in RESERVED}:
                raise HandoffError(f'reserved filename not allowed in files: {name}')
            parts = [x.casefold() for x in name.split('/')]
            if any(x in DENY_DIR for x in parts) or any(x.startswith('.env') for x in parts):
                raise HandoffError(f'private/dependency path rejected: {name}')
            if Path(name).suffix.casefold() in DENY_EXT:
                raise HandoffError(f'sensitive or unnecessary file type: {name}')
            p = checked_file(root, name)
            total += p.stat().st_size
            if total > MAX_TOTAL:
                raise HandoffError('staging exceeds 250 MiB safety limit; reduce package before packing')
            allowed.add(name)
            if p.suffix.lower() in {'.html','.htm','.css','.js','.mjs','.cjs','.json','.md','.txt','.ts','.tsx','.jsx','.vue','.svelte','.svg'}:
                text = p.read_text(encoding='utf-8', errors='replace')
                for pattern, label in SECRET_PATTERNS:
                    if pattern.search(text):
                        error(f'possible secret in {name}: {label}; inspect locally, do not disclose values')
                if p.suffix.lower() in {'.html', '.htm'}:
                    parser = RemoteAssets()
                    parser.feed(text)
                    if parser.remote:
                        error(f'remote HTML asset dependency in {name} ({", ".join(sorted(set(parser.remote)))})')
        except (HandoffError, OSError, ValueError) as exc:
            error(str(exc))
    try:
        extras = tree_files(root) - allowed - RESERVED
        if extras:
            error('undeclared or rejected files in staging: ' + ', '.join(sorted(extras)[:10]))
    except (HandoffError, OSError) as exc:
        error(str(exc))
    def file_ref(value, label):
        if not isinstance(value, str) or value not in allowed:
            error(f'{label} must reference a declared existing file')
    file_ref(m.get('entrypoint'), 'entrypoint')
    artifacts = m.get('artifacts')
    if not isinstance(artifacts, dict):
        error('artifacts must be an object')
    else:
        for key in ARTIFACTS:
            file_ref(artifacts.get(key), f'artifacts.{key}')
        for key in ('source_map', 'qa'):
            name = artifacts.get(key)
            if isinstance(name, str) and name in allowed:
                try:
                    json.loads(checked_file(root, name).read_text(encoding='utf-8'))
                except (ValueError, OSError) as exc:
                    error(f'artifacts.{key}: invalid JSON ({type(exc).__name__})')
    portability = m.get('portability')
    if not isinstance(portability, dict):
        error('portability must be an object')
        portability = {}
    if portability.get('target') not in ('file', 'localhost', 'evidence-only'):
        error('invalid portability.target')
    if not isinstance(portability.get('verified'), bool):
        error('portability.verified must be boolean')
    if not isinstance(portability.get('notes'), list):
        error('portability.notes must be an array')
    def evidence_refs(values, label, must_exist=False):
        if not isinstance(values, list):
            error(f'{label} must be an array')
        else:
            if must_exist and not values:
                error(f'{label} cannot be empty for pass')
            for value in values:
                file_ref(value, label)
    checks = m.get('checks')
    if not isinstance(checks, dict):
        error('checks must be an object')
        checks = {}
    for key in CHECKS:
        c = checks.get(key)
        if not isinstance(c, dict):
            error(f'checks.{key} must be an object')
            continue
        if c.get('status') not in STATUSES:
            error(f'checks.{key}.status invalid')
        evidence_refs(c.get('evidence'), f'checks.{key}.evidence', c.get('status') == 'pass')
        if not isinstance(c.get('note'), str) or (c.get('status') != 'pass' and not c.get('note','').strip()):
            error(f'checks.{key}.note must explain non-pass status')
    if portability.get('verified') is True and (not isinstance(checks.get('portability'), dict) or checks['portability'].get('status') != 'pass'):
        error('verified portability requires a pass portability check with evidence')
    if not portability.get('verified'):
        warnings.append('portability not verified; package remains partial/unverified')
    views = m.get('views')
    if not isinstance(views, list) or not views:
        error('views must be a non-empty array')
        views = []
    view_ids = set()
    for view in views:
        if not isinstance(view, dict):
            error('each view must be an object')
            continue
        vid = view.get('id')
        if not isinstance(vid, str) or not re.fullmatch(r'[a-z0-9][a-z0-9._-]*', vid) or vid in view_ids:
            error('view IDs must be unique valid identifiers')
            continue
        view_ids.add(vid)
        if not isinstance(view.get('source_refs'), list):
            error(f'{vid}.source_refs must be an array')
        states = view.get('states')
        if not isinstance(states, list) or not states:
            error(f'{vid}.states must be non-empty')
            continue
        state_ids = set()
        for state in states:
            if not isinstance(state, dict):
                error(f'{vid}: state must be an object')
                continue
            sid = state.get('id')
            if not isinstance(sid, str) or not re.fullmatch(r'[a-z0-9][a-z0-9._-]*', sid) or sid in state_ids:
                error(f'{vid}: state IDs must be unique valid identifiers')
            else:
                state_ids.add(sid)
            label = f'{vid}.{sid}'
            if state.get('render') not in RENDERS or state.get('behavior') not in BEHAVIORS:
                error(f'{label}: invalid render/behavior')
            if state.get('test') not in STATUSES:
                error(f'{label}: invalid test status')
            entry = state.get('entry')
            if entry is None:
                if state.get('render') != 'unavailable':
                    error(f'{label}: a rendered state requires a local entry')
            elif isinstance(entry, str):
                try:
                    u = urlsplit(entry)
                    if u.scheme or u.netloc:
                        raise HandoffError('external entry URL rejected')
                    file_ref(safe_rel(unquote(u.path)), f'{label}.entry')
                except (ValueError, HandoffError) as exc:
                    error(f'{label}: {exc}')
            else:
                error(f'{label}.entry must be string or null')
            evidence_refs(state.get('evidence'), f'{label}.evidence', state.get('test') == 'pass')
    scope = m.get('scope')
    if not isinstance(scope, dict) or scope.get('coverage') not in ('full','partial'):
        error('scope with coverage full/partial is required')
    else:
        inc, exc = scope.get('included'), scope.get('excluded')
        if not isinstance(inc, list) or not all(isinstance(v,str) for v in inc):
            error('scope.included must be an array of IDs')
        elif len(inc) != len(set(inc)) or set(inc) != view_ids:
            error('scope.included must match unique views IDs')
        if not isinstance(exc, list) or any(not isinstance(x,dict) or not isinstance(x.get('id'),str) or not x['id'] or not isinstance(x.get('reason'),str) or not x['reason'] for x in exc):
            error('scope.excluded must declare id and reason for every exclusion')
        elif any(x['id'] in view_ids for x in exc):
            error('scope cannot include and exclude the same view')
        if scope.get('coverage') == 'full' and exc:
            error('full coverage cannot contain excluded views')
    if m.get('schema_version') == '1.1' and not errors:
        # Works when this file is invoked directly or loaded via importlib.
        directory = str(Path(__file__).resolve().parent)
        if directory not in sys.path:
            sys.path.insert(0, directory)
        from handoff_delivery import validate_delivery
        errors.extend(validate_delivery(root, m))
    return m, errors, warnings


def pack(root: Path, output: Path) -> list[str]:
    m, errors, warnings = validate(root)
    if errors:
        raise HandoffError('\n'.join(errors))
    if output.exists():
        raise HandoffError('output already exists; choose a new filename')
    if output.resolve().is_relative_to(root.resolve()):
        raise HandoffError('ZIP output must be outside staging')
    if not output.parent.is_dir():
        raise HandoffError('output parent does not exist')
    names = sorted(m['files'] + ['manifest.json'])
    sums = []
    created = False
    try:
        # Exclusive mode prevents accidental overwrite, including races.
        with zipfile.ZipFile(output, 'x', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
            created = True
            for name in names:
                data = checked_file(root, name).read_bytes()
                sums.append(f'{hashlib.sha256(data).hexdigest()}  {name}')
                info = zipfile.ZipInfo(name, date_time=(1980,1,1,0,0,0))
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = 0o100644 << 16
                z.writestr(info, data)
            info = zipfile.ZipInfo('SHA256SUMS.txt', date_time=(1980,1,1,0,0,0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            z.writestr(info, ('\n'.join(sums)+'\n').encode('utf-8'))
    except BaseException:
        if created:
            output.unlink(missing_ok=True)
        raise
    return warnings


def verify(root: Path) -> int:
    if root.is_symlink() or not root.is_dir():
        raise HandoffError('root must be an existing directory, not a symlink')
    text = checked_file(root, 'SHA256SUMS.txt').read_text(encoding='utf-8')
    expected = set()
    keys = set()
    if not text.strip():
        raise HandoffError('empty checksum file')
    for line in text.splitlines():
        match = re.fullmatch(r'([a-f0-9]{64})  (.+)', line)
        if not match:
            raise HandoffError('invalid checksum line')
        digest, name = match.groups()
        safe_rel(name)
        key = unicodedata.normalize('NFC', name).casefold()
        if key in keys or name == 'SHA256SUMS.txt':
            raise HandoffError('duplicate/self checksum entry')
        keys.add(key)
        expected.add(name)
        p = checked_file(root, name)
        h = hashlib.sha256()
        with p.open('rb') as stream:
            for chunk in iter(lambda: stream.read(1024 * 1024), b''):
                h.update(chunk)
        if h.hexdigest() != digest:
            raise HandoffError(f'checksum mismatch: {name}')
    if tree_files(root) != expected | {'SHA256SUMS.txt'}:
        raise HandoffError('extra or missing files compared with checksum list')
    m, errors, _ = validate(root)
    if errors:
        raise HandoffError('\n'.join(errors))
    if expected != set(m['files']) | {'manifest.json'}:
        raise HandoffError('checksum inventory does not match manifest')
    return len(expected)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    for command in ('validate', 'pack', 'verify'):
        p = sub.add_parser(command)
        p.add_argument('root', type=Path)
        if command == 'pack':
            p.add_argument('output', type=Path)
    args = parser.parse_args()
    try:
        if args.command == 'validate':
            _, errors, warnings = validate(args.root)
            print(json.dumps({'structural_status':'failed' if errors else 'pass', 'errors':errors, 'warnings':warnings,
                              'browser_tests':'not_run_by_this_tool'}, indent=2, ensure_ascii=False))
            return 1 if errors else 0
        if args.command == 'pack':
            warnings = pack(args.root, args.output)
            print(json.dumps({'zip':str(args.output), 'warnings':warnings, 'browser_tests':'not_run_by_this_tool'}, indent=2))
        else:
            count = verify(args.root)
            print(f'Checksum + structure verification passed: {count} files. Not a signature or browser test.')
        return 0
    except (HandoffError, OSError, ValueError, zipfile.BadZipFile) as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
