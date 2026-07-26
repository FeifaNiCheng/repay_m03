<template>
  <div class="login-page">
    <div class="login-card glass anim-slide-up">
      <div class="scan-line"></div>
      <div class="login-head">
        <span class="brand-dot"></span>
        <h1>Repay M03</h1>
        <p>小鹏 MONA M03 Max 还款记录系统</p>
      </div>
      <div class="form">
        <div class="form-row">
          <label>账户</label>
          <a-select v-model:value="form.username" style="width:100%" size="large">
            <a-select-option value="admin">admin</a-select-option>
            <a-select-option value="xrz">xrz（仙人）</a-select-option>
            <a-select-option value="ds">ds（大帅）</a-select-option>
          </a-select>
        </div>
        <div class="form-row">
          <label>密码</label>
          <a-input-password v-model:value="form.password" size="large" placeholder="初始密码 admin123" @pressEnter="doLogin" />
        </div>
        <a-button type="primary" block size="large" :loading="loading" @click="doLogin">登录</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { login } from '../db/dao.js'
import { useAuth } from '../stores/auth.js'

const router = useRouter()
const { setUser } = useAuth()
const form = reactive({ username: 'xrz', password: '' })
const loading = ref(false)

async function doLogin () {
  if (!form.username || !form.password) { message.error('请填写账户和密码'); return }
  loading.value = true
  try {
    const user = await login(form.username, form.password)
    if (!user) {
      message.error('账户或密码错误')
    } else {
      setUser(user.username, user.nickname)
      message.success('欢迎回来，' + user.nickname)
      router.push('/dashboard')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px;
}
.login-card {
  width: 100%; max-width: 380px; padding: 40px 32px; position: relative; overflow: hidden;
}
.scan-line {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  animation: scan 1.2s ease-in-out infinite;
}
@keyframes scan {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.login-head { text-align: center; margin-bottom: 28px; }
.brand-dot {
  display: inline-block; width: 14px; height: 14px; border-radius: 50%;
  background: var(--accent); box-shadow: 0 0 14px rgba(10,132,255,0.5); margin-bottom: 12px;
}
.login-head h1 { font-size: 24px; font-weight: 700; }
.login-head p { font-size: var(--fs-meta); color: var(--ink-soft); margin-top: 4px; }
.form-row { margin-bottom: var(--sp-4); }
.form-row label { display: block; font-size: var(--fs-meta); color: var(--ink-soft); margin-bottom: var(--sp-2); }
</style>
