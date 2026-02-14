@echo off
echo [START] SimpleClaw Sequential Launch...

:: 1. Build Backend
if not exist "dist\index.js" (
    echo [START] Building Backend...
    call npm run build
)

:: 2. Launch Backend (Port 3001)
echo [START] Launching Backend Server...
start "SimpleClaw Backend" node dist/index.js

:: 3. Wait for Backend
timeout /t 3 /nobreak >NUL

:: 4. Launch Frontend (Port 3000)
echo [START] Launching UI Server (Vite)...
start "SimpleClaw UI" cmd /c "cd ui && npm run dev"

:: 5. Wait & Open Browser
timeout /t 5 /nobreak >NUL
echo [START] Opening Browser...
start http://localhost:3000

echo [START] Both servers running.
exit
