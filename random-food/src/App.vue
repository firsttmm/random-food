<template>
  <div id="app-wrapper">
    <div class="phone-frame">
      <RouterView v-if="!authStore.loading" />
      <div v-else class="splash">
        <div class="pizza-spin">🍕</div>
        <p>กำลังโหลด...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --red: #E53935;
  --red-light: #FFEBEE;
  --red-dark: #B71C1C;
  --white: #FFFFFF;
  --gray-bg: #F5F5F5;
  --gray-border: #E0E0E0;
  --gray-text: #9E9E9E;
  --text: #212121;
  --text-sub: #757575;
  --radius: 16px;
  --radius-sm: 10px;
  --shadow: 0 4px 20px rgba(0,0,0,0.1);
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
}

body {
  font-family: 'Sarabun', sans-serif;
  background: #BDBDBD;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

#app-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.phone-frame {
  width: 390px;
  min-height: 700px;
  background: var(--white);
  border-radius: 40px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  position: relative;
}

/* Mobile full width */
@media (max-width: 430px) {
  body { background: var(--white); }
  #app-wrapper { padding: 0; }
  .phone-frame {
    width: 100%;
    min-height: 100vh;
    border-radius: 0;
    box-shadow: none;
  }
}

.splash {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 700px;
  gap: 16px;
}

.pizza-spin {
  font-size: 48px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Shared utility styles */
.view {
  padding: 24px 20px;
  min-height: 700px;
  position: relative;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 24px;
  border-radius: 50px;
  border: none;
  font-family: 'Sarabun', sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-decoration: none;
}

.btn-primary {
  background: var(--red);
  color: white;
}
.btn-primary:hover { background: var(--red-dark); transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }

.btn-outline {
  background: transparent;
  color: var(--red);
  border: 2px solid var(--red);
}
.btn-outline:hover { background: var(--red-light); }

.btn-gray {
  background: var(--gray-bg);
  color: var(--gray-text);
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
  width: auto;
}

.back-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  color: var(--text);
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #FFD0B0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  text-decoration: none;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid var(--gray-border);
  border-radius: var(--radius-sm);
  font-family: 'Sarabun', sans-serif;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  background: var(--red-light);
  color: var(--text);
}
.input-field:focus { border-color: var(--red); background: white; }
.input-field::placeholder { color: var(--gray-text); }

.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

.popup-box {
  background: white;
  border-radius: var(--radius);
  padding: 24px;
  margin: 0 24px;
  width: 100%;
  max-width: 340px;
  box-shadow: var(--shadow);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  background: var(--red);
  color: white;
}
</style>
