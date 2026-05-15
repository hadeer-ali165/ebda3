@echo off
setlocal

set "APP_DIR=%~dp0"
set "PID_FILE=%APP_DIR%storage\app-server.pid"
set "APP_PID="

if not exist "%PID_FILE%" (
    echo No running app process found.
    exit /b 0
)

for /f "usebackq delims=" %%P in ("%PID_FILE%") do (
    set "APP_PID=%%P"
)

if not defined APP_PID (
    del "%PID_FILE%" >nul 2>&1
    echo PID file was empty. Cleaned up.
    exit /b 0
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "Stop-Process -Id %APP_PID% -Force -ErrorAction SilentlyContinue"
if errorlevel 1 (
    echo Could not stop process %APP_PID% ^(maybe already closed^).
) else (
    echo App server stopped ^(PID %APP_PID%^).
)

del "%PID_FILE%" >nul 2>&1
exit /b 0
