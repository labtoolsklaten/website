@echo off
set "PATH=C:\laragon\bin\nodejs\node-v18;%PATH%"
echo Building project...
npm run build
echo Build complete. Move the 'dist' folder contents to your Laragon root if needed.
pause
