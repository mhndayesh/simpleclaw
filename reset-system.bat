@echo off
echo [RESET] Resetting SimpleClaw System...

:: 1. Kill potential zombie processes
echo [RESET] Stopping Node processes...
taskkill /F /IM node.exe >nul 2>&1

:: 2. Clear Build
echo [RESET] Cleaning build artifacts...
if exist "dist" rmdir /s /q "dist"

:: 3. Clear Temp Tools
echo [RESET] Cleaning temp tools...
if exist "tools\temp" rmdir /s /q "tools\temp"
mkdir "tools\temp"

:: 4. Rebuild
echo [RESET] Rebuilding system...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Rebuild failed.
    pause
    exit /b %errorlevel%
)

echo [RESET] System Cleaned & Rebuilt.
echo [RESET] Run 'start.bat' to launch.
pause
