<template>
  <div class="view map-view">
    <div class="header-row">
      <button class="back-btn" @click="$router.back()">←</button>
      <span class="page-title">แผนที่</span>
      <div style="width:38px"></div>
    </div>

    <div id="leaflet-map" ref="mapContainer" class="map-container"></div>

    <div class="map-bottom">
      <div v-if="restaurantName" class="map-label">
        <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
        <span>{{ restaurantName }}</span>
      </div>
      <a :href="`https://www.google.com/maps?q=${lat},${lng}`"
         target="_blank" rel="noopener noreferrer"
         class="btn btn-primary open-maps-btn">
        <i class="fa-solid fa-map-location-dot" aria-hidden="true"></i>
        เปิดใน Google Maps
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import L from 'leaflet'

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const route = useRoute()
const mapContainer = ref(null)
let mapInstance = null

const lat = parseFloat(route.query.lat) || 13.2800
const lng = parseFloat(route.query.lng) || 100.9260
const restaurantName = route.query.name || ''

onMounted(() => {
  mapInstance = L.map(mapContainer.value).setView([lat, lng], 16)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapInstance)

  // Custom red marker
  const redIcon = L.divIcon({
    html: `<div style="background:#E53935;width:24px;height:24px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  })

  L.marker([lat, lng], { icon: redIcon })
    .addTo(mapInstance)
    .bindPopup(`<b>${restaurantName}</b>`)
    .openPopup()
})

onUnmounted(() => {
  if (mapInstance) mapInstance.remove()
})
</script>

<style scoped>
.map-view { padding-bottom: clamp(20px, 4vw, 28px); }

.map-container {
  width: 100%;
  height: clamp(300px, 56vh, 640px);
  border-radius: clamp(12px, 2vw, 16px);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}



.map-label i {
  color: var(--red);
}

@media (max-width: 767px) {
  .map-container {
    height: clamp(280px, 50vh, 520px);
  }
}
.map-bottom {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.open-maps-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
}

</style>
