<template>
  <div class="view map-view">
    <div class="header-row">
      <button class="back-btn" @click="$router.back()">←</button>
      <span class="page-title">แผนที่</span>
      <div style="width:38px"></div>
    </div>

    <div id="leaflet-map" ref="mapContainer" class="map-container"></div>

    <div v-if="restaurantName" class="map-label">
      📍 {{ restaurantName }}
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
.map-view { padding-bottom: 0; }

.map-container {
  width: 100%;
  height: 480px;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.map-label {
  margin-top: 16px;
  padding: 12px 16px;
  background: var(--red-light);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
</style>
