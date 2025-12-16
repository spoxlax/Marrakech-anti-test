# Startup Script for Antigravity-Kech

Write-Host "Installing root dependencies..." -ForegroundColor Cyan
npm install

Write-Host "Installing service dependencies..." -ForegroundColor Cyan
npm install --workspaces

Write-Host "Launching Services in a new window..." -ForegroundColor Green
# Start the main npm process in a new, persistent PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"
