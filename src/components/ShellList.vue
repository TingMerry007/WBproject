<script setup lang="ts">
import { useShellStore } from '@/stores/shellStore'
import ShellCard from './ShellCard.vue'

const store = useShellStore()

const emit = defineEmits<{
  preview: [src: string]
}>()

async function handleLike(id: string) {
  await store.toggleLike(id)
}

async function handleDelete(id: string) {
  await store.removeShell(id)
}

function handlePreview(src: string) {
  emit('preview', src)
}
</script>

<template>
  <div class="list">
    <div v-if="store.loading" class="loading-state">
      <div class="loading-text">正在拾取海滩足迹...</div>
    </div>

    <div v-else-if="store.shells.length === 0" class="empty-state">
      <div class="empty-icon">🏖️</div>
      <div class="empty-text">海滩还空空如也</div>
      <div class="empty-hint">快来拾取第一枚贝壳吧~</div>
    </div>

    <div v-else class="feed">
      <div class="feed-header">
        <h2>海滩足迹</h2>
        <span class="feed-count">{{ store.count }} 枚贝壳</span>
      </div>

      <ShellCard
        v-for="shell in store.shells"
        :key="shell.id"
        :shell="shell"
        @like="handleLike"
        @delete="handleDelete"
        @preview="handlePreview"
      />
    </div>
  </div>
</template>

<style scoped>
.list {
  margin-bottom: 40px;
}

.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 8px;
}

.feed-header h2 {
  font-size: 1.2rem;
  color: #334155;
}

.feed-count {
  font-size: 0.85rem;
  color: #475569;
  background: rgba(255, 255, 255, 0.75);
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-text {
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 0.9rem;
  color: #94a3b8;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.loading-text {
  font-size: 1.1rem;
}

.feed {
  margin-top: 20px;
}
</style>
