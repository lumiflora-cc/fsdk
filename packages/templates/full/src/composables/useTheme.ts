/**
 * 主题切换 Composable
 */
import { useThemeStore } from '@/stores/modules/theme'

export function useTheme() {
  const themeStore = useThemeStore()

  return {
    theme: themeStore.theme,
    toggleTheme: themeStore.toggleTheme,
    setTheme: themeStore.setTheme,
    initTheme: themeStore.initTheme
  }
}
