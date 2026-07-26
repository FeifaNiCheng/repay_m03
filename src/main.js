import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import router from './router/index.js'
import './styles/global.css'
import { seedIfNeeded } from './db/dao.js'

// 启动前初始化数据库种子数据
seedIfNeeded().then(() => {
  const app = createApp(App)
  app.use(Antd)
  app.use(router)
  app.mount('#app')
})
