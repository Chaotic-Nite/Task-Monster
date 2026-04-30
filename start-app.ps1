# PowerShell script to start both frontend and backend
Write-Host "Starting Task Monster Full Stack Application..." -ForegroundColor Green
Write-Host ""

# Start backend in background
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location "$PSScriptRoot\task-monster-backend"
    npm start
}

# Wait a moment for backend to initialize
Start-Sleep -Seconds 3

# Start frontend in background
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "$PSScriptRoot\task-monster"
    npm start
}

Write-Host ""
Write-Host "Both servers are starting up!" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Red

# Wait for user to stop
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Job $backendJob
    Stop-Job $frontendJob
    Remove-Job $backendJob
    Remove-Job $frontendJob
}