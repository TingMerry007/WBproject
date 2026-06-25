const STORAGE_KEY = 'canghai_shells'

export function load<T>(key: string = STORAGE_KEY): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function save<T>(value: T, key: string = STORAGE_KEY): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function clear(key: string = STORAGE_KEY): void {
  localStorage.removeItem(key)
}

export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}
