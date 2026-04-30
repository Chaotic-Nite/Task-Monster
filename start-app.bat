@echo off
echo Starting Task Monster Full Stack Application...
echo.

echo Starting Backend Server...
start cmd /k "cd /d %~dp0task-monster-backend && npm start"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start cmd /k "cd /d %~dp0task-monster && npm start"

echo.
echo Both servers are starting up!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul