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
        <button class="eye-btn" type="button" @click="showPass = !showPass">
          <i :class="showPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" aria-hidden="true"></i>
        </button>
      </div>

      <div style="text-align:right; margin-bottom:20px">
        <span class="link-text" @click="openForgot">ลืมรหัสผ่าน?</span>
      </div>

      <p v-if="error" class="error-text">{{ error }}</p>

      <button class="btn btn-primary" :disabled="loading" @click="handleLogin">
        {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
      </button>

      <p class="register-text">
        ยังไม่มีบัญชีใช่ไหม?
        <RouterLink to="/register" class="link-red">สมัครสมาชิก</RouterLink>
      </p>

          <Transition name="fade">
      <div v-if="showForgot" class="forgot-overlay" @click.self="showForgot = false">
        <div class="forgot-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
            <h3 style="font-size:16px; font-weight:700">ลืมรหัสผ่าน</h3>
            <button class="back-btn" @click="showForgot = false">✕</button>
          </div>
          <p style="font-size:13px; color:var(--text-sub); margin-bottom:14px">
            กรอกอีเมลที่ใช้สมัคร ระบบจะส่งลิงก์รีเซ็ตให้
          </p>
          <input v-model="resetEmail" type="email" placeholder="อีเมล"
                class="input-field" style="margin-bottom:12px" />
          <p v-if="resetError" style="color:var(--red); font-size:13px; margin-bottom:10px">
            {{ resetError }}
          </p>
          <p v-if="resetMsg" style="color:green; font-size:13px; margin-bottom:10px">
            {{ resetMsg }}
          </p>
          <button class="btn btn-primary" :disabled="resetLoading" @click="sendReset">
            {{ resetLoading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ต' }}
          </button>
        </div>
      </div>
    </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/firebase/config'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPass = ref(false)
const loading = ref(false)
const error = ref('')
const showForgot = ref(false)
const resetEmail = ref('')
const resetLoading = ref(false)
const resetMsg = ref('')
const resetError = ref('')


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

function openForgot() {
  resetEmail.value = email.value
  resetMsg.value = ''
  resetError.value = ''
  showForgot.value = true
}

async function sendReset() {
  resetError.value = ''
  resetMsg.value = ''
  if (!resetEmail.value) { resetError.value = 'กรุณากรอกอีเมล'; return }
  resetLoading.value = true
  try {
    await sendPasswordResetEmail(auth, resetEmail.value)
    resetMsg.value = 'ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว กรุณาเช็คกล่องจดหมาย'
  } catch (e) {
    if (e.code === 'auth/user-not-found') resetError.value = 'ไม่พบอีเมลนี้ในระบบ'
    else resetError.value = 'เกิดข้อผิดพลาด กรุณาลองใหม่'
  } finally {
    resetLoading.value = false
  }
}

</script>

<style scoped>
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  background: #BDBDBD;
  padding: clamp(18px, 5vw, 42px) 20px;
}

.login-card {
  background: white;
  border-radius: var(--radius);
  padding: clamp(22px, 4.5vw, 34px) clamp(18px, 4vw, 30px);
  width: min(100%, 420px);
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

.eye-btn i {
  color: var(--text-sub);
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

@media (max-width: 430px) {
  .login-view {
    background: white;
    padding: 0;
    align-items: flex-start;
  }

  .login-card {
    width: 100%;
    border-radius: 0;
    box-shadow: none;
    border: none;
    min-height: 100vh;
    padding-top: 40px;
  }
}

.forgot-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.forgot-box {
  background: white;
  border-radius: var(--radius);
  padding: 24px;
  width: min(90%, 340px);
  box-shadow: var(--shadow);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

</style>
