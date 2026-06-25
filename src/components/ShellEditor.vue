<script setup lang="ts">
import { shallowRef, computed } from 'vue'
import { useShellStore } from '@/stores/shellStore'
import ImageUploader from './ImageUploader.vue'

const emit = defineEmits<{
  submitted: []
}>()

const store = useShellStore()

const nickname = shallowRef('')
const content = shallowRef('')
const images = shallowRef<string[]>([])
const error = shallowRef('')

const contentLength = computed(() => content.value.length)
const isOverLimit = computed(() => contentLength.value > 1000)
const isNearLimit = computed(() => contentLength.value >= 900 && contentLength.value <= 1000)
const charCountClass = computed(() => {
  if (isOverLimit.value) return 'error'
  if (isNearLimit.value) return 'warning'
  return ''
})

function updateImages(value: string[]) {
  images.value = value
}

function submit() {
  error.value = ''
  try {
    store.addShell({
      nickname: nickname.value,
      content: content.value,
      images: images.value
    })
    nickname.value = ''
    content.value = ''
    images.value = []
    emit('submitted')
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  }
}
</script>

<template>
  <div class="editor">
    <div class="input-group">
      <label for="nickname">昵称</label>
      <input
        id="nickname"
        type="text"
        v-model="nickname"
        placeholder="给自己起个名字吧"
        maxlength="20"
      />
    </div>

    <div class="input-group">
      <label for="content">想说的话</label>
      <textarea
        id="content"
        v-model="content"
        placeholder="写下此刻的心情..."
        maxlength="1000"
        rows="4"
      ></textarea>
      <div class="char-count" :class="charCountClass">{{ contentLength }} / 1000</div>
    </div>

    <ImageUploader @change="updateImages" />

    <div v-if="error" class="error-message">{{ error }}</div>

    <button type="button" class="submit-btn" @click="submit">🌊 拾取贝壳</button>
  </div>
</template>

<style scoped>
.editor {
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(14, 165, 233, 0.15);
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.75);
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-size: 0.9rem;
  color: #475569;
  margin-bottom: 6px;
  font-weight: 500;
}

.input-group input,
.input-group textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: rgba(255, 255, 255, 0.9);
  font-family: inherit;
}

.input-group input:focus,
.input-group textarea:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
}

.input-group textarea {
  resize: vertical;
  min-height: 100px;
}

.char-count {
  text-align: right;
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 4px;
}

.char-count.warning {
  color: #f59e0b;
}

.char-count.error {
  color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(90deg, #0ea5e9, #10b981);
  color: white;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(14, 165, 233, 0.3);
}

@media (max-width: 480px) {
  .editor {
    padding: 18px;
  }
}
</style>
