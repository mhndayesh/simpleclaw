@echo off
pushd "%~dp0"
REM SimpleClaw manual reset script
REM This script resets system settings and functionality to defaults
REM It PRESERVES session data files (storage/session_*.json) but clears meta/settings

echo WARNING: This will reset system settings to their defaults but will KEEP session data files.
if "%1"=="y" (
  set CONFIRM=y
) else (
  set /P CONFIRM=Do you want to proceed and reset system settings? (y/n) 
)
if /I "%CONFIRM%" NEQ "y" (
  echo Aborted by user.
  exit /B 0
)

echo Stopping node processes (if any)...
taskkill /IM node.exe /F >nul 2>&1

REM Create a timestamped backup folder for current settings
for /f "tokens=1-3 delims=/: " %%a in ("%date% %time%") do set _dt=%%c-%%a-%%b
set BACKUP_DIR=backup_%_dt%
mkdir "%BACKUP_DIR%" 2>nul

if exist config.json (
  echo Backing up config.json -> %BACKUP_DIR%\config.json.bak
  copy /Y config.json "%BACKUP_DIR%\config.json.bak" >nul
)

REM Restore default config
if exist config.default.json (
  echo Restoring default config.json from config.default.json
  copy /Y config.default.json config.json >nul
)
if not exist config.default.json (
  echo No config.default.json found; skipping config restore
)

REM Deploy fallback server to ensure server starts after reset
if not exist dist mkdir dist
echo Installing fallback server into dist/server.js
copy /Y dist\reset-fallback-server.js dist\server.js >nul

REM Ensure default session meta exists for 'default'
if not exist storage mkdir storage
echo {"mode":"super-eco"} > storage\session_default.meta.json

REM Clear meta files but preserve session histories
echo Clearing session meta files in storage/ (preserves session_*.json)
if not exist storage mkdir storage
for %%F in (storage\*.meta.json) do (
  echo {}>"%%F"
  echo Cleared %%F
)

echo Reset of system settings complete.
echo You may now start the server with: node dist/server.js
if NOT "%1"=="y" pause
popd

