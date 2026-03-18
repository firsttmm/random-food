<template>
  <div class="view home-view">
    <!-- Header (logged in) -->
    <div v-if="authStore.isLoggedIn" class="header-row">
      <div style="width:38px"></div>
      <span class="page-title">สุ่มเมนูอาหาร</span>
      <RouterLink to="/profile" class="avatar">
        <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" />
        <i v-else class="fa-solid fa-user" aria-hidden="true"></i>
      </RouterLink>
    </div>

    <!-- Center content -->
    <div class="home-center">
      <img src="/images/menus/Logo.png" class="pizza-logo" alt="random food" />
      <h2 class="home-title">สุ่มเมนูอาหาร</h2>
    </div>

    <!-- Buttons -->
    <div class="home-buttons">
      <RouterLink to="/random" class="btn btn-primary">
        <i class="fa-solid fa-dice" aria-hidden="true"></i>
        กดสุ่มเมนูอาหาร
      </RouterLink>

      <template v-if="authStore.isLoggedIn">
        <RouterLink to="/pin" class="btn btn-primary">
          <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
          ปักหมุดร้านโดนใจ
        </RouterLink>
        <RouterLink to="/favorites" class="btn btn-primary">
          <i class="fa-solid fa-heart" aria-hidden="true"></i>
          ดูรายการโปรด
        </RouterLink>
    
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

.home-buttons .btn i {
  margin-right: 6px;
}
</style>
