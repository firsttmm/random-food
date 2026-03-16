// src/stores/food.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, getDocs, addDoc, deleteDoc,
  doc, query, where, serverTimestamp, getDoc
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from './auth'

// 🔧 ใส่ ImgBB API Key ของคุณที่นี่
// สมัครฟรีที่ https://imgbb.com แล้วขอ key ที่ https://api.imgbb.com
const IMGBB_API_KEY = 'b32b937c485843c03e474c9a6f77433f'

// อัปโหลดรูปขึ้น ImgBB → คืน URL
async function uploadToImgBB(imageFile) {
  const formData = new FormData()
  formData.append('image', imageFile)
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData
  })
  const data = await res.json()
  if (!data.success) throw new Error('อัปโหลดรูปไม่สำเร็จ')
  return data.data.url // URL ถาวร
}

// คำนวณระยะทาง km ระหว่างสองจุด (Haversine)
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const useFoodStore = defineStore('food', () => {
  const authStore = useAuthStore()

  const allMenus = ref([])        // เมนู seed ทั้งหมด
  const userPins = ref([])        // pins ที่ user เพิ่มเอง
  const favorites = ref([])       // รายการโปรดของ user
  const currentMenu = ref(null)   // เมนูที่สุ่มได้ตอนนี้

  // ดึงเมนูทั้งหมดจาก Firestore
  async function fetchAllMenus() {
    const snap = await getDocs(collection(db, 'menus'))
    allMenus.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  // ดึง pins ของ user
  async function fetchUserPins() {
    if (!authStore.user) return
    const snap = await getDocs(collection(db, 'users', authStore.user.uid, 'pins'))
    userPins.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  // ดึง favorites ของ user
  async function fetchFavorites() {
    if (!authStore.user) return
    const snap = await getDocs(collection(db, 'users', authStore.user.uid, 'favorites'))
    favorites.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  // สุ่มเมนู (รวม seed + pins ของ user)
  function randomMenu(radiusKm = null, userLat = null, userLng = null) {
    let pool = [...allMenus.value]

    // รวม pins ของ user เข้า pool
    if (authStore.isLoggedIn) {
      pool = [...pool, ...userPins.value]
    }

    // กรองตามระยะทาง
    if (radiusKm && userLat !== null && userLng !== null) {
      pool = pool.filter(m => {
        const dist = haversineDistance(userLat, userLng, m.lat, m.lng)
        return dist <= radiusKm
      })
    }

    if (pool.length === 0) return null
    const idx = Math.floor(Math.random() * pool.length)
    currentMenu.value = pool[idx]
    return currentMenu.value
  }

  // สุ่มจาก favorites เท่านั้น
  function randomFromFavorites() {
    if (favorites.value.length === 0) return null
    const idx = Math.floor(Math.random() * favorites.value.length)
    currentMenu.value = favorites.value[idx]
    return currentMenu.value
  }

  // เพิ่ม pin ร้านโดนใจ
  async function addPin(pinData, imageFile) {
    if (!authStore.user) throw new Error('กรุณาเข้าสู่ระบบ')

    // ตรวจสอบว่ามีร้านนี้แล้วหรือยัง (ชื่อร้าน + เมนูเดิม)
    const existing = userPins.value.find(
      p => p.restaurantName === pinData.restaurantName && p.menuName === pinData.menuName
    )
    if (existing) throw new Error('มีรายการนี้อยู่แล้ว')

    let imageUrl = pinData.imageUrl || ''

    // อัปโหลดรูปผ่าน ImgBB ถ้ามี
    if (imageFile) {
      imageUrl = await uploadToImgBB(imageFile)
    }

    const newPin = {
      ...pinData,
      imageUrl,
      uid: authStore.user.uid,
      createdAt: serverTimestamp()
    }

    const docRef = await addDoc(
      collection(db, 'users', authStore.user.uid, 'pins'),
      newPin
    )
    userPins.value.push({ id: docRef.id, ...newPin })
    return docRef.id
  }

  // ลบ pin
  async function removePin(pinId) {
    if (!authStore.user) return
    await deleteDoc(doc(db, 'users', authStore.user.uid, 'pins', pinId))
    userPins.value = userPins.value.filter(p => p.id !== pinId)
  }

  // เพิ่มรายการโปรด
  async function addFavorite(menu) {
    if (!authStore.user) throw new Error('กรุณาเข้าสู่ระบบ')
    const existing = favorites.value.find(f => f.menuId === menu.id)
    if (existing) return // มีอยู่แล้ว
    const fav = {
      menuId: menu.id || menu.menuId,
      restaurantName: menu.restaurantName,
      menuName: menu.menuName,
      imageUrl: menu.imageUrl,
      lat: menu.lat,
      lng: menu.lng,
      address: menu.address || '',
      isShared: false,
      createdAt: serverTimestamp()
    }
    const docRef = await addDoc(
      collection(db, 'users', authStore.user.uid, 'favorites'),
      fav
    )
    favorites.value.push({ id: docRef.id, ...fav })
  }

  // ลบรายการโปรด
  async function removeFavorite(favId) {
    if (!authStore.user) return
    await deleteDoc(doc(db, 'users', authStore.user.uid, 'favorites', favId))
    favorites.value = favorites.value.filter(f => f.id !== favId)
  }

  // ดู favorites ของเพื่อน (ที่เปิด share)
  async function fetchFriendFavorites(friendUid) {
    const snap = await getDocs(
      query(
        collection(db, 'users', friendUid, 'favorites'),
        where('isShared', '==', true)
      )
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  // ดึงรายชื่อ users ทั้งหมด (สำหรับหน้าส่อง)
  async function fetchAllUsers() {
    const snap = await getDocs(collection(db, 'users'))
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => u.uid !== authStore.user?.uid)
  }

  return {
    allMenus, userPins, favorites, currentMenu,
    fetchAllMenus, fetchUserPins, fetchFavorites,
    randomMenu, randomFromFavorites,
    addPin, removePin,
    addFavorite, removeFavorite,
    fetchFriendFavorites, fetchAllUsers
  }
})