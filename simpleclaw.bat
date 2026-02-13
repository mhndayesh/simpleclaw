@echo off
setlocal
:: Ensure we are in the project directory so .env and dist are found
pushd "%~dp0"

:: Check if any arguments were passed
if "%~1"=="" (
    echo SimpleClaw CLI Shortcut
    echo Usage: simpleclaw [command] [options]
    echo.
    echo Example: simpleclaw list
    echo          simpleclaw chat -m llama3.1:8b -q "hello"
    echo          simpleclaw setup
    echo.
    echo (Press any key to exit...)
    pause > nul
    exit /b
)

node dist/index.js %*
endlocal
