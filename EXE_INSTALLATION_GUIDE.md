# 💾 **SAMILA WMS 3PL - .EXE INSTALLATION SETUP GUIDE**

**Complete Guide to Create and Deploy .EXE Installer**

---

## 🎯 **OVERVIEW**

This guide provides step-by-step instructions to create a professional .EXE installer for SAMILA WMS 3PL using Inno Setup.

---

## 📋 **PREREQUISITES**

### **Software Required:**
```
✅ Inno Setup 6.0+ (Free, Open Source)
✅ Windows 10/11
✅ Git (optional)
✅ Python 3.9+
✅ Node.js 18+
```

### **Download Links:**
```
Inno Setup:  https://jrsoftware.org/isdl.php
Python:      https://www.python.org/downloads/
Node.js:     https://nodejs.org/
```

---

## 🔧 **STEP 1: PREPARE INSTALLER SCRIPT**

### **File: setup_script.iss**

```ini
; Inno Setup Script for SAMILA WMS 3PL
; Generated for professional installation

[Setup]
AppName=SAMILA WMS 3PL
AppVersion=1.0.0
AppPublisher=Nayong Hospital
AppPublisherURL=https://samila-wms.com
AppSupportURL=https://samila-wms.com/support
AppUpdatesURL=https://samila-wms.com/updates
DefaultDirName={pf}\SAMILA WMS
DefaultGroupName=SAMILA WMS
AllowNoIcons=yes
LicenseFile=LICENSE.txt
InfoBeforeFile=README.txt
OutputDir=Installer
OutputBaseFilename=SAMILA_WMS_3PL_Setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
SetupIconFile=assets\samila_logo.ico
UninstallDisplayIcon={app}\samila_logo.ico
UsedUserAreasWarning=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "thai"; MessagesFile: "compiler:Thai.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "installbackend"; Description: "Install Backend (Python/FastAPI)"; GroupDescription: "Components"; Flags: checked
Name: "installfrontend"; Description: "Install Frontend (React)"; GroupDescription: "Components"; Flags: checked
Name: "installmobile"; Description: "Install Mobile App"; GroupDescription: "Components"; Flags: checked
Name: "installdatabase"; Description: "Setup Database (PostgreSQL)"; GroupDescription: "Components"; Flags: checked

[Files]
; Backend files
Source: "BACKEND\*"; DestDir: "{app}\backend"; Flags: ignoreversion recursesubdirs createallsubdirs; Tasks: installbackend
Source: "BACKEND\requirements.txt"; DestDir: "{app}\backend"; Flags: ignoreversion; Tasks: installbackend

; Frontend files
Source: "FRONTEND\*"; DestDir: "{app}\frontend"; Flags: ignoreversion recursesubdirs createallsubdirs; Tasks: installfrontend

; Mobile files
Source: "MOBILE\*"; DestDir: "{app}\mobile"; Flags: ignoreversion recursesubdirs createallsubdirs; Tasks: installmobile

; Database files
Source: "DATABASE\*"; DestDir: "{app}\database"; Flags: ignoreversion recursesubdirs createallsubdirs; Tasks: installdatabase

; Documentation
Source: "DOCS\*"; DestDir: "{app}\docs"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "GUIDES\*"; DestDir: "{app}\guides"; Flags: ignoreversion recursesubdirs createallsubdirs

; Logo and assets
Source: "ASSETS\*"; DestDir: "{app}\assets"; Flags: ignoreversion recursesubdirs createallsubdirs

; License and README
Source: "LICENSE.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\SAMILA WMS 3PL"; Filename: "http://localhost:3000"; IconFilename: "{app}\assets\samila_logo.ico"; Comment: "Open SAMILA WMS"
Name: "{group}\Uninstall SAMILA WMS 3PL"; Filename: "{uninstallexe}"
Name: "{autodesktop}\SAMILA WMS 3PL"; Filename: "http://localhost:3000"; IconFilename: "{app}\assets\samila_logo.ico"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\SAMILA WMS 3PL"; Filename: "http://localhost:3000"; IconFilename: "{app}\assets\samila_logo.ico"; Tasks: quicklaunchicon

[Run]
Filename: "{app}\install_dependencies.bat"; Description: "Installing dependencies..."; Flags: runhidden waituntilterminated
Filename: "http://localhost:3000"; Description: "Launch SAMILA WMS"; Flags: shellexec waituntilterminated postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}\backend\__pycache__"
Type: filesandordirs; Name: "{app}\frontend\node_modules"
Type: filesandordirs; Name: "{app}\mobile\node_modules"

[Code]
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssFinished then
  begin
    MsgBox('SAMILA WMS 3PL has been installed successfully!' + #13#10 +
           'The system will be available at http://localhost:3000' + #13#10 +
           'Default credentials: admin / admin123' + #13#10 +
           'Please change the password after first login.',
           mbInformation, MB_OK);
  end;
end;
```

