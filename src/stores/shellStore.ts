import { defineStore } from 'pinia'
import { shallowRef, computed } from 'vue'
import type { Shell } from '@/types/shell'
import { load, save, isStorageAvailable } from '@/utils/storage'

const STORAGE_KEY = 'canghai_shells'
const MAX_CONTENT_LENGTH = 1000
const MAX_IMAGES = 9

export interface AddShellPayload {
  nickname: string
  content: string
  images: string[]
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const useShellStore = defineStore('shell', () => {
  const shells = shallowRef<Shell[]>(load<Shell[]>(STORAGE_KEY) ?? [])

  const sortedShells = computed(() =>
    [...shells.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  )

  const count = computed(() => shells.value.length)

  function persist() {
    if (isStorageAvailable()) {
      save(shells.value, STORAGE_KEY)
    }
  }

  function addShell(payload: AddShellPayload): Shell {
    const nickname = payload.nickname.trim()
    const content = payload.content.trim()

    if (!nickname) {
      throw new Error('请输入昵称')
    }

    if (!content) {
      throw new Error('写下想说的话吧')
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      throw new Error(`内容不能超过 ${MAX_CONTENT_LENGTH} 字`)
    }

    if (payload.images.length > MAX_IMAGES) {
      throw new Error(`图片不能超过 ${MAX_IMAGES} 张`)
    }

    const shell: Shell = {
      id: generateId(),
      nickname,
      content,
      images: payload.images,
      likes: 0,
      liked: false,
      createdAt: new Date().toISOString()
    }

    shells.value = [shell, ...shells.value]
    persist()
    return shell
  }

  function removeShell(id: string) {
    shells.value = shells.value.filter((s) => s.id !== id)
    persist()
  }

  function toggleLike(id: string) {
    shells.value = shells.value.map((s) => {
      if (s.id !== id) return s
      const liked = !s.liked
      return {
        ...s,
        liked,
        likes: Math.max(0, s.likes + (liked ? 1 : -1))
      }
    })
    persist()
  }

  function loadFromStorage() {
    const data = load<Shell[]>(STORAGE_KEY)
    if (data) {
      shells.value = data
    }
  }

  return {
    shells: sortedShells,
    count,
    addShell,
    removeShell,
    toggleLike,
    loadFromStorage
  }
})
