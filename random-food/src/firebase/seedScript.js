// src/firebase/seedScript.js
// รันสคริปต์นี้ครั้งเดียวเพื่อใส่เมนูเริ่มต้นเข้า Firestore
// วิธีใช้: import แล้วเรียก runSeed() ใน browser console ครั้งแรก

import { db } from './config'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { seedMenus } from '../data/seedMenus'

// รูปภาพ local อยู่ใน /public/images/menus/
// ชื่อไฟล์ตรงกับ imageFile ใน seedMenus (ไม่มีนามสกุล → ลอง .jpg, .jpeg, .png)
function getImageUrl(imageFile) {
  return `/images/menus/${imageFile}.jpg`
}

export async function runSeed() {
  console.log(' Starting seed...')
  let count = 0
  for (const menu of seedMenus) {
    const ref = doc(db, 'menus', menu.id)
    const existing = await getDoc(ref)
    if (!existing.exists()) {
      const { imageFile, ...rest } = menu
      await setDoc(ref, {
        ...rest,
        imageUrl: getImageUrl(imageFile),
        createdAt: new Date()
      })
      count++
    }
  }
  console.log(` Seeded ${count} menus`)
}
