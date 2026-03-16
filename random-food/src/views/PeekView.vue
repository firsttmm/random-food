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
        <div class="pizza-spin">🍕</div>
      </div>

      <div v-else-if="users.length === 0" class="empty-state">
        <div style="font-size:40px">🔍</div>
        <p>ยังไม่มีผู้ใช้คนอื่น</p>
      </div>

      <div v-else class="user-list">
        <div v-for="u in users" :key="u.uid" class="user-row" @click="selectUser(u)">
          <div class="user-avatar">
            <img v-if="u.photoURL" :src="u.photoURL" />
            <span v-else>🧑</span>
          </div>
          <span class="user-name">{{ u.displayName || u.email }}</span>
          <span class="chevron">›</span>
        </div>
      </div>
    </template>

    <!-- Friend's favorites -->
    <template v-else>
      <div class="header-row">
        <button class="back-btn" @click="selectedUser = null; friendFavs = []">←</button>
        <span class="page-title">❤️ รายการโปรด</span>
        <div style="width:38px"></div>
      </div>

      <p class="friend-name-label">ของ {{ selectedUser.displayName || selectedUser.email }}</p>

      <div v-if="loadingFavs" class="loading-center">
        <div class="pizza-spin">🍕</div>
      </div>

      <div v-else-if="friendFavs.length === 0" class="empty-state">
        <div style="font-size:40px">🔒</div>
        <p>ผู้ใช้นี้ยังไม่ได้แชร์รายการโปรด</p>
      </div>

      <div v-else class="fav-grid">
        <div v-for="fav in friendFavs" :key="fav.id" class="fav-card"
             @click="goMap(fav)">
          <img :src="fav.imageUrl" class="fav-img" @error="onImgError" />
          <p class="fav-restaurant">{{ fav.restaurantName }}</p>
          <p class="fav-menu">{{ fav.menuName }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFoodStore } from '@/stores/food'

const router = useRouter()
const foodStore = useFoodStore()

const users = ref([])
const selectedUser = ref(null)
const friendFavs = ref([])
const loadingUsers = ref(false)
const loadingFavs = ref(false)

onMounted(async () => {
  loadingUsers.value = true
  users.value = await foodStore.fetchAllUsers()
  loadingUsers.value = false
})

async function selectUser(u) {
  selectedUser.value = u
  loadingFavs.value = true
  friendFavs.value = await foodStore.fetchFriendFavorites(u.uid)
  loadingFavs.value = false
}

function goMap(menu) {
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
  padding: 14px 8px;
  border-bottom: 1px solid var(--gray-border);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
}
.user-row:hover { background: var(--red-light); }

.user-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  background: #FFD0B0;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; overflow: hidden; flex-shrink: 0;
}
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }

.user-name { flex: 1; font-size: 15px; font-weight: 500; }
.chevron { font-size: 20px; color: var(--gray-text); }

.friend-name-label {
  font-size: 13px; color: var(--text-sub);
  margin-bottom: 16px; margin-top: -8px;
}

.fav-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}
.fav-card {
  background: white; border: 1.5px solid var(--gray-border);
  border-radius: var(--radius-sm); overflow: hidden;
  box-shadow: var(--shadow-sm); cursor: pointer;
  transition: transform 0.15s;
}
.fav-card:hover { transform: translateY(-2px); }
.fav-img { width: 100%; height: 100px; object-fit: cover; }
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

.empty-state {
  display: flex; flex-direction: column;
  align-items: center; gap: 12px;
  margin-top: 80px; color: var(--text-sub); font-size: 15px;
}
.loading-center { display: flex; justify-content: center; margin-top: 80px; }
.pizza-spin { font-size: 40px; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
