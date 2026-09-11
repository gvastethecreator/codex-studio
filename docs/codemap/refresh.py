"""Refresh all four code-map artifacts with the installed source analyzer.

Usage: python docs/codemap/refresh.py --tool-dir <maintain-code-map/scripts>
"""

import argparse
from pathlib import Path
import subprocess
import sys


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--tool-dir", type=Path, required=True)
    args = parser.parse_args()
    tool = args.tool_dir.resolve() / "codemap_tool.py"
    if not tool.is_file():
        parser.error(f"code-map tool not found: {tool}")
    repo = Path(__file__).resolve().parents[2]
    return subprocess.run(
        [sys.executable, str(tool), "build", "--repo", str(repo), "--publish"],
        cwd=repo,
        check=False,
    ).returncode


if __name__ == "__main__":
    raise SystemExit(main())
