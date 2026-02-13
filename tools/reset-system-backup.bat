@echo off
pushd "%~dp0.."
REM Backup script for SimpleClaw system state
set backup_dir=backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%

echo Creating backup directory: %backup_dir%
mkdir %backup_dir%

REM Copy all system files
xcopy /E /I src %backup_dir%\src\
xcopy /E /I storage %backup_dir%\storage\
xcopy /E /I tools %backup_dir%\tools\
copy fresh-start.md %backup_dir%\
copy *.md %backup_dir%\ 2>nul

echo Backup complete. To restore, copy files from %backup_dir% to root.
popd