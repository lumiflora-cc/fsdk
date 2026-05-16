<script setup lang="ts">
/**
 * 语言切换组件
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { supportedLocales } from '@/locales'
import { setLocale } from '@/i18n'

const { locale } = useI18n()
const dropdownVisible = ref(false)

function handleCommand(lang: string) {
  setLocale(lang)
  dropdownVisible.value = false
}
</script>

<template>
  <el-dropdown @command="handleCommand" trigger="click">
    <el-button text>
      {{ supportedLocales.find(l => l.value === locale)?.label }}
      <el-icon class="el-icon--right"><svg /></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in supportedLocales"
          :key="item.value"
          :command="item.value"
          :disabled="locale === item.value"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
