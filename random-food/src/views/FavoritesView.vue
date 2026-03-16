<template>
  <div class="view fav-view">
    <div class="header-row">
      <button class="back-btn" @click="$router.push('/')">←</button>
      <span class="page-title">❤️ รายการโปรด 🔒</span>
      <RouterLink to="/profile" class="avatar">🧑</RouterLink>
    </div>

    <!-- Action buttons -->
    <div class="action-row">
      <button class="btn btn-primary btn-sm" @click="doRandomFav">🎲 กดสุ่ม</button>
      <button class="btn btn-outline btn-sm" @click="$router.push('/peek')">👀 ส่อง</button>
    </div>

    <!-- Random result popup -->
    <Transition name="fade">
      <div v-if="randomResult" class="popup-overlay" @click="randomResult = null">
        <div class="popup-box">
          <div class="header-row" style="margin-bottom:12px">
            <span class="page-title" style="font-size:16px">สุ่มรายการโปรด</span>
            <button class="back-btn" @click="randomResult = null">✕</button>
          </div>
          <img :src="randomResult.imageUrl" class="rand-img" @error="onImgError" />
          <div style="margin-top:10px">
            <span class="tag">{{ randomResult.restaurantName }}</span>
            <h3 class="rand-name">{{ randomResult.menuName }}</h3>
            <button class="btn btn-primary" style="margin-top:12px"
                    @click="goMap(randomResult)">🗺️ ดูแผนที่</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Loading -->
    <div v-if="loading" class="loading-center">
      <div class="pizza-spin">🍕</div>
    </div>

    <!-- Empty state -->
    <div v-else-if="foodStore.favorites.length === 0" class="empty-state">
      <div style="font-size:48px">💔</div>
      <p>ยังไม่มีรายการโปรด</p>
      <RouterLink to="/random" class="btn btn-primary" style="margin-top:16px">
        ไปสุ่มเมนูเลย
      </RouterLink>
    </div>

    <!-- Grid -->
    <div v-else class="fav-grid">
      <div v-for="fav in foodStore.favorites" :key="fav.id" class="fav-card">
        <img :src="fav.imageUrl" class="fav-img" @error="onImgError" />
        <p class="fav-restaurant">{{ fav.restaurantName }}</p>
        <p class="fav-menu">{{ fav.menuName }}</p>
        <button class="btn btn-sm remove-btn" @click="removeFav(fav.id)">
          🗑️ ลบออก
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFoodStore } from '@/stores/food'

const router = useRouter()
const foodStore = useFoodStore()
const loading = ref(false)
const randomResult = ref(null)

onMounted(async () => {
  if (foodStore.favorites.length === 0) {
    loading.value = true
    await foodStore.fetchFavorites()
    loading.value = false
  }
})

function doRandomFav() {
  const result = foodStore.randomFromFavorites()
  if (!result) { alert('ยังไม่มีรายการโปรด'); return }
  randomResult.value = result
}

async function removeFav(id) {
  await foodStore.removeFavorite(id)
}

function goMap(menu) {
  randomResult.value = null
  router.push({ name: 'Map', query: { lat: menu.lat, lng: menu.lng, name: menu.restaurantName } })
}

function onImgError(e) {
  e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
}
</script>

<style scoped>
.fav-view { padding-bottom: 32px; }

.action-row {
  display: flex; gap: 12px; margin-bottom: 20px;
}
.action-row .btn { flex: 1; }

.fav-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.fav-card {
  background: white;
  border: 1.5px solid var(--gray-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.fav-img {
  width: 100%; height: 100px; object-fit: cover;
}

.fav-restaurant {
  font-size: 11px; color: var(--text-sub);
  padding: 8px 8px 2px; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}

.fav-menu {
  font-size: 13px; font-weight: 600; color: var(--text);
  padding: 0 8px 8px; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}

.remove-btn {
  margin: 0 8px 10px;
  background: var(--red-light);
  color: var(--red);
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  width: calc(100% - 16px);
}
.remove-btn:hover { background: #ffcdd2; }

.rand-img {
  width: 100%; height: 180px; object-fit: cover;
  border-radius: var(--radius-sm);
}
.rand-name {
  font-size: 17px; font-weight: 700; margin-top: 6px;
}

.empty-state {
  display: flex; flex-direction: column;
  align-items: center; gap: 12px;
  margin-top: 80px; color: var(--text-sub);
  font-size: 15px;
}

.loading-center {
  display: flex; justify-content: center; margin-top: 80px;
}
.pizza-spin { font-size: 40px; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
