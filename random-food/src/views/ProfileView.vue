<template>
  <div class="view profile-view">
    <div class="header-row">
      <button class="back-btn" @click="$router.push('/')">←</button>
      <span class="page-title">โปรไฟล์</span>
      <div style="width:38px"></div>
    </div>

    <!-- Avatar + info -->
    <div class="profile-hero">
      <div class="big-avatar">
        <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" />
        <span v-else>🧑</span>
      </div>

      <!-- Edit name -->
      <div v-if="editingName" class="edit-name-row">
        <input v-model="newName" type="text" class="input-field"
               style="text-align:center; font-size:16px; font-weight:600"
               @keyup.enter="saveName" />
        <button class="btn btn-primary btn-sm" style="width:auto;padding:8px 20px"
                @click="saveName" :disabled="savingName">
          {{ savingName ? '...' : 'บันทึก' }}
        </button>
        <button class="btn btn-gray btn-sm" style="width:auto;padding:8px 16px"
                @click="editingName = false">ยกเลิก</button>
      </div>
      <div v-else class="name-row" @click="startEdit">
        <span class="profile-name">{{ authStore.user?.displayName || 'ผู้ใช้' }}</span>
        <span class="edit-icon">✏️</span>
      </div>

      <p class="profile-email">{{ authStore.user?.email }}</p>
    </div>

    <!-- My pins section -->
    <div class="section-header">
      <span class="section-title">📍 ปักหมุดร้านโดนใจของฉัน</span>
      <span class="count-badge">{{ foodStore.userPins.length }}</span>
    </div>

    <div v-if="loadingPins" class="loading-center">
      <div class="pizza-spin">🍕</div>
    </div>

    <div v-else-if="foodStore.userPins.length === 0" class="empty-pins">
      <p>ยังไม่ได้ปักหมุดร้านไหนเลย</p>
      <RouterLink to="/pin" class="btn btn-primary" style="margin-top:12px">
        📍 ปักหมุดเลย
      </RouterLink>
    </div>

    <div v-else class="pins-grid">
      <div v-for="pin in foodStore.userPins" :key="pin.id" class="pin-card">
        <img :src="pin.imageUrl || fallbackImg" class="pin-img"
             @error="onImgError" @click="goMap(pin)" />
        <div class="pin-info">
          <p class="pin-restaurant">{{ pin.restaurantName }}</p>
          <p class="pin-menu">{{ pin.menuName }}</p>
          <button class="remove-btn" @click="removePin(pin.id)">🗑️</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFoodStore } from '@/stores/food'

const router = useRouter()
const authStore = useAuthStore()
const foodStore = useFoodStore()

const editingName = ref(false)
const newName = ref('')
const savingName = ref(false)
const loadingPins = ref(false)
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

async function removePin(id) {
  if (!confirm('ลบปักหมุดนี้?')) return
  await foodStore.removePin(id)
}

function goMap(pin) {
  router.push({ name: 'Map', query: { lat: pin.lat, lng: pin.lng, name: pin.restaurantName } })
}

function onImgError(e) {
  e.target.src = fallbackImg
}
</script>

<style scoped>
.profile-hero {
  display: flex; flex-direction: column;
  align-items: center; gap: 8px;
  padding: 12px 0 28px;
  border-bottom: 1.5px solid var(--gray-border);
  margin-bottom: 24px;
}

.big-avatar {
  width: 80px; height: 80px; border-radius: 50%;
  background: #FFD0B0;
  display: flex; align-items: center; justify-content: center;
  font-size: 40px; overflow: hidden;
  border: 3px solid white;
  box-shadow: var(--shadow-sm);
}
.big-avatar img { width: 100%; height: 100%; object-fit: cover; }

.name-row {
  display: flex; align-items: center; gap: 8px; cursor: pointer;
}
.profile-name { font-size: 20px; font-weight: 700; }
.edit-icon { font-size: 16px; }
.profile-email { font-size: 13px; color: var(--text-sub); }

.edit-name-row {
  display: flex; align-items: center; gap: 8px; width: 100%; padding: 0 16px;
}

.section-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 16px;
}
.section-title { font-size: 15px; font-weight: 700; }
.count-badge {
  background: var(--red); color: white;
  font-size: 12px; font-weight: 700;
  padding: 2px 8px; border-radius: 50px;
}

.pins-grid { display: flex; flex-direction: column; gap: 12px; }

.pin-card {
  display: flex; gap: 12px; align-items: center;
  background: white; border: 1.5px solid var(--gray-border);
  border-radius: var(--radius-sm);
  overflow: hidden; box-shadow: var(--shadow-sm);
}

.pin-img {
  width: 80px; height: 80px; object-fit: cover;
  flex-shrink: 0; cursor: pointer;
}

.pin-info {
  flex: 1; padding: 8px 12px 8px 0;
  display: flex; flex-direction: column; gap: 4px;
}
.pin-restaurant { font-size: 12px; color: var(--text-sub); }
.pin-menu { font-size: 14px; font-weight: 600; }
.remove-btn {
  background: none; border: none; cursor: pointer;
  font-size: 16px; align-self: flex-start; margin-top: 4px;
}

.empty-pins {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; color: var(--text-sub); font-size: 14px;
  margin-top: 32px;
}

.loading-center { display: flex; justify-content: center; margin-top: 40px; }
.pizza-spin { font-size: 40px; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
