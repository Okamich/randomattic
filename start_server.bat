@echo off
title Randomattic Local Dev Server
echo ===================================================
echo   Randomattic: Local HTTP Server (Port 8000)
echo ===================================================
echo Opening http://localhost:8000 in your browser...
start http://localhost:8000/
python -m http.server 8000
pause
