<template>
  <div class="shell">
    <div class="glass topbar">
      <div class="brand" @click="goHome" title="返回首页">
        <span class="brand-dot"></span>
        <div class="brand-text">
          <h1>Repay M03</h1>
          <small>小鹏 MONA M03 Max 还款记录</small>
        </div>
      </div>
      <div class="topbar-right">
        <nav class="nav">
          <router-link to="/dashboard" class="nav-link">概览</router-link>
          <router-link to="/payments" class="nav-link">明细</router-link>
          <router-link to="/settings" class="nav-link">设置</router-link>
        </nav>
        <div class="user-chip">
          <span class="av">{{ state.nickname.charAt(0) }}</span>
          <span>{{ state.nickname }}</span>
          <a class="logout" @click="logout">退出</a>
        </div>
      </div>
    </div>
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth.js'

const { state, clearUser } = useAuth()
const router = useRouter()

function goHome () {
  router.push('/dashboard')
}

function logout () {
  clearUser()
  router.push('/login')
}
</script>

<style scoped>
.shell { max-width: 960px; margin: 0 auto; padding: 24px; }
.topbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px; margin-bottom: 20px;
}
.brand { display: flex; align-items: center; gap: 10px; }
.brand { cursor: pointer; transition: opacity 180ms var(--ease); }
.brand:hover { opacity: 0.7; }
.brand-text { transition: opacity 180ms var(--ease); }
.brand-dot {
  width: 10px; height: 10px; border-radius: 50%; background: var(--accent);
  box-shadow: 0 0 10px rgba(10,132,255,0.4);
}
.brand h1 { font-size: var(--fs-title); font-weight: 600; }
.brand small { color: var(--ink-soft); font-size: var(--fs-label); display: block; }
.topbar-right { display: flex; align-items: center; gap: 20px; }
.nav { display: flex; gap: 6px; }
.nav-link {
  font-size: var(--fs-body); color: var(--ink-soft); text-decoration: none;
  padding: 8px 18px; border-radius: 10px; font-weight: 500;
  transition: all 180ms var(--ease);
}
.nav-link:hover { background: var(--accent-soft); color: var(--accent); }
.nav-link.router-link-exact-active {
  background: var(--accent-soft); color: var(--accent); font-weight: 700;
  transform: translateY(-1px);
}
.user-chip { display: flex; align-items: center; gap: 8px; font-size: var(--fs-meta); color: var(--ink-soft); }
.av {
  width: 26px; height: 26px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #409CFF);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600;
}
.logout { color: var(--ink-faint); cursor: pointer; font-size: var(--fs-label); text-decoration: underline; }
.logout:hover { color: var(--warn); }
.content { animation: slideUp 300ms var(--ease) both; }
@media (max-width: 767px) {
  .shell { padding: 16px; }
  .topbar { flex-direction: column; gap: 12px; align-items: flex-start; }
  .topbar-right { width: 100%; justify-content: space-between; }
  .nav-link { padding: 6px 12px; font-size: var(--fs-meta); }
}
</style>
