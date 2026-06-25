import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { load, save, clear, isStorageAvailable } from '../utils/storage'

function createMockStorage() {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] }
  }
}

describe('storage utils', () => {
  let mockStorage: ReturnType<typeof createMockStorage>

  beforeEach(() => {
    mockStorage = createMockStorage()
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true
    })
    clear('test_key')
  })

  afterEach(() => {
    clear('test_key')
  })

  it('should save and load an object', () => {
    save({ foo: 'bar' }, 'test_key')
    expect(load('test_key')).toEqual({ foo: 'bar' })
  })

  it('should return null for missing key', () => {
    expect(load('non_existent_key')).toBeNull()
  })

  it('should return null for invalid JSON', () => {
    localStorage.setItem('test_key', 'not-json')
    expect(load('test_key')).toBeNull()
  })

  it('should clear stored value', () => {
    save({ foo: 'bar' }, 'test_key')
    clear('test_key')
    expect(load('test_key')).toBeNull()
  })

  it('should detect storage availability', () => {
    expect(isStorageAvailable()).toBe(true)
  })
})
