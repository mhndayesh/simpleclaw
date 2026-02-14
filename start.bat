@echo off
echo [START] SimpleClaw Sequential Launch...

:: 1. Build Check
if not exist "dist\index.js" (
    echo [START] First-time build required...
    call npm run setup
)

:: 2. Launch Backend in NEW window
echo [START] Launching Backend Server...
start "SimpleClaw Backend" cmd /c "node dist/index.js"

:: 3. Launch UI Dev Server in NEW window
echo [START] Launching UI Dev Server...
start "SimpleClaw UI" cmd /c "cd ui && npm run dev"

:: 4. Wait & Open
timeout /t 5 /nobreak >NUL
echo [START] Opening Browser at http://localhost:3000
start http://localhost:3000

echo [START] System active.
exit
