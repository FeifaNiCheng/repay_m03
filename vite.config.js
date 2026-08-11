import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'Repay M03 - 还款记录',
        short_name: 'Repay M03',
        description: '小鹏 MONA M03 Max 还款记录管理系统',
        theme_color: '#0A84FF',
        background_color: '#E8EEF7',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  server: {

    port: 5173,
    host: true,
    proxy: {
      '/d1': {
        target: 'https://api.cloudflare.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/d1/, '/client/v4')
      }
    }
  }
})