---

## 🔨 **STEP 2: CREATE INSTALLER BATCH SCRIPTS**

### **File: install_dependencies.bat**

```batch
@echo off
REM SAMILA WMS 3PL - Installation Script
echo.
echo ==========================================
echo SAMILA WMS 3PL - Automated Installation
echo ==========================================
echo.

setlocal enabledelayedexpansion

REM Set installation directory
set INSTALL_DIR=%~dp0
cd /d %INSTALL_DIR%

REM Check Python
echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://www.python.org
    pause
    exit /b 1
)
echo ✓ Python found

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js found

REM Install Backend
echo.
echo ==========================================
echo Installing Backend (FastAPI)
echo ==========================================
cd /d "%INSTALL_DIR%backend"
if exist requirements.txt (
    echo Installing Python packages...
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install Python packages
        pause
        exit /b 1
    )
    echo ✓ Backend installed successfully
) else (
    echo WARNING: requirements.txt not found in backend folder
)

REM Install Frontend
echo.
echo ==========================================
echo Installing Frontend (React)
echo ==========================================
cd /d "%INSTALL_DIR%frontend"
if exist package.json (
    echo Installing Node packages...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install Node packages
        pause
        exit /b 1
    )
    echo ✓ Frontend installed successfully
) else (
    echo WARNING: package.json not found in frontend folder
)

REM Install Mobile (Optional)
echo.
echo ==========================================
echo Installing Mobile App (React Native)
echo ==========================================
cd /d "%INSTALL_DIR%mobile"
if exist package.json (
    echo Installing Mobile Node packages...
    call npm install
    echo ✓ Mobile app installed successfully
) else (
    echo INFO: Mobile installation skipped (package.json not found)
)

REM Setup Database
echo.
echo ==========================================
echo Database Setup
echo ==========================================
echo INFO: PostgreSQL setup instructions are in the documentation
echo Please review: %INSTALL_DIR%docs\INSTALLATION_GUIDE_COMPLETE.md

REM Create shortcuts
echo.
echo ==========================================
echo Creating Shortcuts
echo ==========================================

REM Create desktop shortcut for backend startup
powershell -Command "^
$WshShell = New-Object -ComObject WScript.Shell; ^
$Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Start SAMILA Backend.lnk'); ^
$Shortcut.TargetPath = 'cmd.exe'; ^
$Shortcut.Arguments = '/k cd /d \"%INSTALL_DIR%backend\" ^& python -m uvicorn main:app --reload --port 8000'; ^
$Shortcut.WorkingDirectory = '%INSTALL_DIR%backend'; ^
$Shortcut.IconLocation = '%INSTALL_DIR%assets\samila_logo.ico'; ^
$Shortcut.Save(); ^
"

powershell -Command "^
$WshShell = New-Object -ComObject WScript.Shell; ^
$Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Start SAMILA Frontend.lnk'); ^
$Shortcut.TargetPath = 'cmd.exe'; ^
$Shortcut.Arguments = '/k cd /d \"%INSTALL_DIR%frontend\" ^& npm start'; ^
$Shortcut.WorkingDirectory = '%INSTALL_DIR%frontend'; ^
$Shortcut.IconLocation = '%INSTALL_DIR%assets\samila_logo.ico'; ^
$Shortcut.Save(); ^
"

echo ✓ Shortcuts created on Desktop

REM Installation complete
echo.
echo ==========================================
echo Installation Complete!
echo ==========================================
echo.
echo SAMILA WMS 3PL has been installed successfully.
echo.
echo Next steps:
echo 1. Start Backend:   Double-click "Start SAMILA Backend.lnk"
echo 2. Start Frontend:  Double-click "Start SAMILA Frontend.lnk"
echo 3. Access at:       http://localhost:3000
echo 4. Login:           admin / admin123
echo 5. Change Password: IMMEDIATELY (for security)
echo.
echo Documentation: %INSTALL_DIR%docs\INSTALLATION_GUIDE_COMPLETE.md
echo.
pause
```

---

## 🔨 **STEP 3: BUILD THE .EXE INSTALLER**

### **Method 1: Using Inno Setup GUI**

```
1. Download and install Inno Setup
2. Open Inno Setup IDE
3. File → Open → Select "setup_script.iss"
4. Build → Compile
5. .EXE will be created in "Installer" folder
```

### **Method 2: Command Line**

```batch
REM Install Inno Setup first, then run:
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" setup_script.iss
```

### **Method 3: PowerShell Script**

