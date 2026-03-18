# SAMILA WMS - Android Shortcut
# วิธีใช้: สร้าง Shortcut บน Android Device

## วิธีสร้าง Android Shortcut:

### ด้วย Google Assistant / Google Tasks

1. **เปิด Google Assistant**
2. **Tap "Routines"**
3. **Tap "+" (Create Routine)**
4. **ตั้งชื่อ**: Open SAMILA WMS
5. **Tap "Add Action"**
6. **ค้นหา**: Open a web page
7. **ใส่ URL**: http://your-server-ip:3000
8. **Save**

### ด้วย Samsung Bixby (Samsung Devices)

1. **เปิด Bixby**
2. **Tap "Routines"**
3. **Tap "+"**
4. **ตั้งชื่อ**: SAMILA WMS
5. **Add Shortcut → Open App/Web**
6. **ใส่ URL**
7. **Save**

### ด้วย Android Shortcuts App (Android 7.1+)

1. **ติดตั้ง Tasker หรือ Shortcut Maker** จาก Play Store
2. **สร้าง New Shortcut**
3. **Action**: Open URL
4. **URL**: http://your-server-ip:3000
5. **Icon**: ใช้ samila_logo.png
6. **Save บน Home Screen**

### ด้วย KWGT (Custom Widgets)

1. **ติดตั้ง KWGT** จาก Play Store
2. **สร้าง Widget**
3. **Link**: http://your-server-ip:3000
4. **Icon**: samila_logo.png
5. **Add to Home Screen**

---

## Android App Launcher Configuration

### สำหรับ Android Apps (React Native)

ใน `Mobile/app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-home-screen-widget",
        {
          "name": "SAMILA WMS",
          "icon": "samila_logo",
          "backgroundColor": "#0066CC"
        }
      ]
    ]
  }
}
```

---

## วิธีเพิ่ม Shortcut บน Android Home Screen

### Option 1: Chrome/Firefox Browser
1. เปิด Chrome
2. เข้า http://your-server-ip:3000
3. Tap "⋮" (Menu) → "Add to Home screen"
4. ตั้งชื่อ: SAMILA WMS
5. Tap "Add"

### Option 2: Samsung Internet
1. เปิด Samsung Internet
2. เข้า http://your-server-ip:3000
3. Tap "⋮" → "Add page to Home screen"
4. ตั้งชื่อ
5. Tap "Add"

### Option 3: Long Press Shortcut
1. Long press บน Home Screen
2. Tap "Widgets" หรือ "Shortcuts"
3. Search: Web shortcut
4. Create shortcut ชี้ไป http://your-server-ip:3000
5. ตั้งชื่อ: SAMILA WMS
6. ตั้ง Icon

---

## QR Code Shortcut

สามารถสร้าง QR Code ชี้ไปยัง URL:
```
http://your-server-ip:3000
```

ใช้ Service เช่น:
- qr-server.com
- qrcode.com
- zxing.org

วิธี:
1. เข้า qr-server.com
2. ใส่ URL: http://your-server-ip:3000
3. Copy QR Code
4. Scan เพื่อเข้า SAMILA WMS

---

## NFC Tag Shortcut (Advanced)

สามารถ Program NFC Tag เพื่อให้:
- Tap NFC Tag บน Device
- เปิด SAMILA WMS โดยอัตโนมัติ

วิธี:
1. ติดตั้ง NFC Tools App
2. Program Tag ด้วย URL
3. Save

---

## PWA (Progressive Web App) Installation

สำหรับทั้ง iOS และ Android:

1. เปิด Frontend บน Browser: http://your-server-ip:3000
2. Tap "Share" → "Add to Home Screen"
3. ตั้งชื่อ: SAMILA WMS
4. Tap "Add"

ได้ PWA Shortcut ที่:
- Load เร็ว
- ทำงาน Offline
- เหมือน Native App

---

**Requirements**: Android 7.1 (API 25) ขึ้นไป
