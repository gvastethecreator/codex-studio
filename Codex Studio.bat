@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo Cozy Studio portable launcher
echo This launcher does not bundle ChatGPT login.

where bun >nul 2>nul
if errorlevel 1 (
  echo Cozy Studio needs Bun. Install it from https://bun.sh/docs/installation then run this launcher again.
  echo This launcher does not bundle ChatGPT login.
  if not defined STUDIO_PORTABLE_NONINTERACTIVE pause
  exit /b 1
)

set "STUDIO_PORTABLE=1"
if not defined STUDIO_LIBRARY_DIR set "STUDIO_LIBRARY_DIR=%~dp0Codex Studio Library"

bun run scripts/portable-start.ts
if errorlevel 1 (
  echo Cozy Studio failed to start.
  if not defined STUDIO_PORTABLE_NONINTERACTIVE pause
  exit /b 1
)
