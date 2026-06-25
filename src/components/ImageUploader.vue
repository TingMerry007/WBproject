<script setup lang="ts">
import { shallowRef } from 'vue'
import { compressImage } from '@/composables/useImageCompression'

const MAX_IMAGES = 9

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [images: string[]]
}>()

const images = shallowRef<string[]>([])
const isProcessing = shallowRef(false)

async function handleFiles(files: FileList | null) {
  if (!files || props.disabled) return
  const remaining = MAX_IMAGES - images.value.length
  if (remaining <= 0) {
    alert('最多只能上传 9 张图片')
    return
  }

  const validFiles = Array.from(files)
    .filter((f) => f.type.startsWith('image/'))
    .slice(0, remaining)

  if (validFiles.length === 0) return

  isProcessing.value = true
  try {
    const compressed = await Promise.all(validFiles.map((f) => compressImage(f)))
    images.value = [...images.value, ...compressed]
    emit('change', images.value)
  } catch (err) {
    alert('图片处理失败：' + (err instanceof Error ? err.message : String(err)))
  } finally {
    isProcessing.value = false
  }
}

function handleFileInput(event: Event) {
  const input = event.target as HTMLInputElement
  handleFiles(input.files)
  input.value = ''
}

function removeImage(index: number) {
  images.value = images.value.filter((_, i) => i !== index)
  emit('change', images.value)
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  handleFiles(event.dataTransfer?.files ?? null)
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
}

function openFilePicker() {
  document.getElementById('image-input')?.click()
}

function isFull() {
  return images.value.length >= MAX_IMAGES
}
</script>

<template>
  <div class="uploader">
    <input
      id="image-input"
      type="file"
      accept="image/*"
      multiple
      class="file-input"
      @change="handleFileInput"
      :disabled="disabled || isProcessing"
    />

    <div
      v-if="!isFull()"
      class="upload-area"
      @click="openFilePicker"
      @drop="handleDrop"
      @dragover="handleDragOver"
      :class="{ disabled: disabled || isProcessing }"
    >
      <div class="upload-icon">📷</div>
      <div class="upload-text">{{ isProcessing ? '图片处理中...' : '点击或拖拽上传图片' }}</div>
      <div class="upload-hint">还可上传 {{ MAX_IMAGES - images.length }} 张，建议单张不超过 1MB</div>
    </div>

    <div v-else class="upload-full">
      已达到上传上限（{{ MAX_IMAGES }} 张）
    </div>

    <div v-if="images.length > 0" class="preview-grid">
      <div v-for="(src, index) in images" :key="index" class="preview-item">
        <img :src="src" alt="预览" />
        <button type="button" class="preview-remove" @click.stop="removeImage(index)">×</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.uploader {
  margin-bottom: 16px;
}

.file-input {
  display: none;
}

.upload-area {
  border: 2px dashed #94a3b8;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.6);
}

.upload-area:hover:not(.disabled) {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.05);
}

.upload-area.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.upload-text {
  color: #64748b;
  font-size: 0.9rem;
}

.upload-hint {
  color: #94a3b8;
  font-size: 0.75rem;
  margin-top: 4px;
}

.upload-full {
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 12px;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.preview-remove:hover {
  background: rgba(239, 68, 68, 0.9);
}

@media (max-width: 480px) {
  .preview-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
}
</style>
