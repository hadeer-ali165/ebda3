@echo off
setlocal

set "APP_DIR=%~dp0"
cd /d "%APP_DIR%"
set "PHP_EXE=%APP_DIR%runtime\php\php.exe"
set "APP_HOST=127.0.0.1"
set "APP_PORT=8090"
set "APP_URL=http://%APP_HOST%:%APP_PORT%"
set "PID_FILE=%APP_DIR%storage\app-server.pid"
set "APP_PUBLIC=%APP_DIR%public"
set "APP_ROUTER=%APP_DIR%serve-router.php"

if not exist "%PHP_EXE%" (
    echo [ERROR] php.exe not found at:
    echo %PHP_EXE%
    echo.
    echo Put portable PHP inside runtime\php then run again.
    pause
    exit /b 1
)

if exist "%PID_FILE%" (
    set /p OLD_PID=<"%PID_FILE%"
    if not "%OLD_PID%"=="" (
        tasklist /FI "PID eq %OLD_PID%" | findstr /I "%OLD_PID%" >nul
        if not errorlevel 1 (
            echo App is already running at %APP_URL%
            start "" "%APP_URL%"
            exit /b 0
        )
    )
)

if not exist "%APP_DIR%storage\logs" mkdir "%APP_DIR%storage\logs"

findstr /I /C:"supabase" "%APP_DIR%.env" >nul
if errorlevel 1 (
    call "%APP_DIR%runtime\StartPostgres.bat"
    if errorlevel 1 (
        echo [ERROR] PostgreSQL failed to start.
        pause
        exit /b 1
    )
)

echo Preparing database (first run only may take a moment)...
"%PHP_EXE%" artisan migrate --force
if errorlevel 1 (
    echo [ERROR] Database migration failed.
    pause
    exit /b 1
)

"%PHP_EXE%" artisan db:seed --class=AdminUserSeeder --force >nul 2>&1

echo Starting app server...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$p = Start-Process -FilePath '%PHP_EXE%' -ArgumentList '-S','%APP_HOST%:%APP_PORT%','-t','%APP_PUBLIC%','%APP_ROUTER%' -WorkingDirectory '%APP_DIR%' -WindowStyle Hidden -PassThru; Set-Content -Path '%PID_FILE%' -Value $p.Id -Encoding ascii -NoNewline"

timeout /t 2 /nobreak >nul
start "" "%APP_URL%"
echo App started successfully at %APP_URL%
exit /b 0
