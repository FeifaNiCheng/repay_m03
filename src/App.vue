<template>
  <a-config-provider :locale="zhCN">
    <div class="bg-orb-3"></div>
    <router-view />
  </a-config-provider>
</template>

<script setup>
import { onMounted } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
</script>

<style scoped>
/* 背景光斑由全局 CSS 定位，此处仅占位 */
</style>
