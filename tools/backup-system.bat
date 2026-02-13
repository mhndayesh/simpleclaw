@echo off
pushd "%~dp0.."
REM Robust backup script for SimpleClaw system state

REM Create timestamp using WMIC for reliable date formatting
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set backup_dir=backup_%datetime:~0,8%_%datetime:~8,6%

echo Creating backup directory: %backup_dir%
mkdir %backup_dir%

REM Copy all essential system directories
echo Backing up src directory...
xcopy /E /I /Y src %backup_dir%\src\ >nul

echo Backing up storage directory...
xcopy /E /I /Y storage %backup_dir%\storage\ >nul

echo Backing up tools directory...
xcopy /E /I /Y tools %backup_dir%\tools\ >nul

REM Copy all markdown files
echo Backing up documentation...
copy *.md %backup_dir%\ >nul 2>&1

REM Copy package files
echo Backing up configuration files...
copy package*.json %backup_dir%\ >nul 2>&1
copy tsconfig.json %backup_dir%\ >nul 2>&1

echo.
echo Backup completed successfully!
echo Backup location: %backup_dir%
echo.
echo To restore: xcopy /E /I /Y %backup_dir%\* .\
echo.
popd