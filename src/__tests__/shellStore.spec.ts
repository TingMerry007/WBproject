import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShellStore } from '../stores/shellStore'
import * as shellApi from '../api/shellApi'

vi.mock('../api/shellApi', () => ({
  fetchShells: vi.fn(),
  createShell: vi.fn(),
  deleteShell: vi.fn(),
  toggleShellLike: vi.fn(),
  toggleShellFavorite: vi.fn()
}))

const mockedShellApi = vi.mocked(shellApi)

describe('useShellStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  it('initializes with empty shells', () => {
    const store = useShellStore()
    expect(store.shells).toEqual([])
    expect(store.count).toBe(0)
    expect(store.loading).toBe(false)
  })

  it('loads shells from API', async () => {
    const shells = [
      {
        id: '1',
        nickname: 'A',
        content: 'a',
        images: [],
        likes: 0,
        liked: false,
        favorites: 0,
        favorited: false,
        createdAt: '2026-06-25T10:00:00.000Z'
      }
    ]
    mockedShellApi.fetchShells.mockResolvedValue(shells)

    const store = useShellStore()
    await store.loadShells()

    expect(store.shells).toEqual(shells)
    expect(store.count).toBe(1)
    expect(store.loading).toBe(false)
  })

  it('handles API load error', async () => {
    mockedShellApi.fetchShells.mockRejectedValue(new Error('network error'))

    const store = useShellStore()
    await store.loadShells()

    expect(store.error).toBe('network error')
    expect(store.loading).toBe(false)
  })

  it('adds a shell via API', async () => {
    const newShell = {
      id: '2',
      nickname: '拾贝人',
      content: '今日份好心情',
      images: [],
      likes: 0,
      liked: false,
      favorites: 0,
      favorited: false,
      createdAt: '2026-06-25T10:00:00.000Z'
    }
    mockedShellApi.createShell.mockResolvedValue(newShell)

    const store = useShellStore()
    const result = await store.addShell({ nickname: '拾贝人', content: '今日份好心情', images: [] })

    expect(result).toEqual(newShell)
    expect(store.shells).toContainEqual(newShell)
    expect(mockedShellApi.createShell).toHaveBeenCalledWith({
      nickname: '拾贝人',
      content: '今日份好心情',
      images: []
    })
  })

  it('handles add shell API error', async () => {
    mockedShellApi.createShell.mockRejectedValue(new Error('invalid data'))

    const store = useShellStore()
    await expect(
      store.addShell({ nickname: '', content: '', images: [] })
    ).rejects.toThrow('invalid data')

    expect(store.error).toBe('invalid data')
  })

  it('removes a shell via API', async () => {
    mockedShellApi.deleteShell.mockResolvedValue(undefined)

    const store = useShellStore()
    store.shells = [
      {
        id: '1',
        nickname: 'A',
        content: 'a',
        images: [],
        likes: 0,
        liked: false,
        favorites: 0,
        favorited: false,
        createdAt: '2026-06-25T10:00:00.000Z'
      }
    ]

    await store.removeShell('1')

    expect(store.count).toBe(0)
    expect(mockedShellApi.deleteShell).toHaveBeenCalledWith('1')
  })

  it('toggles favorite via API', async () => {
    const updated = {
      id: '1',
      nickname: 'A',
      content: 'a',
      images: [],
      likes: 0,
      liked: false,
      favorites: 1,
      favorited: true,
      createdAt: '2026-06-25T10:00:00.000Z'
    }
    mockedShellApi.toggleShellFavorite.mockResolvedValue(updated)

    const store = useShellStore()
    store.shells = [
      {
        id: '1',
        nickname: 'A',
        content: 'a',
        images: [],
        likes: 0,
        liked: false,
        favorites: 0,
        favorited: false,
        createdAt: '2026-06-25T10:00:00.000Z'
      }
    ]

    await store.toggleFavorite('1')

    expect(store.shells[0].favorited).toBe(true)
    expect(store.shells[0].favorites).toBe(1)
  })

  it('filters favorite shells', () => {
    const store = useShellStore()
    store.shells = [
      {
        id: '1',
        nickname: 'A',
        content: 'a',
        images: [],
        likes: 0,
        liked: false,
        favorites: 1,
        favorited: true,
        createdAt: '2026-06-25T10:00:00.000Z'
      },
      {
        id: '2',
        nickname: 'B',
        content: 'b',
        images: [],
        likes: 0,
        liked: false,
        favorites: 0,
        favorited: false,
        createdAt: '2026-06-25T10:00:00.000Z'
      }
    ]

    expect(store.favoriteShells).toHaveLength(1)
    expect(store.favoriteShells[0].id).toBe('1')
  })
})
