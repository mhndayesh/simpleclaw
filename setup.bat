@echo off
echo [SETUP] Initializing SimpleClaw...

:: 1. Install Dependencies
echo [SETUP] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b %errorlevel%
)

:: 2. Build Project
echo [SETUP] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed.
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
