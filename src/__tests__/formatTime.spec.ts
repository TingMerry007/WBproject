import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatRelativeTime, formatExactTime } from '../utils/formatTime'

describe('formatTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 刚刚 for time less than 60 seconds ago', () => {
    const now = new Date('2026-06-25T12:00:00')
    vi.setSystemTime(now)
    const dateString = new Date(now.getTime() - 30_000).toISOString()
    expect(formatRelativeTime(dateString)).toBe('刚刚')
  })

  it('returns minutes ago', () => {
    const now = new Date('2026-06-25T12:00:00')
    vi.setSystemTime(now)
    const dateString = new Date(now.getTime() - 5 * 60_000).toISOString()
    expect(formatRelativeTime(dateString)).toBe('5分钟前')
  })

  it('returns hours ago', () => {
    const now = new Date('2026-06-25T12:00:00')
    vi.setSystemTime(now)
    const dateString = new Date(now.getTime() - 3 * 3600_000).toISOString()
    expect(formatRelativeTime(dateString)).toBe('3小时前')
  })

  it('returns days ago', () => {
    const now = new Date('2026-06-25T12:00:00')
    vi.setSystemTime(now)
    const dateString = new Date(now.getTime() - 2 * 86400_000).toISOString()
    expect(formatRelativeTime(dateString)).toBe('2天前')
  })

  it('formats exact time', () => {
    const dateString = '2026-06-25T14:30:00'
    expect(formatExactTime(dateString)).toContain('2026')
    expect(formatExactTime(dateString)).toContain('14:30')
  })
})
