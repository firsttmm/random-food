<template>
  <div class="view login-view">
    <div class="login-card">
      <button class="back-btn" @click="$router.push('/login')">←</button>
      <h2 class="page-title" style="margin-bottom:28px">สมัครสมาชิก</h2>

      <div class="form-group">
        <input v-model="displayName" type="text" placeholder="ชื่อผู้ใช้" class="input-field" />
      </div>
      <div class="form-group">
        <input v-model="email" type="email" placeholder="อีเมล" class="input-field" />
      </div>
      <div class="form-group" style="position:relative">
        <input v-model="password" :type="showPass ? 'text' : 'password'"
               placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)" class="input-field" />
        <button class="eye-btn" @click="showPass = !showPass">
          {{ showPass ? '🙈' : '👁️' }}
        </button>
      </div>

      <p v-if="error" class="error-text">{{ error }}</p>

      <button class="btn btn-primary" :disabled="loading" @click="handleRegister">
        {{ loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก' }}
      </button>

      <p class="register-text">
        มีบัญชีอยู่แล้ว?
        <RouterLink to="/login" class="link-red">เข้าสู่ระบบ</RouterLink>
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

const displayName = ref('')
const email = ref('')
const password = ref('')
const showPass = ref(false)
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  error.value = ''
  if (!displayName.value || !email.value || !password.value) {
    error.value = 'กรุณากรอกข้อมูลให้ครบ'
    return
  }
  if (password.value.length < 6) {
    error.value = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    return
  }
  loading.value = true
  try {
    await authStore.register(email.value, password.value, displayName.value)
    router.push('/')
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') error.value = 'อีเมลนี้ถูกใช้แล้ว'
    else error.value = 'เกิดข้อผิดพลาด กรุณาลองใหม่'
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
}
.form-group { margin-bottom: 14px; }
.eye-btn {
  position: absolute; right: 12px; top: 50%;
  transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 16px;
}
.error-text { color: var(--red); font-size: 13px; margin-bottom: 12px; text-align: center; }
.link-red { color: var(--red); font-weight: 600; text-decoration: none; }
.register-text { text-align: center; margin-top: 16px; font-size: 13px; color: var(--text-sub); }
</style>
