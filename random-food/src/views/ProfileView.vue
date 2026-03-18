<template>
  <div class="view profile-view">
    <div class="header-row">
      <button class="back-btn" @click="$router.push('/')">←</button>
      <span class="page-title">โปรไฟล์</span>
      <div style="width:38px"></div>
    </div>

    <!-- Profile Hero Card -->
    <div class="profile-card">
      <div class="avatar-wrapper" @click="avatarInput.click()">
        <div class="big-avatar">
          <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" />
          <i v-else class="fa-solid fa-user" aria-hidden="true"></i>
        </div>
        <div class="avatar-overlay">
          <i class="fa-solid fa-camera"></i>
        </div>
        <input ref="avatarInput" type="file" accept="image/*"
               style="display:none" @change="onAvatarChange" />
      </div>

      <div v-if="uploadingAvatar" class="upload-progress">
        <i class="fa-solid fa-spinner fa-spin"></i> กำลังอัปโหลด...
      </div>

      <div v-if="editingName" class="edit-name-row">
        <input v-model="newName" type="text" class="input-field"
               style="text-align:center; font-size:16px; font-weight:600"
               @keyup.enter="saveName" />
        <div style="display:flex; gap:8px; justify-content:center; width:100%">
          <button class="btn btn-primary btn-sm" style="width:auto; padding:8px 20px"
                  @click="saveName" :disabled="savingName">
            {{ savingName ? '...' : 'บันทึก' }}
          </button>
          <button class="btn btn-gray btn-sm" style="width:auto; padding:8px 16px"
                  @click="editingName = false">ยกเลิก</button>
        </div>
      </div>
      <div v-else class="name-row" @click="startEdit">
        <span class="profile-name">{{ authStore.user?.displayName || 'ผู้ใช้' }}</span>
        <i class="fa-regular fa-pen-to-square edit-icon" aria-hidden="true"></i>
      </div>

      <p class="profile-email">
        <i class="fa-solid fa-envelope" style="font-size:11px; margin-right:4px"></i>
        {{ authStore.user?.email }}
      </p>

      <button class="logout-btn" @click="showLogoutModal = true">
        <i class="fa-solid fa-right-from-bracket"></i>
        ออกจากระบบ
      </button>
    </div>

    <!-- Pins section -->
    <div class="section-header">
      <span class="section-title">
        <i class="fa-solid fa-location-dot"></i>
        ปักหมุดร้านโดนใจของฉัน
      </span>
      <span class="count-badge">{{ foodStore.userPins.length }}</span>
    </div>

    <div v-if="loadingPins" class="loading-center">
      <i class="fa-solid fa-pizza-slice fa-spin" style="font-size:36px; color:var(--red)"></i>
    </div>

    <div v-else-if="foodStore.userPins.length === 0" class="empty-pins">
      <i class="fa-solid fa-map-pin" style="font-size:40px; color:var(--gray-border)"></i>
      <p>ยังไม่ได้ปักหมุดร้านไหนเลย</p>
      <RouterLink to="/pin" class="btn btn-primary" style="margin-top:4px">
        <i class="fa-solid fa-location-dot"></i> ปักหมุดเลย
      </RouterLink>
    </div>

    <div v-else class="pins-grid">
      <div v-for="pin in foodStore.userPins" :key="pin.id" class="pin-card">
        <img :src="pin.imageUrl || fallbackImg" class="pin-img"
             @error="onImgError" @click="goMap(pin)" />
        <div class="pin-info">
          <p class="pin-restaurant">{{ pin.restaurantName }}</p>
          <p class="pin-menu">{{ pin.menuName }}</p>
          <button class="remove-btn" @click="removePin(pin.id)">
            <i class="fa-solid fa-trash"></i> ลบ
          </button>
        </div>
      </div>
    </div>

    <!-- Logout Modal -->
    <Transition name="fade">
      <div v-if="showLogoutModal" class="popup-overlay" @click.self="showLogoutModal = false">
        <div class="popup-box" style="text-align:center">
          <h3 style="font-size:17px; font-weight:700; margin-bottom:8px">ออกจากระบบ</h3>
          <p style="font-size:14px; color:var(--text-sub); margin-bottom:20px">
            คุณต้องการออกจากระบบหรือไม่?
          </p>
          <div style="display:flex; gap:10px">
            <button class="btn btn-gray" @click="showLogoutModal = false">ยกเลิก</button>
            <button class="btn btn-primary" @click="confirmLogout">ออกจากระบบ</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFoodStore } from '@/stores/food'
import { updateProfile } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'

