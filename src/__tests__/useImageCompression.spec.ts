import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { compressImage } from '../composables/useImageCompression'

describe('compressImage', () => {
  beforeEach(() => {
    globalThis.FileReader = class MockFileReader {
      result: string | ArrayBuffer | null = null
      onload: ((e: ProgressEvent<FileReader>) => void) | null = null
      onerror: (() => void) | null = null
      readAsDataURL() {
        this.result = 'data:image/png;base64,test'
        queueMicrotask(() => {
          this.onload?.({ target: this } as unknown as ProgressEvent<FileReader>)
        })
      }
    } as unknown as typeof FileReader

    const mockContext = {
      drawImage: vi.fn()
    }

    const mockCanvas = {
      getContext: vi.fn(() => mockContext as unknown as CanvasRenderingContext2D),
      toDataURL: vi.fn(() => 'data:image/jpeg;base64,compressed')
    }

    globalThis.document = {
      createElement: vi.fn((tagName: string) => {
        if (tagName === 'canvas') return mockCanvas as unknown as HTMLCanvasElement
        throw new Error(`Unexpected element: ${tagName}`)
      })
    } as unknown as Document

    globalThis.Image = class MockImage {
      width = 2000
      height = 1000
      src = ''
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      constructor() {
        queueMicrotask(() => {
          if (this.onload) this.onload()
        })
      }
    } as unknown as typeof Image
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should reject non-image files', async () => {
    const file = new File(['text'], 'test.txt', { type: 'text/plain' })
    await expect(compressImage(file)).rejects.toThrow('Invalid file type')
  })

  it('should compress image and return data URL', async () => {
    const file = new File(['image'], 'test.png', { type: 'image/png' })
    const result = await compressImage(file)
    expect(result).toBe('data:image/jpeg;base64,compressed')
  })
})
