@echo off
setlocal enabledelayedexpansion

:: Set source and destination folders
set "SOURCE=C:\Users\godma\flex-o-bot\app"
set "DEST=C:\Users\godma\flex-o-bot\files"

:: Create destination folder if it doesn't exist
if not exist "%DEST%" (
    mkdir "%DEST%"
)

:: Copy all files recursively, flattening the structure
for /R "%SOURCE%" %%F in (*) do (
    set "FILENAME=%%~nxF"
    set "EXT1=!FILENAME:~-7!"
    set "EXT2=!FILENAME:~-13!"

    rem Skip if file ends with .g.dart or .freezed.dart
    if /I not "!EXT1!"==".g.dart" if /I not "!EXT2!"==".freezed.dart" (
        if not exist "%DEST%\%%~nxF" (
            copy "%%F" "%DEST%\%%~nxF" >nul
        ) else (
            set /a RAND=!RANDOM!
            copy "%%F" "%DEST%\%%~nF_!RAND!%%~xF" >nul
        )
    )
)

echo Done copying files.
pause
