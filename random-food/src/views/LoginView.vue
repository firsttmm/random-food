<template>
  <div class="view login-view">
    <div class="login-card">
      <button class="back-btn" @click="$router.push('/')">←</button>

      <h2 class="page-title" style="margin-bottom:32px">เข้าสู่ระบบ</h2>

      <div class="form-group">
        <input v-model="email" type="email" placeholder="อีเมล" class="input-field" />
      </div>
      <div class="form-group" style="position:relative">
        <input v-model="password" :type="showPass ? 'text' : 'password'"
               placeholder="รหัสผ่าน" class="input-field" />
        <button class="eye-btn" @click="showPass = !showPass">
          {{ showPass ? '🙈' : '👁️' }}
        </button>
      </div>

      <div style="text-align:right; margin-bottom:20px">
        <span class="link-text">ลืมรหัสผ่าน?</span>
      </div>

      <p v-if="error" class="error-text">{{ error }}</p>

      <button class="btn btn-primary" :disabled="loading" @click="handleLogin">
        {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
      </button>

      <p class="register-text">
        ยังไม่มีบัญชีใช่ไหม?
        <RouterLink to="/register" class="link-red">สมัครสมาชิก</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPass = ref(false)
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'กรุณากรอกอีเมลและรหัสผ่าน'
    return
  }
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 700px;
  background: #BDBDBD;
}

.login-card {
  background: white;
  border-radius: var(--radius);
  padding: 28px 24px;
  width: 300px;
  box-shadow: var(--shadow);
  position: relative;
}

.form-group { margin-bottom: 16px; }

.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.error-text {
  color: var(--red);
  font-size: 13px;
  margin-bottom: 12px;
  text-align: center;
}

.link-text { font-size: 13px; color: var(--red); cursor: pointer; }
.link-red { color: var(--red); font-weight: 600; text-decoration: none; }

.register-text {
  text-align: center;
  margin-top: 16px;
  font-size: 13px;
  color: var(--text-sub);
}
</style>
