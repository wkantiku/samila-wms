# SAMILA WMS - Desktop & Mobile Shortcuts Guide

**สร้างเสร็จแล้ว** - Desktop Shortcuts + Mobile Shortcuts ทั้งหมด ✅

---

## 📁 Shortcuts Folder Structure

```
shortcuts/
├── SAMILA_WMS.bat                    # Windows Desktop Shortcut
├── SAMILA_WMS.desktop                # Linux Desktop Shortcut
├── SAMILA_WMS.webloc                 # macOS Web Shortcut
├── SAMILA_WMS.html                   # Universal HTML Shortcut
├── iOS_Shortcut_Setup.md             # iOS Setup Guide
├── Android_Shortcut_Setup.md         # Android Setup Guide
└── README_Shortcuts.md               # This file
```

---

## 🖥️ PC SHORTCUTS (Desktop)

### **For Windows Users**

**File**: `SAMILA_WMS.bat`

**วิธีสร้าง Desktop Shortcut**:

1. **ดาวน์โหลด/Copy** `SAMILA_WMS.bat`
2. **วางบน Desktop** หรือโฟลเดอร์ที่ต้องการ
3. **Double-click** เพื่อเปิด SAMILA WMS

**ทำได้อีกวิธี**:
```batch
@echo off
start http://localhost:3000
pause
```
บันทึกเป็น `Open_SAMILA_WMS.bat`

**สร้าง Shortcut ขั้นสูง**:
1. Right-click ที่ `SAMILA_WMS.bat`
2. "Create shortcut"
3. Rename: `SAMILA WMS`
4. Right-click → Properties
5. Advance → "Run as administrator" (ถ้าต้องการ)

---

### **For Linux Users**

**File**: `SAMILA_WMS.desktop`

**วิธีติดตั้ง**:

```bash
# Copy ไปยัง Applications directory
cp SAMILA_WMS.desktop ~/.local/share/applications/

# ให้ executable permissions
chmod +x ~/.local/share/applications/SAMILA_WMS.desktop

# Update desktop database
update-desktop-database ~/.local/share/applications
```

**ผลที่ได้**:
- ปรากฏใน Applications Menu
- Right-click Desktop → Applications → SAMILA WMS
- สามารถ Drag ลงมา Desktop ได้

**Manual วิธี**:
```bash
# สร้าง Shortcut บน Desktop
nano ~/Desktop/SAMILA_WMS.desktop
# Copy-paste content จาก SAMILA_WMS.desktop
chmod +x ~/Desktop/SAMILA_WMS.desktop
```

---

### **For macOS Users**

**File**: `SAMILA_WMS.webloc`

**วิธีติดตั้ง**:

1. **Copy** `SAMILA_WMS.webloc` ไปยัง Desktop หรือ Applications Folder
2. **Double-click** จะเปิด Safari โดยอัตโนมัติ
3. หรือ **Drag to Dock** เพื่อเพิ่ม Quick Access

**สร้าง Shortcut อื่นวิธี**:
```bash
# Terminal
open "http://localhost:3000"

# หรือสร้าง Automator script
# Open Automator → New → Quick Action
# Add action: Open URL
# URL: http://localhost:3000
# File > Save (name: SAMILA WMS)
```

---

### **Universal HTML Shortcut (All Platforms)**

**File**: `SAMILA_WMS.html`

**วิธีใช้**:

1. **ดาวน์โหลด** `SAMILA_WMS.html`
2. **Double-click** จะเปิดในเบราว์เซอร์ default
3. ปรากฏหน้า Dashboard ที่สวย ✨

**Features**:
- 🌐 One-click access to Frontend
- ⚙️ Quick link to Backend API
- 📚 API Documentation
- 📨 RabbitMQ Management
- 📋 Quick Reference Guide

**Bookmarks/Favorites**:
```
Windows: Ctrl+D (Chrome/Firefox)
Mac:     Cmd+D (Safari/Chrome)
Linux:   Ctrl+D (Chrome/Firefox)
```

