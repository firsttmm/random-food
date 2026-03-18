<template>
  <div class="view peek-view">
    <!-- User list -->
    <template v-if="!selectedUser">
      <div class="header-row">
        <button class="back-btn" @click="$router.push('/favorites')">←</button>
        <span class="page-title">แอบส่องเมนูโปรด</span>
        <div style="width:38px"></div>
      </div>

      <div v-if="loadingUsers" class="loading-center">
        <div class="pizza-spin">
          <i class="fa-solid fa-pizza-slice" aria-hidden="true"></i>
        </div>
      </div>

      <div v-else-if="sharedUsers.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        </div>
        <p>ยังไม่มีใครแชร์รายการโปรด</p>
      </div>

      <div v-else class="user-list">
        <div v-for="u in sharedUsers" :key="u.uid" class="user-row" @click="selectUser(u)">
          <div class="user-avatar">
            <img v-if="u.photoURL" :src="u.photoURL" />
            <i v-else class="fa-solid fa-user" aria-hidden="true"></i>
          </div>
          <div class="user-info">
            <p class="list-name">{{ u.shareSettings?.name || `ลิสต์ของ ${u.displayName}` }}</p>
            <p class="user-sub">
              <i class="fa-solid fa-user" style="font-size:10px"></i>
              @{{ u.displayName || u.email }}
            </p>
          </div>
          <span class="chevron">›</span>
        </div>
      </div>
    </template>

    <!-- Friend's favorites -->
    <template v-else>
      <div class="header-row">
        <button class="back-btn" @click="selectedUser = null; friendFavs = []">←</button>
        <span class="page-title title-with-icon">
          <i class="fa-solid fa-heart" aria-hidden="true"></i>
          {{ selectedUser.shareSettings?.name || `ลิสต์ของ ${selectedUser.displayName}` }}
        </span>
        <div style="width:38px"></div>
      </div>

      <p class="friend-name-label">
        <i class="fa-solid fa-user" style="font-size:11px"></i>
        @{{ selectedUser.displayName || selectedUser.email }}
      </p>

      <div v-if="loadingFavs" class="loading-center">
        <div class="pizza-spin">
          <i class="fa-solid fa-pizza-slice" aria-hidden="true"></i>
        </div>
      </div>

      <template v-else-if="friendFavs.length > 0">
        <!-- Random button -->
        <button class="btn btn-primary random-btn" @click="doRandom">
          <i class="fa-solid fa-dice" aria-hidden="true"></i>
          สุ่มจากลิสต์นี้
        </button>

        <!-- Random result popup -->
        <Transition name="fade">
          <div v-if="randomResult" class="popup-overlay" @click.self="randomResult = null">
            <div class="popup-box">
              <div class="header-row" style="margin-bottom:12px">
                <span class="page-title" style="font-size:16px">สุ่มได้เมนูนี้!</span>
                <button class="back-btn" @click="randomResult = null">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
              <img :src="randomResult.imageUrl" class="rand-img" @error="onImgError" />
              <span class="tag" style="margin-top:10px;display:inline-block">
                {{ randomResult.restaurantName }}
              </span>
              <h3 class="rand-name">{{ randomResult.menuName }}</h3>
              <button class="btn btn-primary" style="margin-top:12px"
                      @click="goMap(randomResult)">
                <i class="fa-solid fa-map-location-dot"></i>
                ดูแผนที่
              </button>
            </div>
          </div>
        </Transition>

        <!-- Grid -->
        <div class="fav-grid">
          <div v-for="fav in friendFavs" :key="fav.id" class="fav-card" @click="goMap(fav)">
            <img :src="fav.imageUrl" class="fav-img" @error="onImgError" />
            <p class="fav-restaurant">{{ fav.restaurantName }}</p>
            <p class="fav-menu">{{ fav.menuName }}</p>
          </div>
        </div>
      </template>

      <div v-else class="empty-state">
        <div class="empty-icon">
          <i class="fa-solid fa-lock" aria-hidden="true"></i>
        </div>
        <p>ยังไม่มีรายการโปรด</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFoodStore } from '@/stores/food'
import { db } from '@/firebase/config'
import { collection, getDocs } from 'firebase/firestore'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const foodStore = useFoodStore()
const authStore = useAuthStore()

const sharedUsers = ref([])
const selectedUser = ref(null)
const friendFavs = ref([])
const loadingUsers = ref(false)
const loadingFavs = ref(false)
const randomResult = ref(null)

onMounted(async () => {
  loadingUsers.value = true
  // ดึงเฉพาะ user ที่เปิดแชร์ และไม่ใช่ตัวเอง
  const snap = await getDocs(collection(db, 'users'))
  sharedUsers.value = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(u =>
      u.uid !== authStore.user?.uid &&
      u.shareSettings?.enabled === true
    )
  loadingUsers.value = false
})

async function selectUser(u) {
  selectedUser.value = u
  loadingFavs.value = true
  friendFavs.value = await foodStore.fetchFriendFavorites(u.uid)
  loadingFavs.value = false
}

function doRandom() {
  if (friendFavs.value.length === 0) return
  const idx = Math.floor(Math.random() * friendFavs.value.length)
  randomResult.value = friendFavs.value[idx]
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
.user-list { display: flex; flex-direction: column; gap: 2px; }

.user-row {
  display: flex; align-items: center; gap: 14px;
  padding: clamp(12px, 3vw, 14px) 8px;
  border-bottom: 1px solid var(--gray-border);
  cursor: pointer; border-radius: var(--radius-sm);
  transition: background 0.15s;
}
.user-row:hover { background: var(--red-light); }

.user-avatar {
  width: 46px; height: 46px; border-radius: 50%;
  background: #FFD0B0;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; overflow: hidden; flex-shrink: 0;
}
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }
.user-avatar i { color: #7B4B32; }

.user-info { flex: 1; min-width: 0; }
.list-name {
  font-size: 15px; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.user-sub {
  font-size: 12px; color: var(--text-sub); margin-top: 2px;
  display: flex; align-items: center; gap: 4px;
}

.chevron { font-size: 20px; color: var(--gray-text); }

.friend-name-label {
  font-size: 13px; color: var(--text-sub);
  margin-bottom: 16px; margin-top: -8px;
  display: flex; align-items: center; gap: 5px;
}

.random-btn {
  margin-bottom: 16px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}

.fav-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 600px) {
  .fav-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.fav-card {
  background: white;
  border: 1.5px solid var(--gray-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.15s;
  display: flex;
  flex-direction: column;
}

.fav-img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}
.fav-card:hover { transform: translateY(-2px); }
.fav-img { width: 100%; height: clamp(100px, 22vw, 140px); object-fit: cover; }
.fav-restaurant {
  font-size: 11px; color: var(--text-sub);
  padding: 8px 8px 2px; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.fav-menu {
  font-size: 13px; font-weight: 600;
  padding: 0 8px 10px; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}

.rand-img {
  width: 100%; height: 180px; object-fit: cover;
  border-radius: var(--radius-sm);
}
.rand-name { font-size: 17px; font-weight: 700; margin-top: 6px; }

.title-with-icon { display: inline-flex; align-items: center; gap: 6px; }

.empty-state {
  display: flex; flex-direction: column;
  align-items: center; gap: 12px;
  margin-top: clamp(48px, 12vh, 90px); color: var(--text-sub); font-size: 15px;
}
.empty-icon { font-size: 40px; color: var(--gray-text); }

.loading-center { display: flex; justify-content: center; margin-top: clamp(48px, 12vh, 90px); }
.pizza-spin { font-size: 40px; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>