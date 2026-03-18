// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'
import { useFoodStore } from './food'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userProfile = ref(null)
  const loading = ref(true)

  const isLoggedIn = computed(() => !!user.value)

  // ฟัง auth state เปลี่ยน
  function init() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid)
      } else {
        userProfile.value = null
      }
      loading.value = false
    })
  }

  async function fetchProfile(uid) {
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      userProfile.value = snap.data()
    }
  }

  async function register(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email,
      displayName,
      photoURL: null,
      createdAt: new Date()
    })
    user.value = cred.user
    await fetchProfile(cred.user.uid)
    return cred.user
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    user.value = cred.user
    await fetchProfile(cred.user.uid)
    return cred.user
  }

  async function logout() {
    await signOut(auth)
    user.value = null
    userProfile.value = null
    const foodStore = useFoodStore()
    foodStore.clearStore()
  }

  async function updateDisplayName(name) {
    if (!user.value) return
    await updateProfile(user.value, { displayName: name })
    await updateDoc(doc(db, 'users', user.value.uid), { displayName: name })
    await fetchProfile(user.value.uid)
  }

  return { user, userProfile, loading, isLoggedIn, init, register, login, logout, updateDisplayName }
})
