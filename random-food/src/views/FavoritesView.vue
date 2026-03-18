<template>
  <div class="view fav-view">
    <div class="header-row">
      <button class="back-btn" @click="$router.push('/')">←</button>
      <span class="page-title title-with-icon">
        <i class="fa-solid fa-heart" aria-hidden="true"></i>
        รายการโปรด
        <i class="fa-solid fa-lock lock-icon" aria-hidden="true"></i>
      </span>
      <RouterLink to="/profile" class="avatar">
        <i class="fa-solid fa-user" aria-hidden="true"></i>
      </RouterLink>
    </div>

    <!-- Action buttons -->
    <div class="action-row">
      <button class="btn btn-primary btn-sm" @click="doRandomFav">
        <i class="fa-solid fa-dice" aria-hidden="true"></i>
        กดสุ่ม
      </button>
      <button class="btn btn-outline btn-sm" @click="$router.push('/peek')">
        <i class="fa-solid fa-eye" aria-hidden="true"></i>
        ส่อง
      </button>
      <button class="btn btn-outline btn-sm" @click="openShare">
        <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>
        แชร์ลิสต์
      </button>
    </div>

    <!-- Random result popup -->
    <Transition name="fade">
      <div v-if="randomResult" class="popup-overlay" @click="randomResult = null">
        <div class="popup-box">
          <div class="header-row" style="margin-bottom:12px">
            <span class="page-title" style="font-size:16px">สุ่มรายการโปรด</span>
            <button class="back-btn" @click="randomResult = null">
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </div>
          <img :src="randomResult.imageUrl" class="rand-img" @error="onImgError" />
          <div style="margin-top:10px">
            <span class="tag">{{ randomResult.restaurantName }}</span>
            <h3 class="rand-name">{{ randomResult.menuName }}</h3>
            <button class="btn btn-primary" style="margin-top:12px"
                    @click="goMap(randomResult)">
              <i class="fa-solid fa-map-location-dot" aria-hidden="true"></i>
              ดูแผนที่
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Loading -->
    <div v-if="loading" class="loading-center">
      <div class="pizza-spin">
        <i class="fa-solid fa-pizza-slice" aria-hidden="true"></i>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="foodStore.favorites.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fa-solid fa-heart-crack" aria-hidden="true"></i>
      </div>
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
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
          ลบออก
        </button>
      </div>
    </div>
      <!-- Share Modal -->
      <Transition name="fade">
        <div v-if="showShareModal" class="popup-overlay" @click.self="showShareModal = false">
          <div class="popup-box">
            <div class="header-row" style="margin-bottom:16px">
              <span class="page-title" style="font-size:16px">
                <i class="fa-solid fa-share-nodes"></i> แชร์รายการโปรด
              </span>
              <button class="back-btn" @click="showShareModal = false">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <!-- Toggle share -->
            <div class="share-toggle-row">
              <div>
                <p style="font-size:15px; font-weight:600">เปิดการแชร์</p>
                <p style="font-size:12px; color:var(--text-sub)">
                  คนอื่นจะเห็นลิสต์นี้และสุ่มได้
                </p>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="shareEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <!-- Share name -->
            <Transition name="slide">
              <div v-if="shareEnabled" class="share-name-section">
                <p style="font-size:13px; font-weight:600; margin-bottom:6px">
                  ชื่อลิสต์ที่แสดงต่อสาธารณะ
                </p>
                <input v-model="shareName" type="text"
                      :placeholder="`ลิสต์ของ ${authStore.user?.displayName || 'ฉัน'}`"
                      class="input-field" maxlength="30" />
                <p style="font-size:11px; color:var(--text-sub); margin-top:4px">
                  จะแสดงแค่ชื่อนี้และ Username เท่านั้น
                </p>

                <!-- Share link preview -->
                <div class="share-preview">
                  <i class="fa-solid fa-user-circle" style="font-size:20px; color:var(--red)"></i>
                  <div>
                    <p style="font-size:13px; font-weight:600">
                      {{ shareName || `ลิสต์ของ ${authStore.user?.displayName}` }}
                    </p>
                    <p style="font-size:11px; color:var(--text-sub)">
                      @{{ authStore.user?.displayName }}
                      · {{ foodStore.favorites.length }} เมนู
                    </p>
                  </div>
                </div>
              </div>
            </Transition>

            <p v-if="shareMsg" class="share-msg">{{ shareMsg }}</p>

            <button class="btn btn-primary" :disabled="savingShare" @click="saveShare">
              {{ savingShare ? 'กำลังบันทึก...' : 'บันทึก' }}
            </button>
          </div>
        </div>
      </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFoodStore } from '@/stores/food'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const foodStore = useFoodStore()
