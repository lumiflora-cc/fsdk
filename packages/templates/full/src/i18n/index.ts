/**
 * 国际化配置
 */
import { createI18n } from 'vue-i18n'
import { messages } from '@/locales'

// 默认语言
const defaultLocale = import.meta.env.VITE_APP_LOCALE || 'zh-CN'

// 获取浏览器语言
function getBrowserLocale(): string {
  const browserLang = navigator.language
  if (browserLang.startsWith('zh')) return 'zh-CN'
  if (browserLang.startsWith('en')) return 'en-US'
  return defaultLocale
}

export const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  messages,
  // 允许在组件中使用 $t 函数
  availableLocales: Object.keys(messages)
})

// 切换语言
export function setLocale(locale: string): void {
  if (messages[locale]) {
    i18n.global.locale.value = locale
    localStorage.setItem('locale', locale)
    document.documentElement.setAttribute('lang', locale)
  }
}

// 获取当前语言
export function getLocale(): string {
  return i18n.global.locale.value
}

// 初始化语言（从本地存储或浏览器语言恢复）
export function initLocale(): void {
  const storedLocale = localStorage.getItem('locale')
  if (storedLocale && messages[storedLocale]) {
    i18n.global.locale.value = storedLocale
  } else {
    i18n.global.locale.value = getBrowserLocale()
  }
  document.documentElement.setAttribute('lang', i18n.global.locale.value)
}

export default i18n
