@echo off
echo [SETUP] Initializing SimpleClaw...

:: 1. Run System Setup
echo [SETUP] Running full system setup (this may take a few minutes)...
call npm run setup
if %errorlevel% neq 0 (
    echo [ERROR] Setup failed.
    pause
    exit /b %errorlevel%
)

:: 3. Setup Temp Directory
echo [SETUP] Creating tools directory...
if not exist "tools" mkdir tools
if not exist "tools\temp" mkdir tools\temp
if not exist "saved_data" mkdir saved_data

echo [SETUP] Complete! You can now run 'start.bat'.
pause
