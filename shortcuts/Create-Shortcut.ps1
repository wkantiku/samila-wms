# SAMILA WMS - Windows PowerShell Shortcut Creator
# วิธีใช้: 
# 1. Save file นี้เป็น Create-Shortcut.ps1
# 2. Run: powershell -ExecutionPolicy Bypass -File Create-Shortcut.ps1
# 3. Shortcut จะ สร้างบน Desktop

param(
    [string]$ShortcutPath = [Environment]::GetFolderPath("Desktop"),
    [string]$AppName = "SAMILA WMS",
    [string]$URL = "http://localhost:3000"
)

# Create WshShell COM object
$WshShell = New-Object -ComObject WScript.Shell

# Shortcut path
$ShortcutFile = Join-Path $ShortcutPath "$AppName.lnk"

# Create shortcut
$Shortcut = $WshShell.CreateShortcut($ShortcutFile)
$Shortcut.TargetPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"  # หรือ "iexplore.exe" สำหรับ IE
$Shortcut.Arguments = $URL
$Shortcut.IconLocation = "C:\Windows\System32\ieframe.dll,0"  # Default browser icon
$Shortcut.Description = "SAMILA Warehouse Management System"
$Shortcut.WorkingDirectory = [Environment]::GetFolderPath("Desktop")
$Shortcut.Save()

Write-Host "✓ Shortcut created successfully: $ShortcutFile" -ForegroundColor Green
Write-Host "Target URL: $URL" -ForegroundColor Cyan
