# EXE Distribution

- Build command:
  - `powershell -ExecutionPolicy Bypass -File Build-PortableExe.ps1`
- Output file:
  - `dist/ebda3Academy.exe`

## What this EXE does

- Extracts app files to:
  - `%LOCALAPPDATA%\ebda3Academy`
- Starts the system using:
  - `ebda3Academy.bat`

## For your client

- Send only `dist/ebda3Academy.exe`.
- Client runs the EXE as normal.
