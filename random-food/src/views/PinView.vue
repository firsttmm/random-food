<template>
  <div class="view pin-view">
    <div class="header-row">
      <button class="back-btn" @click="$router.push('/')">←</button>
      <span class="page-title">ปักหมุดร้านโดนใจ</span>
      <RouterLink to="/profile" class="avatar">
        <i class="fa-solid fa-user" aria-hidden="true"></i>
      </RouterLink>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button :class="['tab', { active: activeTab === 'add' }]" @click="activeTab = 'add'">
        <i class="fa-solid fa-plus"></i> เพิ่มร้าน
      </button>
      <button :class="['tab', { active: activeTab === 'manage' }]" @click="openManage">
        <i class="fa-solid fa-list"></i> จัดการร้าน
        <span v-if="foodStore.userPins.length" class="tab-badge">
          {{ foodStore.userPins.length }}
        </span>
      </button>
    </div>

    <!-- ===== TAB: เพิ่มร้าน ===== -->
    <div v-if="activeTab === 'add'" class="pin-form">

      <!-- Success popup -->
      <Transition name="fade">
        <div v-if="showSuccess" class="popup-overlay" @click="showSuccess = false">
          <div class="popup-box" style="text-align:center">
            <div class="success-icon"><i class="fa-solid fa-circle-check"></i></div>
            <h3 style="font-size:18px;font-weight:700;margin-bottom:8px">ปักหมุดสำเร็จ!</h3>
            <div style="display:flex;gap:10px;margin-top:12px">
              <button class="btn btn-outline" @click="showSuccess = false">เพิ่มอีก</button>
              <RouterLink to="/favorites" class="btn btn-primary">ดูรายการโปรด</RouterLink>
            </div>
          </div>
        </div>
      </Transition>

      <input v-model="form.restaurantName" type="text" placeholder="ชื่อร้านอาหาร" class="input-field" />
      <input v-model="form.menuName" type="text" placeholder="ชื่อเมนูอาหาร" class="input-field" />

      <div class="img-upload" @click="imgInput.click()">
        <img v-if="previewUrl" :src="previewUrl" class="preview-img" />
        <div v-else class="upload-placeholder">
          <i class="fa-regular fa-image upload-icon"></i>
          <span>แตะเพื่ออัปโหลดรูป</span>
        </div>
        <input ref="imgInput" type="file" accept="image/*" style="display:none" @change="onImageChange" />
      </div>

      <div class="location-section">
        <p class="loc-label"> ตำแหน่งร้าน</p>
        <div class="loc-options">
          <button type="button" class="loc-opt-btn" @click="getLocation" :disabled="gettingLocation">
            <i class="fa-solid fa-location-crosshairs"></i>
            {{ gettingLocation ? 'กำลังดึง...' : 'ตำแหน่งปัจจุบัน' }}
          </button>
          <button type="button" class="loc-opt-btn" @click="showManual = !showManual">
            <i class="fa-solid fa-keyboard"></i> กรอกเอง
          </button>
          <button type="button" class="loc-opt-btn" @click="showMapPicker = true">
            <i class="fa-solid fa-map"></i> เลือกจากแผนที่
          </button>
        </div>
        <div v-if="showManual" class="manual-inputs">
          <input v-model="manualAddress" type="text" placeholder="ชื่อสถานที่ / ที่อยู่" class="input-field" />
          <div style="display:flex;gap:8px">
            <input v-model.number="manualLat" type="number" step="any" placeholder="Latitude" class="input-field" />
            <input v-model.number="manualLng" type="number" step="any" placeholder="Longitude" class="input-field" />
          </div>
          <button type="button" class="btn btn-outline btn-sm" style="width:auto" @click="applyManual">✓ ใช้ตำแหน่งนี้</button>
        </div>
        <div v-if="userLat" class="loc-result">
          <i class="fa-solid fa-circle-check" style="color:#2E7D32"></i>
          <span>{{ locationText }}</span>
          <button type="button" class="clear-loc" @click="clearLocation">✕</button>
        </div>
      </div>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      <button class="btn btn-primary" :disabled="loading" @click="submitPin">
        <i class="fa-solid fa-location-dot"></i>
        {{ loading ? 'กำลังบันทึก...' : 'โดนใจ' }}
      </button>
    </div>

    <!-- ===== TAB: จัดการร้าน ===== -->
    <div v-if="activeTab === 'manage'">
      <div v-if="loadingPins" class="loading-center">
        <i class="fa-solid fa-pizza-slice fa-spin" style="font-size:32px;color:var(--red)"></i>
      </div>
      <div v-else-if="foodStore.userPins.length === 0" class="empty-pins">
        <i class="fa-solid fa-map-pin" style="font-size:40px;color:var(--gray-border)"></i>
        <p>ยังไม่มีร้านที่ปักหมุด</p>
        <button class="btn btn-primary" style="margin-top:8px" @click="activeTab = 'add'">
          <i class="fa-solid fa-plus"></i> เพิ่มร้านเลย
        </button>
      </div>
      <div v-else class="manage-grid">
        <div v-for="pin in foodStore.userPins" :key="pin.id" class="manage-card">
          <img :src="pin.imageUrl || fallbackImg" class="manage-img" @error="onImgError" />
          <div class="manage-info">
            <p class="manage-restaurant">{{ pin.restaurantName }}</p>
            <p class="manage-menu">{{ pin.menuName }}</p>
            <p v-if="pin.address" class="manage-address">
              <i class="fa-solid fa-location-dot" style="color:var(--red);font-size:11px"></i>
              {{ pin.address }}
            </p>
            <div class="manage-actions">
              <button class="action-btn fav-action" @click="addPinToFav(pin)">
                <i class="fa-solid fa-heart"></i> โปรด
              </button>
              <button class="action-btn edit-action" @click="startEditPin(pin)">
                <i class="fa-solid fa-pen"></i> แก้ไข
              </button>
              <button class="action-btn del-action" @click="removePin(pin.id)">
                <i class="fa-solid fa-trash"></i> ลบ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Pin Modal -->
    <Transition name="fade">
      <div v-if="editingPin" class="popup-overlay" @click.self="editingPin = null">
        <div class="popup-box">
          <div class="header-row" style="margin-bottom:16px">
            <span class="page-title" style="font-size:16px">แก้ไขข้อมูล</span>
            <button class="back-btn" @click="editingPin = null"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px">
            <input v-model="editForm.restaurantName" type="text" placeholder="ชื่อร้านอาหาร" class="input-field" />
            <input v-model="editForm.menuName" type="text" placeholder="ชื่อเมนูอาหาร" class="input-field" />
            <p v-if="editError" class="error-msg">{{ editError }}</p>
            <button class="btn btn-primary" :disabled="savingEdit" @click="saveEditPin">
              {{ savingEdit ? 'กำลังบันทึก...' : 'บันทึก' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Map Picker Modal -->
    <Transition name="fade">
      <div v-if="showMapPicker" class="popup-overlay" @click.self="showMapPicker = false">
        <div class="map-picker-box">
          <div class="map-picker-header">
            <span style="font-weight:700">แตะแผนที่เพื่อเลือกตำแหน่ง</span>
            <button class="back-btn" @click="showMapPicker = false">✕</button>
          </div>
          <div ref="pickerMapContainer" class="picker-map"></div>
          <p class="picker-hint">
            <i class="fa-solid fa-location-dot" style="color:var(--red)"></i>
            {{ pickerLat ? `${pickerLat.toFixed(5)}, ${pickerLng.toFixed(5)}` : 'แตะเพื่อปักหมุด' }}
          </p>
          <button class="btn btn-primary" :disabled="!pickerLat" @click="confirmMapPick">✓ ยืนยันตำแหน่งนี้</button>
        </div>
      </div>
    </Transition>

    <!-- Toast -->
    <Transition name="slide-up">
      <div v-if="favToast" class="fav-toast">
        <i class="fa-solid fa-heart"></i> {{ favToast }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFoodStore } from '@/stores/food'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import L from 'leaflet'

const authStore = useAuthStore()
const foodStore = useFoodStore()

const activeTab = ref('add')
const loadingPins = ref(false)
const fallbackImg = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'

const form = ref({ restaurantName: '', menuName: '' })
const imageFile = ref(null)
const previewUrl = ref('')
const imgInput = ref(null)
const loading = ref(false)
const showSuccess = ref(false)
const errorMsg = ref('')
const userLat = ref(null)
const userLng = ref(null)
const locationAddress = ref('')
const gettingLocation = ref(false)
const showManual = ref(false)
const manualAddress = ref('')
const manualLat = ref(null)
const manualLng = ref(null)
const showMapPicker = ref(false)
const pickerMapContainer = ref(null)
const pickerLat = ref(null)
const pickerLng = ref(null)
let pickerMap = null
let pickerMarker = null

const editingPin = ref(null)
const editForm = ref({ restaurantName: '', menuName: '' })
const savingEdit = ref(false)
const editError = ref('')
const favToast = ref('')

const locationText = computed(() => {
  if (locationAddress.value) return locationAddress.value
  if (userLat.value) return `${userLat.value.toFixed(4)}, ${userLng.value.toFixed(4)}`
  return ''
})

async function openManage() {
  activeTab.value = 'manage'
  if (foodStore.userPins.length === 0) {
    loadingPins.value = true
    await foodStore.fetchUserPins()
    loadingPins.value = false
  }
}

function onImageChange(e) {
  const file = e.target.files[0]
  if (!file) return
  imageFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

async function getLocation() {
  if (!navigator.geolocation) return
  gettingLocation.value = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      userLat.value = pos.coords.latitude
      userLng.value = pos.coords.longitude
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLat.value}&lon=${userLng.value}&format=json`)
        const data = await res.json()
        locationAddress.value = data.display_name?.split(',').slice(0, 3).join(',') || ''
      } catch { }
      gettingLocation.value = false
    },
    () => { errorMsg.value = 'ไม่สามารถดึงตำแหน่งได้'; gettingLocation.value = false }
  )
}

function applyManual() {
  if (!manualLat.value || !manualLng.value) { errorMsg.value = 'กรุณากรอก Latitude และ Longitude'; return }
  userLat.value = manualLat.value; userLng.value = manualLng.value
  locationAddress.value = manualAddress.value || `${manualLat.value}, ${manualLng.value}`
  showManual.value = false
}

function clearLocation() { userLat.value = null; userLng.value = null; locationAddress.value = '' }

function confirmMapPick() {
  if (!pickerLat.value) return
  userLat.value = pickerLat.value; userLng.value = pickerLng.value
  locationAddress.value = `${pickerLat.value.toFixed(5)}, ${pickerLng.value.toFixed(5)}`
  showMapPicker.value = false; pickerLat.value = null; pickerLng.value = null
  if (pickerMap) { pickerMap.remove(); pickerMap = null }
}

watch(showMapPicker, async (val) => {
  if (!val) return
  await nextTick()
  pickerMap = L.map(pickerMapContainer.value).setView([userLat.value || 13.2800, userLng.value || 100.9260], 15)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(pickerMap)
  pickerMap.on('click', (e) => {
    pickerLat.value = e.latlng.lat; pickerLng.value = e.latlng.lng
    if (pickerMarker) pickerMarker.remove()
    pickerMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(pickerMap)
  })
})

async function submitPin() {
  errorMsg.value = ''
  if (!form.value.restaurantName || !form.value.menuName) { errorMsg.value = 'กรุณากรอกชื่อร้านและชื่อเมนู'; return }
  loading.value = true
  try {
    await foodStore.addPin({ restaurantName: form.value.restaurantName, menuName: form.value.menuName, lat: userLat.value || 13.2800, lng: userLng.value || 100.9260, address: locationAddress.value }, imageFile.value)
    form.value = { restaurantName: '', menuName: '' }
    imageFile.value = null; previewUrl.value = ''
    userLat.value = null; userLng.value = null; locationAddress.value = ''
    showSuccess.value = true
    setTimeout(() => { showSuccess.value = false }, 4000)
  } catch (e) { errorMsg.value = e.message || 'เกิดข้อผิดพลาด' }
  finally { loading.value = false }
}

async function removePin(id) {
  if (!confirm('ลบปักหมุดนี้?')) return
  await foodStore.removePin(id)
}

async function addPinToFav(pin) {
  try {
    await foodStore.addFavorite(pin)
    favToast.value = `เพิ่ม "${pin.menuName}" เข้ารายการโปรดแล้ว`
  } catch (e) { favToast.value = e.message || 'มีในรายการโปรดแล้ว' }
  setTimeout(() => { favToast.value = '' }, 2500)
}

function startEditPin(pin) {
  editingPin.value = pin
  editForm.value = { restaurantName: pin.restaurantName, menuName: pin.menuName }
  editError.value = ''
}

async function saveEditPin() {
  editError.value = ''
  if (!editForm.value.restaurantName || !editForm.value.menuName) { editError.value = 'กรุณากรอกชื่อร้านและชื่อเมนู'; return }
  savingEdit.value = true
  try {
    await updateDoc(doc(db, 'users', authStore.user.uid, 'pins', editingPin.value.id), { restaurantName: editForm.value.restaurantName, menuName: editForm.value.menuName })
    const idx = foodStore.userPins.findIndex(p => p.id === editingPin.value.id)
    if (idx !== -1) { foodStore.userPins[idx].restaurantName = editForm.value.restaurantName; foodStore.userPins[idx].menuName = editForm.value.menuName }
    editingPin.value = null
  } catch { editError.value = 'เกิดข้อผิดพลาด กรุณาลองใหม่' }
  finally { savingEdit.value = false }
}

function onImgError(e) { e.target.src = fallbackImg }
</script>

<style scoped>
.tabs { display: flex; border: 1.5px solid var(--gray-border); border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 20px; }
.tab { flex: 1; padding: 10px 8px; background: white; border: none; cursor: pointer; font-family: 'Sarabun', sans-serif; font-size: 14px; font-weight: 600; color: var(--text-sub); display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; border-right: 1.5px solid var(--gray-border); }
.tab:last-child { border-right: none; }
.tab.active { background: var(--red); color: white; }
.tab-badge { background: white; color: var(--red); font-size: 11px; font-weight: 700; padding: 1px 7px; border-radius: 50px; }
.tab.active .tab-badge { background: rgba(255,255,255,0.3); color: white; }

.pin-form { display: flex; flex-direction: column; gap: 14px; }
.img-upload { border: 2px dashed var(--gray-border); border-radius: var(--radius-sm); height: clamp(160px, 34vw, 220px); display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; background: var(--red-light); transition: border-color 0.2s; }
.img-upload:hover { border-color: var(--red); }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.upload-icon { font-size: 28px; color: var(--text-sub); }

.location-section { display: flex; flex-direction: column; gap: 10px; }
.loc-label { font-size: 14px; font-weight: 600; color: var(--text); }
.loc-options { display: flex; gap: 8px; flex-wrap: wrap; }
.loc-opt-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 50px; border: 1.5px solid var(--gray-border); background: white; font-family: 'Sarabun', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.loc-opt-btn:hover { border-color: var(--red); color: var(--red); }
.loc-opt-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.manual-inputs { display: flex; flex-direction: column; gap: 8px; padding: 12px; background: var(--red-light); border-radius: var(--radius-sm); }
.loc-result { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #E8F5E9; border-radius: var(--radius-sm); font-size: 13px; }
.loc-result span { flex: 1; }
.clear-loc { background: none; border: none; cursor: pointer; font-size: 14px; color: var(--text-sub); }
.error-msg { color: var(--red); font-size: 13px; }
.success-icon { font-size: 48px; margin-bottom: 12px; color: #2E7D32; }

.manage-grid { display: flex; flex-direction: column; gap: 12px; }
.manage-card { display: flex; gap: 12px; background: white; border: 1.5px solid var(--gray-border); border-radius: var(--radius-sm); overflow: hidden; box-shadow: var(--shadow-sm); }
.manage-img { width: 90px; height: 90px; object-fit: cover; flex-shrink: 0; }
.manage-info { flex: 1; padding: 10px 12px 10px 0; display: flex; flex-direction: column; gap: 3px; }
.manage-restaurant { font-size: 11px; color: var(--text-sub); }
.manage-menu { font-size: 14px; font-weight: 700; }
.manage-address { font-size: 11px; color: var(--text-sub); display: flex; align-items: flex-start; gap: 4px; line-height: 1.4; }
.manage-actions { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
.action-btn { display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 50px; border: none; font-family: 'Sarabun', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.fav-action { background: #FCE4EC; color: #C62828; }
.fav-action:hover { background: #F8BBD9; }
.edit-action { background: #E3F2FD; color: #1565C0; }
.edit-action:hover { background: #BBDEFB; }
.del-action { background: var(--red-light); color: var(--red); }
.del-action:hover { background: #ffcdd2; }

.empty-pins { display: flex; flex-direction: column; align-items: center; gap: 10px; color: var(--text-sub); font-size: 14px; margin-top: 40px; }
.loading-center { display: flex; justify-content: center; margin-top: 40px; }

.map-picker-box { background: white; border-radius: var(--radius); padding: 20px; width: min(92%, 480px); box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 12px; }
.map-picker-header { display: flex; justify-content: space-between; align-items: center; }
.picker-map { width: 100%; height: 320px; border-radius: var(--radius-sm); overflow: hidden; }
.picker-hint { font-size: 13px; color: var(--text-sub); display: flex; align-items: center; gap: 6px; }

.fav-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #1B5E20; color: white; padding: 10px 20px; border-radius: 50px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; box-shadow: var(--shadow); z-index: 200; white-space: nowrap; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateX(-50%) translateY(16px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>