---

## 📱 MOBILE SHORTCUTS

### **For iPhone/iPad (iOS)**

**File**: `iOS_Shortcut_Setup.md`

**วิธีสร้าง**:

1. **ติดตั้ง Shortcuts App** (ติดมากับ iOS อยู่แล้ว)
2. **Tap "+"** → Create Shortcut
3. **Add Action**:
   - Search: "Open URLs"
   - URL: `http://your-server-ip:3000`
4. **ตั้งชื่อ**: SAMILA WMS
5. **เลือก Icon**: แตะ Icon → Select Photo → ไฟล์ Logo
6. **Tap "Done"**

**Add to Home Screen**:
1. เปิด Shortcut
2. Tap "⋮" (Menu)
3. "Add to Home Screen"
4. ตั้งชื่อและเลือก Icon
5. Tap "Add"

**PWA Method (ง่ายสุด)**:
1. เปิด Safari → `http://your-server-ip:3000`
2. Tap "Share" → "Add to Home Screen"
3. ตั้งชื่อ: SAMILA WMS
4. Tap "Add"

---

### **For Android Devices**

**File**: `Android_Shortcut_Setup.md`

**วิธีสร้าง (เร็วสุด)**:

1. **เปิด Chrome Browser**
2. เข้า `http://your-server-ip:3000`
3. Tap "⋮" (Menu) → "Add to Home screen"
4. ตั้งชื่อ: SAMILA WMS
5. Tap "Install"

**Advanced Methods**:
- ใช้ Google Assistant Routines
- ใช้ Samsung Bixby
- ใช้ Tasker App
- ใช้ NFC Tags

**ทำให้ PWA (Progressive Web App)**:
1. Frontend ต้อง Manifest ไฟล์ (อ่านเพิ่มเติม docs)
2. สร้าง `public/manifest.json`:
```json
{
  "name": "SAMILA WMS",
  "short_name": "SAMILA",
  "start_url": "/",
  "display": "standalone",
  "icons": [
    {
      "src": "samila_logo.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

---

## 🎯 Quick Setup Summary

### **Windows PC**
```
1. Double-click: SAMILA_WMS.bat
   หรือ
2. Open: SAMILA_WMS.html ในเบราว์เซอร์
```

### **Linux PC**
```
1. Double-click: SAMILA_WMS.desktop
   หรือ
2. Open: SAMILA_WMS.html ในเบราว์เซอร์
```

### **macOS**
```
1. Double-click: SAMILA_WMS.webloc
   หรือ
2. Open: SAMILA_WMS.html ในเบราว์เซอร์
```

### **iPhone/iPad**
```
วิธี 1 (ง่าย): PWA
- เปิด Safari → ที่ localhost:3000
- Share → Add to Home Screen

วิธี 2: Shortcuts App
- สร้าง Shortcut ตามขั้นตอน iOS_Shortcut_Setup.md
```

### **Android Phone/Tablet**
```
วิธี 1 (ง่าย): Chrome PWA
- เปิด Chrome → ที่ localhost:3000
- Menu → Add to Home screen

วิธี 2: Advanced
- ตามขั้นตอน Android_Shortcut_Setup.md
```

---

## 🔗 Network Configuration

### **For Local Network (Same Device)**
```
Frontend URL: http://localhost:3000
Backend URL: http://localhost:8000
```

### **For Network Access (Other Devices)**
```
Windows:
- Find IP: ipconfig (cmd) → IPv4 Address
- URL: http://192.168.x.x:3000

Mac/Linux:
- Find IP: ifconfig หรือ hostname -I
- URL: http://192.168.x.x:3000

