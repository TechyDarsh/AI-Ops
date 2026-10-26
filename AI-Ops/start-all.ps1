# AI-Ops Master PowerShell Starter
$Host.UI.RawUI.WindowTitle = "AI-Ops Master Launcher"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       STARTING ALL AI-OPS INDUSTRIAL SERVICES          " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Spring Boot Backend
Write-Host "[1/5] Starting Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList '/k', 'cd /d C:\Users\darsh\OneDrive\Desktop\desk\Project\aiops-backend && mvn spring-boot:run'

# 2. Edge Gateway
Write-Host "[2/5] Starting Edge Gateway (Port 8081)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList '/k', 'cd /d C:\Users\darsh\OneDrive\Desktop\desk\Project\edge-gateway && python gateway.py'

# 3. React Dashboard
Write-Host "[3/5] Starting React Dashboard (Port 5173)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList '/k', 'cd /d C:\Users\darsh\OneDrive\Desktop\desk\Project\ai-ops && npm run dev'

# 4. Mobile Sim Web Server
Write-Host "[4/5] Starting Mobile Sim Web Server (Port 3000)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList '/k', 'cd /d C:\Users\darsh\OneDrive\Desktop\desk\Project\ai-ops-mobile\www && python -m http.server 3000'

# 5. Alert Console
Write-Host "[5/5] Starting Alert Console (Port 6000)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList '/k', 'cd /d C:\Users\darsh\OneDrive\Desktop\desk\Project\ai-ops-mobile\www && python run_server_6000.py'

Write-Host ""
Write-Host "Waiting 6 seconds for servers to initialize..." -ForegroundColor DarkGray
Start-Sleep -Seconds 6

# Open Browsers
Write-Host "[6/6] Launching browser tabs..." -ForegroundColor Green
Start-Process "http://localhost:5173"
Start-Process "http://localhost:3000"
Start-Process "http://localhost:6000"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " All 5 services running in dedicated cmd windows!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
