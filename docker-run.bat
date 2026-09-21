@echo off
echo =========================================================
echo   Starting BioMaxxx Full-Stack Cluster in Docker
echo   (PostgreSQL 16 + Express API + React Nginx SPA)
echo =========================================================

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in your PATH.
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    echo and ensure Docker Desktop is running before launching this script.
    pause
    exit /b 1
)

echo Building and starting containers in background...
docker compose up --build -d

if %errorlevel% equ 0 (
    echo.
    echo =========================================================
    echo   BioMaxxx Cluster is now running successfully!
    echo.
    echo   - Frontend App:   http://localhost:3000
    echo   - Backend API:    http://localhost:5000
    echo   - PostgreSQL DB:  localhost:5432 (biomaxxx)
    echo =========================================================
    echo.
    echo Opening application in browser...
    start http://localhost:3000
) else (
    echo [ERROR] Failed to start Docker Compose cluster.
)

pause
