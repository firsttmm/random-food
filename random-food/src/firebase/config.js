// src/firebase/config.js
//  ใส่ Firebase config ของคุณที่นี่
// ไปที่ https://console.firebase.google.com → สร้าง Project → เพิ่ม Web App → copy config

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAgDwA5IJyOAUEz5nNK4LjCeDUrCtWqOHM",
  authDomain: "random-food-cdff7.firebaseapp.com",
  projectId: "random-food-cdff7",
  storageBucket: "random-food-cdff7.firebasestorage.app",
  messagingSenderId: "921465748643",
  appId: "1:921465748643:web:ed433d3e572982c443d316",
  measurementId: "G-4D1J6X87J9"
}

//const firebaseConfig = {
  //apiKey: "YOUR_API_KEY",
  //authDomain: "YOUR_PROJECT.firebaseapp.com",
  //projectId: "YOUR_PROJECT_ID",
  //storageBucket: "YOUR_PROJECT.appspot.com",
  //messagingSenderId: "YOUR_SENDER_ID",
  //appId: "YOUR_APP_ID"
//}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
