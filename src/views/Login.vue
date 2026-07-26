<template>
  <div class="login-page">
    <!-- 登录页专属：柔和的蓝紫粉渐变光团 + 不规则有机形状 -->
    <div class="geo-bg" aria-hidden="true">
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" class="geo-svg">
        <defs>
          <!-- 紫粉主调径向渐变，柔和光团 -->
          <radialGradient id="orbPurple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#B98CFF" stop-opacity="0.3" />
            <stop offset="60%" stop-color="#B98CFF" stop-opacity="0.09" />
            <stop offset="100%" stop-color="#B98CFF" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="orbPink" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FF9EC9" stop-opacity="0.3" />
            <stop offset="60%" stop-color="#FF9EC9" stop-opacity="0.09" />
            <stop offset="100%" stop-color="#FF9EC9" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="orbPink2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFB3D9" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#FFB3D9" stop-opacity="0" />
          </radialGradient>
          <!-- 模糊滤镜，让边缘更柔和 -->
          <filter id="softBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <!-- 彩带渐变：紫到粉的流动渐变 -->
          <linearGradient id="ribbonA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#B98CFF" stop-opacity="0" />
            <stop offset="30%" stop-color="#B98CFF" stop-opacity="0.9" />
            <stop offset="70%" stop-color="#FF9EC9" stop-opacity="0.9" />
            <stop offset="100%" stop-color="#FF9EC9" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="ribbonB" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#FF9EC9" stop-opacity="0" />
            <stop offset="35%" stop-color="#FFB3D9" stop-opacity="0.85" />
            <stop offset="65%" stop-color="#B98CFF" stop-opacity="0.85" />
            <stop offset="100%" stop-color="#B98CFF" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="ribbonC" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#B98CFF" stop-opacity="0" />
            <stop offset="50%" stop-color="#D4B0FF" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#FF9EC9" stop-opacity="0" />
          </linearGradient>
        </defs>
        <!-- 不规则有机 blob 形状，缓慢漂浮变形 -->
        <g filter="url(#softBlur)">
          <path class="blob blob-2" fill="url(#orbPurple)"
            d="M 820,180 C 920,140 1040,220 1020,340 C 1000,460 880,480 800,400 C 720,320 720,220 820,180 Z" />
          <path class="blob blob-3" fill="url(#orbPink)"
            d="M 600,560 C 700,520 820,600 780,700 C 740,800 600,780 520,720 C 440,660 500,600 600,560 Z" />
         <path class="blob blob-5" fill="url(#orbPink2)"
           d="M 980,560 C 1060,540 1120,620 1080,680 C 1040,740 960,700 940,640 C 920,580 900,580 980,560 Z" />
       </g>
        <!-- 屏保式彩带舞动：多条长波浪带，大幅垂直起伏，各自横向流动穿插 -->
        <g class="geo-wire geo-wire-1" fill="none" stroke="url(#ribbonA)" stroke-width="3.5" stroke-linecap="round" opacity="0.47">
          <path d="M -400,400 C -100,100 200,700 500,400 C 800,100 1100,700 1400,400 C 1700,100 2000,700 2300,400" />
        </g>
        <g class="geo-wire geo-wire-2" fill="none" stroke="url(#ribbonB)" stroke-width="2.2" stroke-linecap="round" opacity="0.47">
          <path d="M -400,400 C -100,700 200,100 500,400 C 800,700 1100,100 1400,400 C 1700,700 2000,100 2300,400" />
        </g>
        <g class="geo-wire geo-wire-3" fill="none" stroke="url(#ribbonC)" stroke-width="1.1" stroke-linecap="round" opacity="0.47">
          <path d="M -400,400 C -100,250 200,550 500,400 C 800,250 1100,550 1400,400 C 1700,250 2000,550 2300,400" />
        </g>
        <g class="geo-wire geo-wire-4" fill="none" stroke="url(#ribbonA)" stroke-width="1.6" stroke-linecap="round" opacity="0.47">
          <path d="M -400,200 C -100,50 200,350 500,200 C 800,50 1100,350 1400,200 C 1700,50 2000,350 2300,200" />
        </g>
        <g class="geo-wire geo-wire-5" fill="none" stroke="url(#ribbonB)" stroke-width="1.6" stroke-linecap="round" opacity="0.47">
          <path d="M -400,600 C -100,750 200,450 500,600 C 800,750 1100,450 1400,600 C 1700,750 2000,450 2300,600" />
        </g>
      </svg>
    </div>

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
          <a-input v-model:value="form.username" size="large" placeholder="请输入账户" allow-clear autocomplete="username" />
        </div>
        <div class="form-row">
          <label>密码</label>
          <a-input-password v-model:value="form.password" size="large" placeholder="初始密码 admin123" @pressEnter="doLogin" />
        </div>
        <div class="remember-row">
          <a-checkbox v-model:checked="remember">记住我</a-checkbox>
          <span class="remember-hint">仅保存账户密码，下次仍需手动登录</span>
        </div>
        <a-button type="primary" block size="large" :loading="loading" @click="doLogin">登录</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { login } from '../db/dao.js'
