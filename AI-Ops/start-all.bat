@echo off
title AI-Ops Master Launcher
color 0A

echo ========================================================
echo        STARTING ALL AI-OPS INDUSTRIAL SERVICES
echo ========================================================
echo.

:: 1. Start Spring Boot Backend on Port 8080
echo [1/5] Starting Spring Boot Backend (Port 8080)...
start "AI-Ops 1. Spring Boot Backend (Port 8080)" cmd /k "cd /d C:\Users\darsh\OneDrive\Desktop\desk\Project\aiops-backend && mvn spring-boot:run"

:: 2. Start Edge Gateway on Port 8081
echo [2/5] Starting Edge Gateway (Port 8081)...
start "AI-Ops 2. Edge Gateway (Port 8081)" cmd /k "cd /d C:\Users\darsh\OneDrive\Desktop\desk\Project\edge-gateway && python gateway.py"

:: 3. Start React Web Dashboard on Port 5173
echo [3/5] Starting React Dashboard (Port 5173)...
start "AI-Ops 3. React App (Port 5173)" cmd /k "cd /d C:\Users\darsh\OneDrive\Desktop\desk\Project\ai-ops && npm run dev"

:: 4. Start Mobile Simulation Web Server on Port 3000
echo [4/5] Starting Mobile Sim Web Server (Port 3000)...
start "AI-Ops 4. Mobile Sim (Port 3000)" cmd /k "cd /d C:\Users\darsh\OneDrive\Desktop\desk\Project\ai-ops-mobile\www && python -m http.server 3000"

:: 5. Start Alert Observatory Server on Port 6000
echo [5/5] Starting Alert Observatory Console (Port 6000)...
start "AI-Ops 5. Alert Console (Port 6000)" cmd /k "cd /d C:\Users\darsh\OneDrive\Desktop\desk\Project\ai-ops-mobile\www && python run_server_6000.py"

echo.
echo Waiting 6 seconds for servers to initialize...
timeout /t 6 /nobreak >nul

:: 6. Open Dashboards in Default Browser / Chrome
echo [6/6] Opening browser dashboards...
start http://localhost:5173
start http://localhost:3000
start http://localhost:6000

echo.
echo ========================================================
echo  All 5 services have been launched in separate windows!
echo ========================================================
pause
