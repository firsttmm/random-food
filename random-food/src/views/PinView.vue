<template>
  <div class="view pin-view">
    <div class="header-row">
      <button class="back-btn" @click="$router.push('/')">←</button>
      <span class="page-title">ปักหมุดร้านโดนใจ</span>
      <RouterLink to="/profile" class="avatar">🧑</RouterLink>
    </div>

    <!-- Success popup -->
    <Transition name="fade">
      <div v-if="showSuccess" class="popup-overlay" @click="showSuccess = false">
        <div class="popup-box" style="text-align:center">
          <div style="font-size:48px;margin-bottom:12px">🎉</div>
          <h3 style="font-size:18px;font-weight:700;margin-bottom:8px">ปักหมุดร้านโดนใจสำเร็จ!</h3>
          <RouterLink to="/favorites" class="btn btn-primary" style="margin-top:12px">ดูรายการโปรด</RouterLink>
        </div>
      </div>
    </Transition>

    <!-- Form -->
    <div class="pin-form">
      <input v-model="form.restaurantName" type="text"
             placeholder="ชื่อร้านอาหาร" class="input-field" />

      <input v-model="form.menuName" type="text"
             placeholder="ชื่อเมนูอาหาร" class="input-field" />

      <!-- Image upload -->
      <div class="img-upload" @click="imgInput.click()">
        <img v-if="previewUrl" :src="previewUrl" class="preview-img" />
        <div v-else class="upload-placeholder">
          <span style="font-size:28px">🖼️</span>
          <span style="font-size:13px;color:var(--gray-text)">แตะเพื่ออัปโหลดรูป</span>
        </div>
        <input ref="imgInput" type="file" accept="image/*" style="display:none"
               @change="onImageChange" />
      </div>

      <!-- Location -->
      <div class="location-field" @click="getLocation">
        <span>📍</span>
        <span class="loc-text">{{ locationText }}</span>
      </div>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

      <button class="btn btn-primary" :disabled="loading" @click="submitPin">
        {{ loading ? 'กำลังบันทึก...' : 'โดนใจ' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFoodStore } from '@/stores/food'

const authStore = useAuthStore()
const foodStore = useFoodStore()

const form = ref({
  restaurantName: '',
  menuName: '',
  imageUrl: ''
})
const imageFile = ref(null)
const previewUrl = ref('')
const imgInput = ref(null)
const loading = ref(false)
const showSuccess = ref(false)
const errorMsg = ref('')
const userLat = ref(null)
const userLng = ref(null)
const locationAddress = ref('')

const locationText = computed(() => {
  if (locationAddress.value) return locationAddress.value
  if (userLat.value) return `${userLat.value.toFixed(4)}, ${userLng.value.toFixed(4)}`
  return 'แตะเพื่อดึงตำแหน่งปัจจุบัน'
})

function onImageChange(e) {
  const file = e.target.files[0]
  if (!file) return
  imageFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

function getLocation() {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      userLat.value = pos.coords.latitude
      userLng.value = pos.coords.longitude
      // Reverse geocode using OpenStreetMap Nominatim (ฟรี)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${userLat.value}&lon=${userLng.value}&format=json`
        )
        const data = await res.json()
        locationAddress.value = data.display_name?.split(',').slice(0, 3).join(',') || ''
      } catch { /* ใช้ coordinates แทน */ }
    },
    () => { errorMsg.value = 'ไม่สามารถดึงตำแหน่งได้' }
  )
}

async function submitPin() {
  errorMsg.value = ''
  if (!form.value.restaurantName || !form.value.menuName) {
    errorMsg.value = 'กรุณากรอกชื่อร้านและชื่อเมนู'
    return
  }
  loading.value = true
  try {
    await foodStore.addPin(
      {
        restaurantName: form.value.restaurantName,
        menuName: form.value.menuName,
        lat: userLat.value || 13.2800,
        lng: userLng.value || 100.9260,
        address: locationAddress.value
      },
      imageFile.value
    )
    // Reset form
    form.value = { restaurantName: '', menuName: '' }
    imageFile.value = null
    previewUrl.value = ''
    userLat.value = null
    userLng.value = null
    locationAddress.value = ''

    showSuccess.value = true
    setTimeout(() => { showSuccess.value = false }, 3000)
  } catch (e) {
    errorMsg.value = e.message || 'เกิดข้อผิดพลาด'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.pin-form { display: flex; flex-direction: column; gap: 14px; }

.img-upload {
  border: 2px dashed var(--gray-border);
  border-radius: var(--radius-sm);
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  background: var(--red-light);
  transition: border-color 0.2s;
}
.img-upload:hover { border-color: var(--red); }

.preview-img {
  width: 100%; height: 100%; object-fit: cover;
}

.upload-placeholder {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}

.location-field {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px;
  background: var(--red-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  border: 1.5px solid var(--gray-border);
}
.loc-text { font-size: 14px; color: var(--text-sub); }

.error-msg { color: var(--red); font-size: 13px; }

/* fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
