@echo off
REM Builds "dist\Profile and Task Tracker.exe". Run on a Windows computer with Python installed.
cd /d "%~dp0"
python -m venv build-venv
call build-venv\Scripts\activate
pip install -r requirements.txt pyinstaller
pyinstaller tracker.spec --noconfirm
echo.
echo Done! Give teachers this file:  dist\Profile and Task Tracker.exe
pause
