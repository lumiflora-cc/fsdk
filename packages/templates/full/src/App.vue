<script setup lang="ts">
/**
 * App 根组件
 * 使用 Element Plus ConfigProvider 提供全局配置（国际化、主题等）
 */
import { computed, onMounted } from 'vue'
import { ElConfigProvider } from 'element-plus'
import { useI18n } from 'vue-i18n'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { useTheme } from '@/composables/useTheme'

const { locale } = useI18n()
const { initTheme } = useTheme()

// Element Plus 语言映射
const elementLocaleMap: Record<string, any> = {
  'zh-CN': zhCn,
  'en-US': en
}

const elementLocale = computed(() => {
  return elementLocaleMap[locale.value] || en
})

// 初始化主题
onMounted(() => {
  initTheme()
})
</script>

<template>
  <el-config-provider :locale="elementLocale">
    <router-view />
  </el-config-provider>
</template>

<style>
#app {
  width: 100%;
  height: 100%;
}
</style>
