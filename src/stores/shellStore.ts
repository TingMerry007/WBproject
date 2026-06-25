import { defineStore } from 'pinia'
import { shallowRef, computed } from 'vue'
import type { Shell } from '@/types/shell'
import * as shellApi from '@/api/shellApi'

export interface AddShellPayload {
  nickname: string
  content: string
  images: string[]
}

export const useShellStore = defineStore('shell', () => {
  const shells = shallowRef<Shell[]>([])
  const loading = shallowRef(false)
  const error = shallowRef('')

  const count = computed(() => shells.value.length)

  async function loadShells() {
    loading.value = true
    error.value = ''
    try {
      shells.value = await shellApi.fetchShells()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载失败'
    } finally {
      loading.value = false
    }
  }

  async function addShell(payload: AddShellPayload): Promise<Shell | null> {
    error.value = ''
    try {
      const shell = await shellApi.createShell(payload)
      shells.value = [shell, ...shells.value]
      return shell
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发布失败'
      throw err
    }
  }

  async function removeShell(id: string) {
    error.value = ''
    try {
      await shellApi.deleteShell(id)
      shells.value = shells.value.filter((s) => s.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除失败'
      throw err
    }
  }

  async function toggleLike(id: string) {
    error.value = ''
    try {
      const updated = await shellApi.toggleShellLike(id)
      shells.value = shells.value.map((s) => (s.id === id ? updated : s))
    } catch (err) {
      error.value = err instanceof Error ? err.message : '点赞失败'
      throw err
    }
  }

  return {
    shells,
    count,
    loading,
    error,
    loadShells,
    addShell,
    removeShell,
    toggleLike
  }
})
