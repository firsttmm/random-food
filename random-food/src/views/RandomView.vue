<template>
  <div class="view random-view">
    <!-- Header -->
    <div class="header-row">
      <button class="back-btn" @click="$router.push('/')">←</button>
      <span class="page-title">สุ่มเมนูอาหาร</span>
      <button class="filter-btn" @click="showFilter = !showFilter">⚙️</button>
    </div>

    <!-- Distance filter dropdown -->
    <Transition name="slide">
      <div v-if="showFilter" class="filter-dropdown">
        <p style="font-size:13px; color:var(--text-sub); margin-bottom:8px">เลือกระยะทาง:</p>
        <div class="filter-options">
          <button v-for="opt in distanceOptions" :key="opt.value"
                  :class="['filter-opt', { active: selectedDistance === opt.value }]"
                  @click="setDistance(opt.value)">
            {{ opt.label }}
          </button>
        </div>
        <p v-if="!locationGranted" class="loc-warn">
          ⚠️ กรุณาอนุญาตตำแหน่งเพื่อกรองตามระยะทาง
        </p>
      </div>
    </Transition>

    <!-- Random button -->
    <button class="btn btn-primary random-btn" :disabled="spinning" @click="doRandom">
      {{ spinning ? '🎲 กำลังสุ่ม...' : '🎲 กดสุ่มเมนูอาหาร' }}
    </button>

    <!-- Result card -->
    <Transition name="card-pop">
      <div v-if="menu" class="result-card">
        <img :src="menu.imageUrl" class="food-img" :alt="menu.menuName"
             @error="onImgError" />
        <div class="card-info">
          <span class="tag">{{ menu.restaurantName }}</span>
          <button class="map-icon-btn" @click="goMap" title="ดูแผนที่">🗺️</button>
        </div>
        <h3 class="menu-name">{{ menu.menuName }}</h3>
        <p v-if="distanceText" class="dist-text">📍 {{ distanceText }}</p>

        <button v-if="authStore.isLoggedIn" class="btn btn-outline fav-btn" @click="addToFav">
          {{ favAdded ? '✅ เพิ่มแล้ว' : '♡ เพิ่มรายการโปรด' }}
        </button>
        <RouterLink v-else to="/login" class="btn btn-outline fav-btn">
          ♡ เข้าสู่ระบบเพื่อบันทึก
        </RouterLink>
      </div>
    </Transition>

    <!-- Loading init -->
    <div v-if="loadingMenus" class="loading-center">
      <div class="pizza-spin">🍕</div>
      <p>กำลังโหลดเมนู...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFoodStore } from '@/stores/food'

const router = useRouter()
const authStore = useAuthStore()
const foodStore = useFoodStore()

const menu = ref(null)
const spinning = ref(false)
const favAdded = ref(false)
const showFilter = ref(false)
const selectedDistance = ref(null)
const userLat = ref(null)
const userLng = ref(null)
const locationGranted = ref(false)
const loadingMenus = ref(false)

const distanceOptions = [
  { label: 'ทั้งหมด', value: null },
  { label: '1 กม.', value: 1 },
  { label: '3 กม.', value: 3 },
  { label: '5 กม.', value: 5 },
  { label: '10 กม.', value: 10 }
]

const distanceText = computed(() => {
  if (!selectedDistance.value) return ''
  return `ภายใน ${selectedDistance.value} กม.`
})

onMounted(async () => {
  if (foodStore.allMenus.length === 0) {
    loadingMenus.value = true
    await foodStore.fetchAllMenus()
    loadingMenus.value = false
  }
  if (authStore.isLoggedIn && foodStore.userPins.length === 0) {
    await foodStore.fetchUserPins()
  }
  // ขอตำแหน่ง
  getLocation()
})

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLat.value = pos.coords.latitude
        userLng.value = pos.coords.longitude
        locationGranted.value = true
      },
      () => { locationGranted.value = false }
    )
  }
}

function setDistance(val) {
  selectedDistance.value = val
  showFilter.value = false
}

async function doRandom() {
  spinning.value = true
  favAdded.value = false
  await new Promise(r => setTimeout(r, 400))
  const result = foodStore.randomMenu(
    selectedDistance.value,
    userLat.value,
    userLng.value
  )
  if (!result) {
    alert('ไม่พบเมนูในระยะที่เลือก ลองเพิ่มระยะทางดูนะ')
  }
  menu.value = result
  spinning.value = false
}

async function addToFav() {
  if (!menu.value || favAdded.value) return
  try {
    await foodStore.addFavorite(menu.value)
    favAdded.value = true
  } catch (e) {
    alert(e.message || 'เกิดข้อผิดพลาด')
  }
}

function goMap() {
  if (!menu.value) return
  router.push({ name: 'Map', query: { lat: menu.value.lat, lng: menu.value.lng, name: menu.value.restaurantName } })
}

function onImgError(e) {
  e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
}
</script>

<style scoped>
.random-view { padding-top: 24px; }

.filter-btn {
  background: none; border: none; font-size: 20px; cursor: pointer;
}

.filter-dropdown {
  background: white;
  border: 1.5px solid var(--gray-border);
  border-radius: var(--radius-sm);
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
}

.filter-options {
  display: flex; gap: 8px; flex-wrap: wrap;
}

.filter-opt {
  padding: 6px 16px;
  border-radius: 50px;
  border: 1.5px solid var(--gray-border);
  background: white;
  font-family: 'Sarabun', sans-serif;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-opt.active {
  background: var(--red); color: white; border-color: var(--red);
}

.random-btn { margin-bottom: 20px; }

.result-card {
  background: white;
  border-radius: var(--radius);
  border: 1.5px solid var(--gray-border);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.food-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 4px;
}

.map-icon-btn {
  background: none; border: none; font-size: 20px; cursor: pointer;
}

.menu-name {
  padding: 4px 14px 12px;
  font-size: 18px;
  font-weight: 700;
}

.dist-text {
  padding: 0 14px 8px;
  font-size: 13px;
  color: var(--text-sub);
}

.fav-btn { margin: 0 14px 14px; width: calc(100% - 28px); }

.loc-warn { font-size: 12px; color: #E65100; margin-top: 8px; }

.loading-center {
  display: flex; flex-direction: column;
  align-items: center; gap: 12px; margin-top: 60px; color: var(--text-sub);
}

/* Transitions */
.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }

.card-pop-enter-active { animation: popIn 0.3s ease; }
@keyframes popIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