const authStore = useAuthStore()
const loading = ref(false)
const randomResult = ref(null)

// Share
const showShareModal = ref(false)
const shareEnabled = ref(false)
const shareName = ref('')
const savingShare = ref(false)
const shareMsg = ref('')



onMounted(async () => {
  if (foodStore.favorites.length === 0) {
    loading.value = true
    await foodStore.fetchFavorites()
    loading.value = false
  }
})

async function openShare() {
  shareMsg.value = ''
  const settings = await foodStore.fetchShareSettings()
  shareEnabled.value = settings?.enabled || false
  shareName.value = settings?.name || ''
  showShareModal.value = true
}

async function saveShare() {
  savingShare.value = true
  shareMsg.value = ''
  try {
    await foodStore.updateShareSettings({
      enabled: shareEnabled.value,
      name: shareName.value || `ลิสต์ของ ${authStore.user?.displayName}`,
      updatedAt: new Date()
    })
    shareMsg.value = shareEnabled.value
      ? ' เปิดแชร์แล้ว คนอื่นสามารถดูลิสต์ของคุณได้'
      : ' ปิดแชร์แล้ว'
    setTimeout(() => { shareMsg.value = '' }, 2500)
  } catch {
    shareMsg.value = 'เกิดข้อผิดพลาด กรุณาลองใหม่'
  } finally {
    savingShare.value = false
  }
}

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
.fav-view { padding-bottom: clamp(24px, 5vw, 40px); }

.action-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.action-row .btn { flex: 1 1 160px; }
.action-row .btn i,
.remove-btn i {
  margin-right: 6px;
}

.title-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.lock-icon {
  font-size: 12px;
  color: var(--text-sub);
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
  display: flex;
  flex-direction: column;
}

.fav-img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

.fav-img {
  width: 100%; height: clamp(100px, 22vw, 140px); object-fit: cover;
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
  margin-top: clamp(48px, 12vh, 90px); color: var(--text-sub);
  font-size: 15px;
}

.empty-icon {
  font-size: 48px;
  color: #D84315;
}

.loading-center {
  display: flex; justify-content: center; margin-top: clamp(48px, 12vh, 90px);
}

@media (max-width: 420px) {
  .action-row .btn {
    flex-basis: 100%;
  }
}
.pizza-spin { font-size: 40px; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.share-toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1.5px solid var(--gray-border);
  margin-bottom: 14px;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
}
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider {
  position: absolute;
  inset: 0;
  background: #ccc;
  border-radius: 50px;
  transition: 0.3s;
  cursor: pointer;
}
.toggle-slider::before {
  content: '';
  position: absolute;
  width: 20px; height: 20px;
  left: 3px; top: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
}
.toggle input:checked + .toggle-slider { background: var(--red); }
.toggle input:checked + .toggle-slider::before { transform: translateX(22px); }

.share-name-section {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
}

.share-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--red-light);
  border-radius: var(--radius-sm);
  margin-top: 10px;
}

.share-msg {
  font-size: 13px;
  color: var(--text-sub);
  text-align: center;
  margin-bottom: 8px;
}

.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-6px); }


</style>
