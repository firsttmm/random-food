<template>
  <div class="view home-view">
    <!-- Header (logged in) -->
    <div v-if="authStore.isLoggedIn" class="header-row">
      <div style="width:38px"></div>
      <span class="page-title">สุ่มเมนูอาหาร</span>
      <RouterLink to="/profile" class="avatar">
        <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" />
        <span v-else>🧑</span>
      </RouterLink>
    </div>

    <!-- Center content -->
    <div class="home-center">
      <img src="https://em-content.zobj.net/source/google/350/pizza_1f355.png"
           class="pizza-logo" alt="pizza" />
      <h2 class="home-title">สุ่มเมนูอาหาร</h2>
    </div>

    <!-- Buttons -->
    <div class="home-buttons">
      <RouterLink to="/random" class="btn btn-primary">🎲 กดสุ่มเมนูอาหาร</RouterLink>

      <template v-if="authStore.isLoggedIn">
        <RouterLink to="/pin" class="btn btn-primary">📍 ปักหมุดร้านโดนใจ</RouterLink>
        <RouterLink to="/favorites" class="btn btn-primary">❤️ ดูรายการโปรด</RouterLink>
        <button class="btn btn-gray" @click="authStore.logout()">ออกจากระบบ</button>
      </template>
      <template v-else>
        <RouterLink to="/login" class="btn btn-outline">เข้าสู่ระบบ</RouterLink>
      </template>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 32px 20px 40px;
  min-height: 700px;
}

.home-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: center;
}

.pizza-logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.home-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}

.home-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
