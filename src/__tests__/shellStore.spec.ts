import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShellStore } from '../stores/shellStore'

function mockLocalStorage() {
  const store: Record<string, string> = {}
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value },
      removeItem: (key: string) => { delete store[key] }
    },
    writable: true,
    configurable: true
  })
}

describe('useShellStore', () => {
  beforeEach(() => {
    mockLocalStorage()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    globalThis.localStorage.removeItem('canghai_shells')
  })

  it('initializes with empty shells', () => {
    const store = useShellStore()
    expect(store.shells).toEqual([])
    expect(store.count).toBe(0)
  })

  it('adds a shell and persists to localStorage', () => {
    const store = useShellStore()
    const shell = store.addShell({
      nickname: '拾贝人',
      content: '今日份好心情',
      images: []
    })

    expect(shell.nickname).toBe('拾贝人')
    expect(shell.content).toBe('今日份好心情')
    expect(store.count).toBe(1)
    expect(store.shells[0].id).toBe(shell.id)

    const stored = JSON.parse(globalThis.localStorage.getItem('canghai_shells') as string)
    expect(stored).toHaveLength(1)
    expect(stored[0].nickname).toBe('拾贝人')
  })

  it('throws when nickname is empty', () => {
    const store = useShellStore()
    expect(() => store.addShell({ nickname: '  ', content: 'hello', images: [] })).toThrow('请输入昵称')
  })

  it('throws when content is empty', () => {
    const store = useShellStore()
    expect(() => store.addShell({ nickname: '拾贝人', content: '  ', images: [] })).toThrow('写下想说的话吧')
  })

  it('throws when content exceeds 1000 characters', () => {
    const store = useShellStore()
    const longContent = 'a'.repeat(1001)
    expect(() => store.addShell({ nickname: '拾贝人', content: longContent, images: [] })).toThrow('内容不能超过 1000 字')
  })

  it('throws when images exceed 9', () => {
    const store = useShellStore()
    expect(() =>
      store.addShell({ nickname: '拾贝人', content: 'hello', images: new Array(10).fill('img') })
    ).toThrow('图片不能超过 9 张')
  })

  it('removes a shell and updates localStorage', () => {
    const store = useShellStore()
    const shell = store.addShell({ nickname: 'A', content: 'a', images: [] })
    store.removeShell(shell.id)
    expect(store.count).toBe(0)
    expect(JSON.parse(globalThis.localStorage.getItem('canghai_shells') as string)).toEqual([])
  })

  it('toggles like on a shell', () => {
    const store = useShellStore()
    const shell = store.addShell({ nickname: 'A', content: 'a', images: [] })

    store.toggleLike(shell.id)
    expect(store.shells[0].liked).toBe(true)
    expect(store.shells[0].likes).toBe(1)

    store.toggleLike(shell.id)
    expect(store.shells[0].liked).toBe(false)
    expect(store.shells[0].likes).toBe(0)
  })

  it('loads shells from localStorage', () => {
    globalThis.localStorage.setItem(
      'canghai_shells',
      JSON.stringify([
        {
          id: 'abc',
          nickname: '历史用户',
          content: '历史内容',
          images: [],
          likes: 5,
          liked: true,
          createdAt: '2026-06-20T10:00:00.000Z'
        }
      ])
    )

    const store = useShellStore()
    store.loadFromStorage()
    expect(store.count).toBe(1)
    expect(store.shells[0].nickname).toBe('历史用户')
  })
})
