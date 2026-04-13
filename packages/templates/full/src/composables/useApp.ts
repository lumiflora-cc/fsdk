import { computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'

export function useApp() {
  const appStore = useAppStore()

  const title = computed(() => appStore.title)
  const collapsed = computed(() => appStore.collapsed)

  function setCollapsed(value: boolean) {
    appStore.setCollapsed(value)
  }

  function setTitle(value: string) {
    appStore.setTitle(value)
  }

  return {
    title,
    collapsed,
    setCollapsed,
    setTitle
  }
}
