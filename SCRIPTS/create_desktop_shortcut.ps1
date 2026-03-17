# ===================================================
# Samila WMS 3PL — Create Desktop Shortcut
# ===================================================
# วิธีใช้: คลิกขวา -> Run with PowerShell
# ===================================================

$AppUrl    = "http://localhost:3000"
$AppName   = "Samila WMS 3PL"
$IconPath  = "$PSScriptRoot\..\FRONTEND\public\logo.ico"   # ต้องแปลง logo.png -> logo.ico ก่อน
$Fallback  = "$PSScriptRoot\..\FRONTEND\public\logo.png"

# หา Desktop path
$Desktop = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = "$Desktop\$AppName.lnk"

# สร้าง Shortcut
$WShell = New-Object -ComObject WScript.Shell
$SC     = $WShell.CreateShortcut($ShortcutPath)
$SC.TargetPath       = "http://localhost:3000"
$SC.Description      = "Samila WMS 3PL Warehouse Management System"

# ใช้ .ico ถ้ามี ไม่งั้นข้าม (Windows จะใช้ default browser icon)
if (Test-Path $IconPath) {
    $SC.IconLocation = "$IconPath,0"
    Write-Host "✅ ใช้ icon: $IconPath" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  ไม่พบ logo.ico — shortcut จะใช้ icon default" -ForegroundColor Yellow
    Write-Host "   วิธีแก้: แปลง FRONTEND\public\logo.png เป็น logo.ico แล้วรันใหม่" -ForegroundColor Yellow
}

$SC.Save()

Write-Host ""
Write-Host "✅ สร้าง Desktop Shortcut สำเร็จ!" -ForegroundColor Green
Write-Host "   ที่: $ShortcutPath" -ForegroundColor White
Write-Host ""
Write-Host "📌 หมายเหตุ: ต้องเปิด WMS server ก่อนกด shortcut" -ForegroundColor Gray
Write-Host "   npm start  (ใน FRONTEND folder)" -ForegroundColor Gray
Write-Host ""

Read-Host "กด Enter เพื่อปิด"
