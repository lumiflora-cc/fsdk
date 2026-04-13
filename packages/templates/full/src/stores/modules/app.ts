import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const title = ref(import.meta.env.VITE_APP_TITLE || 'Lumiflora')
  const collapsed = ref(false)

  function setCollapsed(value: boolean) {
    collapsed.value = value
  }

  function setTitle(value: string) {
    title.value = value
  }

  return {
    title,
    collapsed,
    setCollapsed,
    setTitle
  }
})
