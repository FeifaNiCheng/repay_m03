import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../stores/auth.js'

const routes = [
  { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '概览' } },
  { path: '/payments', name: 'payments', component: () => import('../views/Payments.vue'), meta: { title: '明细' } },
  { path: '/settings', name: 'settings', component: () => import('../views/Settings.vue'), meta: { title: '设置' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 登录守卫
router.beforeEach((to, from, next) => {
  const { state } = useAuth()
  if (to.name !== 'login' && !state.username) {
    next({ name: 'login' })
  } else if (to.name === 'login' && state.username) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
