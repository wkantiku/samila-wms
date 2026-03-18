@echo off
REM ============================================================
REM SAMILA WMS - Windows Desktop Shortcut with SAMILA Logo
REM Logo: SAMILA Innovation (Nayong Hospital)
REM ============================================================

setlocal
set TITLE=SAMILA Warehouse Management System
set FRONTEND_URL=http://localhost:3000
set BACKEND_URL=http://localhost:8000
set API_DOCS=http://localhost:8000/api/docs

REM Set console colors
color 0B
cls

REM Display Logo
echo.
echo   ███████╗ █████╗ ███╗   ███╗██╗██╗      █████╗ 
echo   ██╔════╝██╔══██╗████╗ ████║██║██║     ██╔══██╗
echo   ███████╗███████║██╔████╔██║██║██║     ███████║
echo   ╚════██║██╔══██║██║╚██╔╝██║██║██║     ██╔══██║
echo   ███████║██║  ██║██║ ╚═╝ ██║██║███████╗██║  ██║
echo   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚══════╝╚═╝  ╚═╝
echo.
echo   Warehouse Management System v1.0.0
echo   ══════════════════════════════════════
echo.
echo   🚀 Opening SAMILA WMS...
echo.

REM Open Frontend in default browser
start %FRONTEND_URL%

REM Wait and show info
timeout /t 2 /nobreak

echo.
echo   ✓ SAMILA WMS is loading...
echo   ✓ Frontend:   %FRONTEND_URL%
echo   ✓ Backend:    %BACKEND_URL%
echo   ✓ API Docs:   %API_DOCS%
echo.

endlocal
