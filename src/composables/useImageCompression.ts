export interface CompressionOptions {
  maxWidth?: number
  quality?: number
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const { maxWidth = 1280, quality = 0.8 } = options

  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type')
  }

  const dataUrl = await readFileAsDataURL(file)
  const img = await loadImage(dataUrl)

  let width = img.width
  let height = img.height
  if (width > maxWidth) {
    height = Math.round(height * (maxWidth / width))
    width = maxWidth
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas context not available')
  }
  ctx.drawImage(img, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', quality)
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}
