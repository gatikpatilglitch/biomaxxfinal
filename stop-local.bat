@echo off
echo Stopping BioMaxxx local services...
taskkill /fi "windowtitle eq BioMaxxx Backend*" /t /f >nul 2>nul
taskkill /fi "windowtitle eq BioMaxxx Frontend*" /t /f >nul 2>nul
echo Done. All BioMaxxx local windows closed.
pause
