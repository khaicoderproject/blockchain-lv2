@echo off
echo ========================================
echo Blockchain Product Authentication System
echo ========================================
echo.
echo Contract Address: 0x2a3d836D824fc45Abd3dCa9124E9bb69b80D1b46
echo Network ID: 5777 (Ganache)
echo.
echo Stopping any running processes...
taskkill /f /im node.exe 2>nul
echo.
echo Clearing cache...
cd frontend
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo.
echo Starting frontend...
echo.
echo Please make sure:
echo 1. Ganache is running on port 7545
echo 2. Metamask is connected to Ganache (Network ID: 5777)
echo 3. Contract is deployed at the address above
echo.
npm start 