const IMGBB_API_KEY = 'b32b937c485843c03e474c9a6f77433f'

const router = useRouter()
const authStore = useAuthStore()
const foodStore = useFoodStore()

const editingName = ref(false)
const newName = ref('')
const savingName = ref(false)
const loadingPins = ref(false)
const showLogoutModal = ref(false)
const avatarInput = ref(null)
const uploadingAvatar = ref(false)
const fallbackImg = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'

onMounted(async () => {
  if (foodStore.userPins.length === 0) {
    loadingPins.value = true
    await foodStore.fetchUserPins()
    loadingPins.value = false
  }
})

function startEdit() {
  newName.value = authStore.user?.displayName || ''
  editingName.value = true
}

async function saveName() {
  if (!newName.value.trim()) return
  savingName.value = true
  await authStore.updateDisplayName(newName.value.trim())
  savingName.value = false
  editingName.value = false
}

async function onAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return
  uploadingAvatar.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST', body: formData
    })
    const data = await res.json()
    if (!data.success) throw new Error('อัปโหลดไม่สำเร็จ')
    const photoURL = data.data.url
    await updateProfile(auth.currentUser, { photoURL })
    await updateDoc(doc(db, 'users', authStore.user.uid), { photoURL })
    authStore.user.photoURL = photoURL
  } catch {
    alert('อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่')
  } finally {
    uploadingAvatar.value = false
  }
}

async function removePin(id) {
  if (!confirm('ลบปักหมุดนี้?')) return
  await foodStore.removePin(id)
}

function goMap(pin) {
  router.push({ name: 'Map', query: { lat: pin.lat, lng: pin.lng, name: pin.restaurantName } })
}

function onImgError(e) { e.target.src = fallbackImg }

async function confirmLogout() {
  showLogoutModal.value = false
  await authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.profile-view { padding-bottom: 40px; }

.profile-card {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  background: white; border: 1.5px solid var(--gray-border);
  border-radius: var(--radius); padding: 28px 20px 24px;
  margin-bottom: 24px; box-shadow: var(--shadow-sm);
}

.avatar-wrapper {
  position: relative; cursor: pointer;
  width: 90px; height: 90px; margin-bottom: 4px;
}
.big-avatar {
  width: 90px; height: 90px; border-radius: 50%;
  background: #FFD0B0;
  display: flex; align-items: center; justify-content: center;
  font-size: 42px; overflow: hidden;
  border: 3px solid white;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
.big-avatar img { width: 100%; height: 100%; object-fit: cover; }
.big-avatar i { color: #7B4B32; }

.avatar-overlay {
  position: absolute; bottom: 0; right: 0;
  width: 28px; height: 28px; background: var(--red);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  color: white; font-size: 12px; border: 2px solid white;
  box-shadow: var(--shadow-sm);
}

.upload-progress {
  font-size: 13px; color: var(--text-sub);
  display: flex; align-items: center; gap: 6px;
}

.name-row { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.profile-name { font-size: 20px; font-weight: 700; }
.edit-icon { font-size: 14px; color: var(--text-sub); }
.profile-email { font-size: 13px; color: var(--text-sub); display: flex; align-items: center; }

.edit-name-row {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  width: 100%; padding: 0 8px;
}
.edit-name-row .input-field { width: 100%; }

.logout-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 20px; border-radius: 50px;
  border: 1.5px solid var(--red); background: var(--red-light);
  color: var(--red); font-family: 'Sarabun', sans-serif;
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: background 0.2s; margin-top: 4px;
}
.logout-btn:hover { background: #ffcdd2; }

.section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.section-title { font-size: 15px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
.section-title i { color: var(--red); }
.count-badge {
  background: var(--red); color: white;
  font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 50px;
}

.pins-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 600px) {
  .pins-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.pin-card {
  background: white;
  border: 1.5px solid var(--gray-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  transition: transform 0.15s;
}
.pin-card:hover { transform: translateY(-2px); }

.pin-img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  cursor: pointer;
}

.pin-info {
  padding: 8px 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pin-restaurant {
  font-size: 11px;
  color: var(--text-sub);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pin-menu {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.remove-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--red-light);
  border: none; cursor: pointer;
  font-size: 12px; color: var(--red);
  padding: 6px 10px; margin-top: 4px;
  border-radius: 50px;
  font-family: 'Sarabun', sans-serif;
  width: 100%;
  justify-content: center;
}
.remove-btn:hover { background: #ffcdd2; }

.empty-pins {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; color: var(--text-sub); font-size: 14px; margin-top: 32px;
}
.loading-center { display: flex; justify-content: center; margin-top: 40px; }


.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>