import { useAuth } from '../stores/auth.js'

const router = useRouter()
const { setUser } = useAuth()
const form = reactive({ username: '', password: '' })
const loading = ref(false)
const remember = ref(false)

// 进入登录页：如果之前记住过，回填账户密码并勾选"记住我"
// 注意：只回填不自动登录，仍需手动点登录按钮
onMounted(() => {
  const saved = localStorage.getItem('repay_remember')
  if (saved) {
    try {
      const obj = JSON.parse(saved)
      form.username = obj.username || ''
      form.password = obj.password || ''
      remember.value = true
    } catch {}
  }
})

async function doLogin () {
  if (!form.username || !form.password) { message.error('请填写账户和密码'); return }
  loading.value = true
  try {
    const user = await login(form.username, form.password)
    if (!user) {
      message.error('账户或密码错误')
    } else {
      // 登录成功后处理"记住我"：勾选则存 localStorage，否则清除
      if (remember.value) {
        localStorage.setItem('repay_remember', JSON.stringify({ username: form.username, password: form.password }))
      } else {
        localStorage.removeItem('repay_remember')
      }
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
.remember-row { display: flex; align-items: center; gap: 8px; margin-bottom: var(--sp-4); flex-wrap: wrap; }
.remember-hint { font-size: var(--fs-label); color: var(--ink-faint); }
.ant-checkbox-wrapper { font-size: var(--fs-meta); }

/* 登录页专属：空间几何感动态 SVG 背景 */
.geo-bg {
  position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
}
.geo-bg svg { width: 100%; height: 100%; display: block; }
/* 有机 blob 缓慢漂浮 + 透明度呼吸，柔和不规则 */
/* transform-box: fill-box 让 transform-origin 以 path 自身包围盒为参照 */
.blob { transform-box: fill-box; transform-origin: center; }
.blob-2 { animation: blobFloat2 22s ease-in-out infinite; }
.blob-3 { animation: blobFloat3 20s ease-in-out infinite; }
.blob-5 { animation: blobFloat5 24s ease-in-out infinite; }
@keyframes blobFloat2 {
  0% { transform: translate(0px,0px) scale(1); opacity: 0.6; }
  50% { transform: translate(-32px,38px) scale(0.93); opacity: 0.95; }
  100% { transform: translate(0px,0px) scale(1); opacity: 0.6; }
}
@keyframes blobFloat3 {
  0% { transform: translate(0px,0px) scale(1); opacity: 0.65; }
  50% { transform: translate(-38px,-22px) scale(1.12); opacity: 0.95; }
  100% { transform: translate(0px,0px) scale(1); opacity: 0.65; }
}
@keyframes blobFloat5 {
  0% { transform: translate(0px,0px) scale(1); opacity: 0.6; }
  50% { transform: translate(28px,-18px) scale(0.9); opacity: 0.95; }
  100% { transform: translate(0px,0px) scale(1); opacity: 0.6; }
}
/* 登录卡片置于背景之上 */
.login-card { position: relative; z-index: 2; }
/* 屏保彩带：横向无限流动，平移一个波浪周期(900px)即无缝循环，叠加垂直漂移 */
.geo-wire { transform-box: view-box; }
.geo-wire-1 { animation: ribbonFlow1 28s linear infinite; }
.geo-wire-2 { animation: ribbonFlow2 40s linear infinite; }
.geo-wire-3 { animation: ribbonFlow3 34s linear infinite; }
.geo-wire-4 { animation: ribbonFlow4 46s linear infinite; }
.geo-wire-5 { animation: ribbonFlow5 38s linear infinite; }
@keyframes ribbonFlow1 {
  0% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(450px) translateY(-30px); }
  100% { transform: translateX(900px) translateY(0); }
}
@keyframes ribbonFlow2 {
  0% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(-450px) translateY(35px); }
  100% { transform: translateX(-900px) translateY(0); }
}
@keyframes ribbonFlow3 {
  0% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(-450px) translateY(25px); }
  100% { transform: translateX(-900px) translateY(0); }
}
@keyframes ribbonFlow4 {
  0% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(450px) translateY(40px); }
  100% { transform: translateX(900px) translateY(0); }
}
@keyframes ribbonFlow5 {
  0% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(-450px) translateY(-25px); }
  100% { transform: translateX(-900px) translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .blob, .geo-wire { animation: none !important; }
}
</style>
