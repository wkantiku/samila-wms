# SAMILA WMS - iOS Shortcut
# วิธีใช้: ใช้ Apple Shortcuts App สร้าง Shortcut ตามขั้นตอนต่อไปนี้

## Setup Instructions (iOS)

### วิธีสร้าง iOS Shortcut:

1. **เปิด Apple Shortcuts App** บน iPhone/iPad
2. **Tap "+" (Create Shortcut)**
3. **Tap "Add Action"** แล้วเลือก:
   - `Safari` → `Open URLs`
   - URL: `http://your-server-ip:3000`
4. **Tap "Done"**
5. **ตั้งชื่อ**: SAMILA WMS
6. **เลือก Icon**: ใช้ Custom Image (ลาก samila_logo.png)

### ผลที่ได้:
- Shortcut ที่เมื่อ Tap จะเปิด SAMILA WMS App
- สามารถเพิ่มลงใน Home Screen ได้

### Advanced: สร้าง Signed Shortcut URL

สำหรับการแจกจ่าย:

```
https://www.icloud.com/shortcuts/[SHORTCUT_ID]
```

วิธี:
1. สร้าง Shortcut ตามขั้นตอนข้างบน
2. Tap "Share"
3. "Share via..."
4. "Copy iCloud Link"
5. Share link นี้กับผู้ใช้

---

## Shortcut Content (iCloud Format)

สามารถเพิ่มเติม Actions:
- Show Result (แสดง Message)
- Wait (รอก่อนเปิด)
- Notification (แจ้งเตือน)
- Open App (เปิด Apps อื่น)

---

**Note**: สำหรับการใช้งานที่ต้องขอ iOS 14.5 ขึ้นไป
