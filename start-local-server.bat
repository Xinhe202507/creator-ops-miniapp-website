@echo off
chcp 65001 >nul
cd /d "%~dp0"

set PORT=8080
set URL=http://localhost:%PORT%/

echo Starting local website server...
echo Open this address if the browser does not open automatically:
echo %URL%
echo.

where py >nul 2>nul
if %errorlevel%==0 (
  start "" "%URL%"
  py -3 -m http.server %PORT%
  exit /b
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "" "%URL%"
  python -m http.server %PORT%
  exit /b
)

echo Python was not found on this computer.
echo You can still double-click index.html, or install Python from https://www.python.org/downloads/
pause
