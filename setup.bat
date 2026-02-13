@echo off
setlocal enabledelayedexpansion
pushd "%~dp0"

echo [1/6] Installing Backend Dependencies...
call npm install

echo [2/6] Building Backend...
call npm run build

echo [3/6] Calibrating Project Paths...
node tools/calibrate-paths.js

echo [4/6] Installing UI Dependencies...
cd ui
call npm install
cd ..

echo [5/6] Resetting Setup Wizard Status...
node dist/index.js setup

echo [6/6] Launching SimpleClaw...
echo.
echo Starting SimpleClaw API Server (Background)...
start /min "SimpleClaw-Backend" cmd /c "node dist/server.js"

echo Waiting for API to initialize...
:check_api
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/setup-status' -Method Get -TimeoutSec 1; if ($response.StatusCode -eq 200) { exit 0 } } catch { exit 1 }" >nul 2>&1
if !errorlevel! neq 0 (
    <nul set /p="."
    timeout /t 1 /nobreak >nul
    goto check_api
)

echo.
echo API is Online. Launching Setup Interface...
start http://localhost:5173

echo Starting Web Interface...
cd ui
npm run dev

popd
endlocal

