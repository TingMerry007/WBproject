<script setup lang="ts">
import { shallowRef, computed } from 'vue'

const MAX_CONTENT_LENGTH = 500

const emit = defineEmits<{
  submit: [payload: { nickname: string; content: string }]
}>()

const nickname = shallowRef('')
const content = shallowRef('')
const isSubmitting = shallowRef(false)

const contentLength = computed(() => content.value.length)
const isOverLimit = computed(() => contentLength.value > MAX_CONTENT_LENGTH)

function validate(): string | null {
  if (!nickname.value.trim()) return '请输入昵称'
  if (!content.value.trim()) return '写下想说的话吧'
  if (content.value.length > MAX_CONTENT_LENGTH) return `评论不能超过 ${MAX_CONTENT_LENGTH} 字`
  return null
}

async function submit() {
  const validationError = validate()
  if (validationError) {
    return
  }

  isSubmitting.value = true
  try {
    await emit('submit', {
      nickname: nickname.value,
      content: content.value
    })
    content.value = ''
  } finally {
    isSubmitting.value = false
  }
}

function reset() {
  nickname.value = ''
  content.value = ''
}

defineExpose({ reset })
</script>

<template>
  <div class="comment-editor">
    <input
      v-model="nickname"
      type="text"
      placeholder="昵称"
      maxlength="20"
      class="comment-nickname"
    />
    <textarea
      v-model="content"
      placeholder="写下你的评论..."
      maxlength="500"
      rows="2"
      class="comment-textarea"
    ></textarea>
    
    <div class="comment-footer">
      <span class="char-count" :class="{ error: isOverLimit }">{{ contentLength }} / {{ MAX_CONTENT_LENGTH }}</span>
      <button type="button" class="submit-btn" :disabled="isSubmitting" @click="submit">
        {{ isSubmitting ? '发送中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.comment-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
}

.comment-nickname,
.comment-textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 0.9rem;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.9);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.comment-nickname:focus,
.comment-textarea:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
}

.comment-textarea {
  resize: vertical;
  min-height: 60px;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 0.75rem;
  color: #94a3b8;
}

.char-count.error {
  color: #ef4444;
}

.submit-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(90deg, #0ea5e9, #10b981);
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
