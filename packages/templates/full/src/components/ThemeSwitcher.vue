<script setup lang="ts">
/**
 * 主题切换组件
 */
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <el-button text @click="toggleTheme">
    <span v-if="theme === 'light'">🌙</span>
    <span v-else>☀️</span>
  </el-button>
</template>
