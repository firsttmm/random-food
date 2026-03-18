<template>
  <div id="app-wrapper">
    <div class="phone-frame">
      <RouterView v-if="!authStore.loading" />
      <div v-else class="splash">
        <img src="/images/menus/Logo.png" style="width:80px;height:80px;object-fit:contain;animation:spin 1s linear infinite" />
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
  --content-max: 860px;
}

html,
body,
#app {
  width: 100%;
  min-height: 100%;
}

body {
  font-family: 'Sarabun', sans-serif;
  background: radial-gradient(circle at 20% 20%, #eceff1 0%, #d6dce0 45%, #b0bec5 100%);
  min-height: 100dvh;
}

#app-wrapper {
  width: 100%;
  min-height: 100dvh;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: clamp(0px, 2.5vw, 24px);
}

.phone-frame {
  width: min(100%, 980px);
  min-height: calc(100dvh - clamp(0px, 2.5vw, 24px) * 2);
  background: var(--white);
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.24);
  position: relative;
}

/* Mobile full width */
@media (max-width: 767px) {
  body { background: var(--white); }
  #app-wrapper { padding: 0; }
  .phone-frame {
    width: 100%;
    min-height: 100dvh;
    border-radius: 0;
    box-shadow: none;
  }
}

.splash {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60dvh;
  height: 100%;
  gap: 16px;
  padding: 32px 16px;
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
  padding: clamp(20px, 4vw, 30px) clamp(16px, 4vw, 28px);
  min-height: 100%;
  position: relative;
  max-width: var(--content-max);
  margin: 0 auto;
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
  gap: 12px;
  margin-bottom: clamp(18px, 3.2vw, 24px);
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

.avatar i {
  font-size: 18px;
  color: #7B4B32;
}

.icon-inline {
  margin-right: 6px;
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
