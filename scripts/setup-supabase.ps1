# Usage: run from project root after creating a Supabase project
#   .\scripts\setup-supabase.ps1 -DbHost "db.xxxxx.supabase.co" -DbPassword "your-password"

param(
    [Parameter(Mandatory = $true)]
    [string]$DbHost,

    [Parameter(Mandatory = $true)]
    [string]$DbPassword,

    [string]$DbDatabase = "postgres",
    [string]$DbUsername = "postgres",
    [int]$DbPort = 5432
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$php = if (Test-Path ".\runtime\php\php.exe") { ".\runtime\php\php.exe" } else { "php" }

if (-not (Test-Path ".\.env")) {
    Copy-Item ".\.env.example" ".\.env"
    & $php artisan key:generate --force
}

function Set-EnvLine($key, $value) {
    $path = ".\.env"
    $line = "$key=$value"
    if (Select-String -Path $path -Pattern "^$key=" -Quiet) {
        (Get-Content $path) -replace "^$key=.*", $line | Set-Content $path
    } else {
        Add-Content $path $line
    }
}

Set-EnvLine "DB_CONNECTION" "pgsql"
Set-EnvLine "DB_HOST" $DbHost
Set-EnvLine "DB_PORT" $DbPort
Set-EnvLine "DB_DATABASE" $DbDatabase
Set-EnvLine "DB_USERNAME" $DbUsername
Set-EnvLine "DB_PASSWORD" $DbPassword

Write-Host "Installing PHP dependencies..." -ForegroundColor Cyan
if (-not (Test-Path ".\vendor")) {
    composer install --no-interaction --prefer-dist
}

Write-Host "Building frontend..." -ForegroundColor Cyan
if (-not (Test-Path ".\node_modules")) {
    npm ci
}
npm run build

Write-Host "Running migrations on Supabase..." -ForegroundColor Cyan
& $php artisan config:clear
& $php artisan migrate --force
& $php artisan db:seed --class=AdminUserSeeder --force

Write-Host ""
Write-Host "Done! Database is ready on Supabase." -ForegroundColor Green
Write-Host "Admin login: admin@system.local / Admin@123456" -ForegroundColor Yellow
