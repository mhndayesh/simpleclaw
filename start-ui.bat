@echo off
setlocal enabledelayedexpansion
pushd "%~dp0"

echo [1/3] Starting SimpleClaw API Server (Background)...
:: Start the server in a minimized window
start /min "SimpleClaw-Backend" cmd /c "node dist/server.js"

echo [2/3] Waiting for API to initialize...
:check_api
:: Pulse the API endpoint to see if it responds
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/models' -Method Get -TimeoutSec 1; if ($response.StatusCode -eq 200) { exit 0 } } catch { exit 1 }" >nul 2>&1

if !errorlevel! neq 0 (
    <nul set /p="."
    timeout /t 1 /nobreak >nul
    goto check_api
)

echo.
echo [3/3] API is Online. Launching Web Interface...
:: Open the browser immediately
start http://localhost:5173

:: Start the Vite dev server
cd ui
npm run dev

popd
endlocal
