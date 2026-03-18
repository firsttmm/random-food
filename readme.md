# 🍕 Random Food — คู่มือติดตั้งและ Setup

## ขั้นตอนที่ 1 — ติดตั้ง Dependencies

```bash
cd random-food
npm install
```

---

## ขั้นตอนที่ 2 — สร้าง Firebase Project

1. ไปที่ https://console.firebase.google.com
2. กด **"Add project"** → ตั้งชื่อ เช่น `random-food`
3. ปิด Google Analytics (ไม่จำเป็น) → **Create project**

### เปิดใช้งาน Authentication
1. ซ้ายมือ → **Build → Authentication**
2. กด **Get started**
3. เลือก **Email/Password** → Enable → Save

### เปิดใช้งาน Firestore
1. ซ้ายมือ → **Build → Firestore Database**
2. กด **Create database**
3. เลือก **Start in test mode** (แก้ rules ทีหลัง)
4. เลือก region ที่ใกล้ที่สุด เช่น `asia-southeast1`




### ดึง Firebase Config
1. ซ้ายมือ → ⚙️ **Project Settings**
2. เลื่อนลงหา **"Your apps"** → กด **Web icon (</>)**
3. ตั้งชื่อ app → **Register app**
4. Copy `firebaseConfig` ที่ได้

---

## ขั้นตอนที่ 3 — ใส่ Firebase Config

เปิดไฟล์ `src/firebase/config.js` แล้วแทนที่ค่า

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",           // ← ใส่ของจริง
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
}
```
### สำหรับเก็บภาพ 
ไปที่ https://imgbb.com → สมัครบัญชีฟรี
ไปที่ https://api.imgbb.com → กด "Get API key"
Copy API key ที่ได้

เปิดไฟล์ src/stores/food.js บรรทัดบนสุด แล้วแทนที่:
```bash
jsconst IMGBB_API_KEY = 'YOUR_IMGBB_API_KEY'
```
---

## ขั้นตอนที่ 4 — Seed เมนูเริ่มต้น (ทำครั้งเดียว) ***ครั้งเดียวเท่านั้นถ้าผิดพลาดไปลบข้อมูฅทั้งหมดที่ firebase ก่อน

เพิ่มโค้ดนี้ชั่วคราวใน `src/main.js` (ลบทิ้งหลัง seed แล้ว):

```js
import { runSeed } from './firebase/seedScript'
// เพิ่มหลัง app.mount('#app')
runSeed().then(() => console.log('Seeded!'))
```

รัน `npm run dev` แล้วเปิด browser → เช็ค Console ว่าขึ้น **"Seeded!"**
จากนั้น **ลบ 2 บรรทัดนั้นออก** จาก main.js

---

## ขั้นตอนที่ 5 — ตั้ง Firestore Security Rules

ไปที่ Firebase Console → Firestore → **Rules** tab
วางโค้ดจากไฟล์ `firestore.rules` แล้วกด **Publish**

---
```bash
ไปที่ Firebase Console → Firestore → Rules แล้วแทนที่ทั้งหมดด้วยนี้เลย:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // เมนูอาหาร seed - อ่านได้ทุกคน
    match /menus/{menuId} {
      allow read: if true;
      allow write: if false;
    }

    // ข้อมูล user document (รวม shareSettings)
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // pins ของ user
    match /users/{userId}/pins/{pinId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // favorites - เจ้าของแก้ได้, คนอื่นอ่านได้ถ้า shareSettings.enabled == true
    match /users/{userId}/favorites/{favId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if get(/databases/$(database)/documents/users/$(userId)).data.shareSettings.enabled == true;
    }
  }
}

```

---

## ขั้นตอนที่ 6 — รันโปรเจกต์

```bash
npm run dev
```

เปิด http://localhost:5173 

---


## Build สำหรับ Production

```bash
npm run build
```

ไฟล์จะอยู่ใน `dist/` — สามารถ deploy ขึ้น **Firebase Hosting**, **Vercel**, หรือ **Netlify** ได้เลย

### Deploy ด้วย Vercel (ง่ายที่สุด)
1. Push โค้ดขึ้น GitHub
2. ไปที่ https://vercel.com → Import repo
3. Framework: **Vite** → Deploy 

