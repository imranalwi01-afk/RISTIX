@echo off
setlocal
TITLE IFRS9 R ANALYTICS - LOCAL (PORTS 4236 / 4241)
ECHO ========================================================
ECHO    IFRS9 R ANALYTICS LOCAL RUNNER
ECHO ========================================================
ECHO.
ECHO This script runs the R Analytics module natively on Windows.
ECHO ensure you have R installed and added to your PATH.
ECHO.

set "SCRIPT_DIR=%~dp0"
set "DASHBOARD_DIR=%SCRIPT_DIR%packages\r-analytics\shiny-app"
set "API_DIR=%SCRIPT_DIR%packages\r-analytics"

cd /d "%DASHBOARD_DIR%"

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
ECHO [*] Installing missing dependencies and starting services...
ECHO [*] Database Target: 10.8.0.2 (VPN Required)
ECHO [*] Dashboard Port: 4236
ECHO [*] API Port: 4241
ECHO.

IF EXIST "%API_DIR%\start_api.R" (
    ECHO [*] Starting R Analytics API service in a new window...
    start "IFRS9 R ANALYTICS API (4241)" cmd /k "cd /d ""%API_DIR%"" && set R_SERVICE_PORT=4241 && Rscript start_api.R"
) ELSE (
    ECHO [WARNING] start_api.R not found at: %API_DIR%
    ECHO [WARNING] API service was not started.
)

ECHO [*] Starting R Analytics Dashboard (Monolithic app37.R)...
set "R_PORT=4236"
Rscript run_local.R

endlocal
PAUSE
