# ===================================================
# แปลง logo.png -> logo.ico โดยไม่ต้องติดตั้งโปรแกรม
# ใช้ .NET built-in ของ Windows
# ===================================================
# วิธีใช้: คลิกขวา -> Run with PowerShell
# ===================================================

Add-Type -AssemblyName System.Drawing

$PngPath = "$PSScriptRoot\..\FRONTEND\public\logo.png"
$IcoPath = "$PSScriptRoot\..\FRONTEND\public\logo.ico"

if (-not (Test-Path $PngPath)) {
    Write-Host "❌ ไม่พบไฟล์: $PngPath" -ForegroundColor Red
    Read-Host "กด Enter เพื่อปิด"
    exit
}

# โหลด PNG
$png = [System.Drawing.Image]::FromFile((Resolve-Path $PngPath))

# Resize เป็น 256x256 (มาตรฐาน icon)
$bmp = New-Object System.Drawing.Bitmap(256, 256)
$g   = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($png, 0, 0, 256, 256)
$g.Dispose()
$png.Dispose()

# บันทึกเป็น ICO
$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

$fs = [System.IO.File]::OpenWrite($IcoPath)
# ICO header
$writer = New-Object System.IO.BinaryWriter($fs)
$writer.Write([uint16]0)       # Reserved
$writer.Write([uint16]1)       # Type: ICO
$writer.Write([uint16]1)       # Count: 1 image

$imgData = $ms.ToArray()
$dataOffset = 6 + 16           # header + 1 directory entry

# Directory entry
$writer.Write([byte]0)         # Width  (0 = 256)
$writer.Write([byte]0)         # Height (0 = 256)
$writer.Write([byte]0)         # Color count
$writer.Write([byte]0)         # Reserved
$writer.Write([uint16]1)       # Planes
$writer.Write([uint16]32)      # Bit count
$writer.Write([uint32]$imgData.Length)
$writer.Write([uint32]$dataOffset)

# Image data
$writer.Write($imgData)
$writer.Close()
$fs.Close()
$ms.Dispose()

Write-Host ""
Write-Host "✅ แปลงสำเร็จ! บันทึกที่: $IcoPath" -ForegroundColor Green
Write-Host ""
Write-Host "📌 ขั้นตอนต่อไป: รัน create_desktop_shortcut.ps1" -ForegroundColor Cyan
Write-Host ""

Read-Host "กด Enter เพื่อปิด"