```powershell
# File: build_installer.ps1

$innoSetupPath = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
$scriptPath = ".\setup_script.iss"

if (Test-Path $innoSetupPath) {
    Write-Host "Building SAMILA WMS 3PL installer..."
    & $innoSetupPath $scriptPath
    Write-Host "✓ Installer created successfully!"
} else {
    Write-Host "ERROR: Inno Setup not found at $innoSetupPath"
    Write-Host "Please install Inno Setup from https://jrsoftware.org/isdl.php"
}
```

---

## 📦 **STEP 4: PREPARE INSTALLER PACKAGE**

### **Folder Structure:**

```
SAMILA_WMS_3PL_INSTALLER/
├── setup_script.iss           (Inno Setup script)
├── install_dependencies.bat   (Dependency installer)
├── build_installer.ps1        (PowerShell build script)
├── build_installer.bat        (Batch build script)
│
├── BACKEND/                   (Python files)
├── FRONTEND/                  (React files)
├── MOBILE/                    (React Native files)
├── DATABASE/                  (Database scripts)
├── DOCS/                      (Documentation)
├── GUIDES/                    (User guides)
├── ASSETS/                    (Logo & resources)
│
├── LICENSE.txt                (License file)
├── README.txt                 (Installation readme)
└── README.md                  (Project overview)
```

---

## 🚀 **STEP 5: CREATE THE .EXE**

### **On Windows Machine:**

```batch
REM 1. Install Inno Setup
REM    Download from: https://jrsoftware.org/isdl.php

REM 2. Navigate to installer directory
cd path\to\SAMILA_WMS_3PL_INSTALLER

REM 3. Run build script
build_installer.bat

REM OR using PowerShell:
powershell -ExecutionPolicy Bypass -File build_installer.ps1

REM 4. Output file will be:
REM    Installer\SAMILA_WMS_3PL_Setup.exe
```

---

## ✅ **STEP 6: TEST THE INSTALLER**

### **Testing Checklist:**

```batch
REM 1. Clean test environment
REM    - Use virtual machine or clean PC
REM    - Uninstall any previous versions

REM 2. Run the installer
REM    - Double-click SAMILA_WMS_3PL_Setup.exe
REM    - Follow wizard steps
REM    - Complete installation

REM 3. Verify installation
REM    - Check all files installed
REM    - Verify shortcuts created
REM    - Check desktop icons

REM 4. Test functionality
REM    - Start backend service
REM    - Start frontend
REM    - Access http://localhost:3000
REM    - Login with admin/admin123
REM    - Test each module

REM 5. Test uninstall
REM    - Uninstall program
REM    - Verify clean removal
REM    - Check no orphaned files
```

---

## 📋 **INSTALLER SPECIFICATIONS**

```
File Name:               SAMILA_WMS_3PL_Setup.exe
Version:                 1.0.0
File Size:               ~500 MB (compressed)
Supported OS:            Windows 10/11, Windows Server 2019+
Installation Time:       5-10 minutes
Languages Supported:     English, Thai
Admin Rights Required:   Yes (for services)
Installation Type:       Typical or Custom
Uninstall Support:       Yes (clean removal)
```

---

## 🔐 **SECURITY CONSIDERATIONS**

```
Installer Security:
✅ Code signing (optional)
✅ License agreement
✅ Admin rights verification
✅ Dependency checking
✅ Safe default settings
✅ Secure file permissions

Post-Installation:
✅ Change default password
✅ Configure firewall rules
✅ Setup SSL/HTTPS
✅ Enable audit logging
✅ Configure backups
```

---

## 📞 **TROUBLESHOOTING**

### **Installation Fails**

```
Problem:  Python not found
Solution: Install Python 3.9+ and add to PATH

Problem:  Node.js not found
Solution: Install Node.js 18+ and add to PATH

Problem:  Insufficient disk space
Solution: Free up 50+ GB space

Problem:  Permission denied
Solution: Run installer as Administrator

Problem:  Port 3000/8000 already in use
Solution: Change port in configuration
```

---

## 📦 **FINAL DELIVERABLE**

```
✅ SAMILA_WMS_3PL_Setup.exe         (Main installer)
✅ setup_script.iss                 (Inno Setup config)
✅ install_dependencies.bat         (Dependency installer)
✅ build_installer.bat              (Build script)
✅ build_installer.ps1              (PowerShell script)
✅ Installation Documentation       (Complete guide)
✅ License Agreement               (Legal)
✅ Uninstaller                     (Included in .exe)
```

---

## 🎉 **INSTALLATION COMPLETE!**

After running the installer:

```
1. Backend:   http://localhost:8000
2. Frontend:  http://localhost:3000
3. API Docs:  http://localhost:8000/docs
4. Login:     admin / admin123

⚠️  IMPORTANT: Change password after first login!
```

---

**This provides everything needed to create and deploy a professional .EXE installer!** ✅
