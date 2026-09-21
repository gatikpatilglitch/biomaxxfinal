@echo off
title BioMaxxx Local Launcher (No Docker Needed)
echo =========================================================
echo   Starting BioMaxxx Full-Stack Locally (No Docker Required)
echo   - Backend API & WebSockets: http://localhost:5000
echo   - React Vite Frontend:      http://localhost:3000
echo =========================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH.
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Starting Backend API server on port 5000...
start "BioMaxxx Backend" cmd /k "title BioMaxxx Backend (Port 5000) && node server.js"

echo Starting Vite Frontend dev server on port 3000...
start "BioMaxxx Frontend" cmd /k "title BioMaxxx Frontend (Port 3000) && npm.cmd run dev"

echo Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening application in browser...
start http://localhost:3000

echo.
echo BioMaxxx is now running!
echo Keep the two opened terminal windows running while using the app.
echo To stop, simply close the backend and frontend terminal windows.
pause