Android/iOS:
- URL: http://192.168.x.x:3000
- Port: 3000 for Frontend, 8000 for Backend
```

### **Using Reverse Proxy (Recommended)**
```
Frontend: http://samila-wms.local/
Backend:  http://samila-wms.local/api/
```

---

## 🎨 Customization

### **Change Icon**
- Windows: Edit `.bat` file
- Linux: Edit `.desktop` file
- macOS: Double-click `.webloc` → Properties
- HTML: Replace logo URL in `SAMILA_WMS.html`

### **Change URL**
- Windows: Edit `SAMILA_WMS.bat` เปลี่ยน URL
- Linux: Edit `SAMILA_WMS.desktop` เปลี่ยน URL
- macOS: Edit `SAMILA_WMS.webloc` เปลี่ยน URL
- HTML: Edit `SAMILA_WMS.html` เปลี่ยน URL

### **Add to Cloud Sync**
- Save `SAMILA_WMS.html` ใน Google Drive/OneDrive
- Access from anywhere ได้

---

## 🚀 Keyboard Shortcuts

### **บน SAMILA_WMS.html Page**

| Key | Action |
|-----|--------|
| **1** | Open Frontend (localhost:3000) |
| **2** | Open Backend (localhost:8000) |
| **3** | Open API Docs (localhost:8000/api/docs) |

---

## ✅ Troubleshooting

### **Shortcut doesn't open**

**Windows**:
```bash
# ตรวจสอบบริการ
services.msc
# หา: Apache/Node.js/Python
# ให้ Start
```

**macOS/Linux**:
```bash
# ทำให้ executable
chmod +x SAMILA_WMS.desktop
chmod +x SAMILA_WMS.webloc
```

### **URL not accessible**

```bash
# ตรวจสอบ Backend/Frontend กำลังทำงาน
netstat -an | grep 3000
netstat -an | grep 8000

# ถ้าไม่เห็น ให้เริ่มต้น Services
cd Backend && python main.py
cd Frontend && npm start
```

### **Browser says "Cannot reach server"**

1. ตรวจสอบ IP Address ถูกต้องหรือไม่
2. ตรวจสอบ Firewall ไม่ block port
3. ตรวจสอบ Backend/Frontend กำลังทำงาน

```bash
# Test connectivity
curl http://localhost:3000
curl http://localhost:8000
```

---

## 📊 Files Summary

| File | Type | OS | Size |
|------|------|-----|------|
| SAMILA_WMS.bat | Batch Script | Windows | 0.2 KB |
| SAMILA_WMS.desktop | Desktop Entry | Linux | 0.3 KB |
| SAMILA_WMS.webloc | Web Link | macOS | 0.2 KB |
| SAMILA_WMS.html | HTML Page | All | 8 KB |
| iOS_Shortcut_Setup.md | Guide | iOS | 2 KB |
| Android_Shortcut_Setup.md | Guide | Android | 3 KB |

---

## 🎯 Recommended Setup

### **ที่ดีสุด = Universal HTML**
```
ใช้: SAMILA_WMS.html
- ทำงานบนทุก Platform
- ไม่ต้องติดตั้งอะไร
- สามารถ Bookmark ได้
- Full Dashboard ของ Services
```

### **ที่สะดวกสุด = PWA (Progressive Web App)**
```
ใช้วิธี: "Add to Home Screen"
- ทำงานเหมือน Native App
- Offline support
- Fast loading
- ทั้ง iOS และ Android
```

### **Professional = Deployed Domain**
```
ใช้: Custom Domain
- https://samila-wms.yourdomain.com
- SSL Certificate
- Professional look
- Shareable links
```

---

## 📞 Support

- **Windows Issue**: ดู SAMILA_WMS.bat comments
- **Linux Issue**: ดู SAMILA_WMS.desktop comments
- **macOS Issue**: ดู SAMILA_WMS.webloc comments
- **Mobile Issue**: ดู iOS_Shortcut_Setup.md หรือ Android_Shortcut_Setup.md
- **General Issue**: ดู INSTALLATION.md

---

**Status**: ✅ **Ready to Use**

**Version**: 1.0.0  
**Date**: 2026-03-02  
**For**: SAMILA WMS Project
