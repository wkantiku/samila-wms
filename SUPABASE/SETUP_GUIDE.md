# 🚀 SAMILA WMS — Supabase + Vercel Setup Guide

## ภาพรวม
```
User (Browser/Mobile)
      ↓
Vercel (Frontend React)  ←→  Supabase (DB + Auth + API)
      ↑
Expo Go (Mobile App)  ←→  Supabase
```

---

## ขั้นตอนที่ 1: สร้าง Supabase Project (5 นาที)

1. ไปที่ https://supabase.com → **Start your project**
2. Sign in ด้วย GitHub
3. กด **New project**
   - Name: `samila-wms`
   - Database Password: (ตั้งเองและจำไว้)
   - Region: **Southeast Asia (Singapore)**
4. รอ ~2 นาที

---

## ขั้นตอนที่ 2: Import Database Schema

1. ใน Supabase Dashboard → **SQL Editor**
2. กด **New query**
3. Copy ทั้งหมดจากไฟล์ `01_schema.sql`
4. วางใน SQL Editor → กด **Run**
5. ✅ ตาราง 20+ ตารางถูกสร้างแล้ว

---

## ขั้นตอนที่ 3: หา API Keys

1. ไปที่ **Settings → API**
2. Copy:
   - **Project URL**: `https://xxxx.supabase.co`
   - **anon public key**: `eyJ...`

---

## ขั้นตอนที่ 4: ตั้งค่า Mobile App

แก้ไฟล์ `mobile/src/config/supabase.js`:
```js
export const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';
export const SUPABASE_ANON = 'YOUR_ANON_KEY';
```

---

## ขั้นตอนที่ 5: Deploy Frontend ขึ้น Vercel

1. ไปที่ https://vercel.com → Sign in ด้วย GitHub
2. กด **New Project** → Import repo `Samila_WMS_3PL`
3. ตั้งค่า:
   - Framework: **Create React App**
   - Root Directory: `FRONTEND`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Environment Variables:
   ```
   REACT_APP_SUPABASE_URL  = https://xxxx.supabase.co
   REACT_APP_SUPABASE_ANON = eyJ...
   ```
5. กด **Deploy** → ได้ URL: `https://samila-wms.vercel.app`

---

## ขั้นตอนที่ 6: ใช้งาน Mobile (Expo Go)

1. User ดาวน์โหลด **Expo Go** จาก Play Store / App Store
2. รันคำสั่ง: `cd mobile && npx expo start`
3. สแกน QR Code ด้วย Expo Go
4. ✅ แอปเปิดทันที

---

## สรุป URLs

| บริการ | URL |
|--------|-----|
| Frontend (เว็บ) | `https://samila-wms.vercel.app` |
| Supabase Dashboard | `https://supabase.com/dashboard` |
| Supabase API | `https://xxxx.supabase.co` |
| Mobile (Dev) | สแกน QR จาก Expo Go |

---

## ฟรีทั้งหมด ✅

| บริการ | Free Tier |
|--------|-----------|
| Supabase | 500MB DB, 50K users/month |
| Vercel | Unlimited static deployments |
| Expo Go | ฟรี สำหรับ development |

---

## สร้าง User แรก (Admin)

ใน Supabase Dashboard → **Authentication → Users → Add user**:
- Email: `admin@samila.co.th`
- Password: `Admin@1234`

แล้วเพิ่มข้อมูลใน SQL Editor:
```sql
INSERT INTO users (auth_id, username, email, name, role, status)
SELECT id, 'admin', 'admin@samila.co.th', 'Administrator', 'superadmin', 'active'
FROM auth.users
WHERE email = 'admin@samila.co.th';
```
