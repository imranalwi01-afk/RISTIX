@echo off
TITLE IFRS9 R ANALYTICS - LOCAL (PORT 4236)
ECHO ========================================================
ECHO    IFRS9 R ANALYTICS LOCAL RUNNER
ECHO ========================================================
ECHO.
ECHO This script runs the R Analytics module natively on Windows.
ECHO ensure you have R installed and added to your PATH.
ECHO.

cd packages\r-analytics\shiny-app

REM Check if R is installed
WHERE Rscript >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    ECHO [WARNING] Rscript not found in system PATH.
    ECHO Searching in default directories...
    
    REM Try to find R in Program Files
    FOR /D %%D IN ("C:\Program Files\R\*") DO (
        IF EXIST "%%D\bin\Rscript.exe" (
            ECHO Found R at: %%D
            SET "PATH=%%D\bin;%PATH%"
            GOTO FOUND_R
        )
    )

    ECHO [ERROR] Rscript still not found! 
    ECHO Please install R from https://cloud.r-project.org/
    ECHO Or manually add your R bin folder to the System PATH.
    ECHO Example: C:\Program Files\R\R-4.x.x\bin
    PAUSE
    EXIT /B 1
)

:FOUND_R
ECHO [*] R Detected!
ECHO [*] Installing missing dependencies and starting App...
ECHO [*] Database Target: 10.8.0.2 (VPN Required)
ECHO [*] Port: 4236
ECHO.

Rscript run_local.R

PAUSE
