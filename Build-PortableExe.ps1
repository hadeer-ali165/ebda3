param(
    [string]$AppName = "ebda3Academy",
    [string]$OutputDir = ".\dist"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$outputPath = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $OutputDir))
$stageRoot = Join-Path $projectRoot ".build-temp"
$payloadRoot = Join-Path $stageRoot "payload"
$supportRoot = Join-Path $stageRoot "support"

if (Test-Path $stageRoot) {
    Remove-Item -Path $stageRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $payloadRoot -Force | Out-Null
New-Item -ItemType Directory -Path $supportRoot -Force | Out-Null
New-Item -ItemType Directory -Path $outputPath -Force | Out-Null

# Minimal runtime set required to run the app without local server installation.
$includeItems = @(
    "app",
    "bootstrap",
    "config",
    "database",
    "public",
    "resources",
    "routes",
    "storage",
    "vendor",
    "runtime",
    "artisan",
    ".env",
    "composer.json",
    "composer.lock",
    "ebda3Academy.bat",
    "StopApp.bat",
    "serve-router.php"
)

foreach ($item in $includeItems) {
    $source = Join-Path $projectRoot $item
    if (-not (Test-Path $source)) {
        throw "Missing required item: $item"
    }

    $dest = Join-Path $payloadRoot $item
    Copy-Item -Path $source -Destination $dest -Recurse -Force
}

$payloadZip = Join-Path $supportRoot "payload.zip"
if (Test-Path $payloadZip) {
    Remove-Item -Path $payloadZip -Force
}

Push-Location $payloadRoot
try {
    # tar.exe is more reliable than Compress-Archive for large Laravel trees.
    & tar.exe -a -c -f $payloadZip *
    if ($LASTEXITCODE -ne 0) {
        throw "tar.exe failed while creating payload.zip"
    }
}
finally {
    Pop-Location
}

$launcherBat = Join-Path $supportRoot "launcher.bat"
@"
@echo off
setlocal
set "TARGET_DIR=%LOCALAPPDATA%\$AppName"

if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Path '%~dp0payload.zip' -DestinationPath '%TARGET_DIR%' -Force"

start "" /D "%TARGET_DIR%" "%TARGET_DIR%\ebda3Academy.bat"
exit /b 0
"@ | Set-Content -Path $launcherBat -Encoding Ascii

$sedPath = Join-Path $supportRoot "package.sed"
$targetExe = [System.IO.Path]::GetFullPath((Join-Path $outputPath "$AppName.exe"))

@"
[Version]
Class=IEXPRESS
SEDVersion=3
[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=0
HideExtractAnimation=1
UseLongFileName=1
InsideCompressed=0
CAB_FixedSize=0
CAB_ResvCodeSigning=0
RebootMode=N
InstallPrompt=
DisplayLicense=
FinishMessage=
TargetName=$targetExe
FriendlyName=$AppName
AppLaunched=cmd /c launcher.bat
PostInstallCmd=<None>
AdminQuietInstCmd=
UserQuietInstCmd=
SourceFiles=SourceFiles
[Strings]
FILE0=launcher.bat
FILE1=payload.zip
[SourceFiles]
SourceFiles0=$supportRoot
[SourceFiles0]
%FILE0%=
%FILE1%=
"@ | Set-Content -Path $sedPath -Encoding Ascii

Start-Process -FilePath "C:\Windows\System32\iexpress.exe" -ArgumentList "/N", "`"$sedPath`"" -Wait -NoNewWindow

if (-not (Test-Path $targetExe)) {
    throw "EXE build failed. Output not found: $targetExe"
}

Write-Host "Done. EXE created at: $targetExe"
