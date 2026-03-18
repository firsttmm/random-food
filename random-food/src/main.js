// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
 import { runSeed } from './firebase/seedScript'
 runSeed().then(() => console.log('Seeded!'))
// Leaflet CSS
import 'leaflet/dist/leaflet.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// เริ่ม auth listener
const authStore = useAuthStore()
authStore.init()

app.mount('#app')
