@echo off
echo [START] SimpleClaw Sequential Launch...

:: 1. Build Check
if not exist "dist\index.js" (
    echo [START] First-time build required...
    call npm run setup
)

:: 2. Launch Backend (This now serves the UI!)
echo [START] Launching SimpleClaw...
start "SimpleClaw" node dist/index.js

:: 3. Wait & Open
timeout /t 5 /nobreak >NUL
echo [START] Opening Browser at http://localhost:3001
start http://localhost:3001

echo [START] System active.
exit
