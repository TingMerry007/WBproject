<script setup lang="ts">
import { shallowRef } from 'vue'
import type { Shell } from '@/types/shell'
import { formatRelativeTime, formatExactTime } from '@/utils/formatTime'
import CommentEditor from './CommentEditor.vue'

const props = defineProps<{
  shell: Shell
}>()

const emit = defineEmits<{
  like: [id: string]
  favorite: [id: string]
  delete: [id: string]
  preview: [src: string]
  comment: [id: string, payload: { nickname: string; content: string }]
}>()

const showExact = shallowRef(false)
const showComments = shallowRef(false)

const imageClass = () => {
  if (props.shell.images.length === 1) return 'single'
  if (props.shell.images.length === 2) return 'two'
  return ''
}

function toggleTime() {
  showExact.value = !showExact.value
}

function like() {
  emit('like', props.shell.id)
}

function favorite() {
  emit('favorite', props.shell.id)
}

function remove() {
  if (confirm('确定要收起这枚贝壳吗？')) {
    emit('delete', props.shell.id)
  }
}

function previewImage(src: string) {
  emit('preview', src)
}

function toggleComments() {
  showComments.value = !showComments.value
}

function submitComment(payload: { nickname: string; content: string }) {
  emit('comment', props.shell.id, payload)
}

function displayTime() {
  return showExact.value ? formatExactTime(props.shell.createdAt) : formatRelativeTime(props.shell.createdAt)
}
</script>

<template>
  <div class="shell-card" :data-id="shell.id">
    <div class="shell-header">
      <div>
        <div class="shell-author">{{ shell.nickname || '匿名拾贝人' }}</div>
        <div class="shell-time" @click="toggleTime" title="点击切换时间格式">{{ displayTime() }}</div>
      </div>
      <div class="shell-actions">
        <button
          type="button"
          class="icon-btn like"
          :class="{ active: shell.liked }"
          @click="like"
        >
          <span>{{ shell.liked ? '❤️' : '🤍' }}</span>
          <span>{{ shell.likes }}</span>
        </button>
        <button
          type="button"
          class="icon-btn favorite"
          :class="{ active: shell.favorited }"
          @click="favorite"
        >
          <span>{{ shell.favorited ? '⭐' : '☆' }}</span>
          <span>{{ shell.favorites }}</span>
        </button>
        <button
          type="button"
          class="icon-btn comment"
          :class="{ active: showComments }"
          @click="toggleComments"
        >
          <span>💬</span>
          <span>{{ shell.comments.length }}</span>
        </button>
        <button type="button" class="icon-btn delete" @click="remove" title="删除">
          🗑️
        </button>
      </div>
    </div>

    <div class="shell-content">{{ shell.content }}</div>

    <div v-if="shell.images.length > 0" class="shell-images" :class="imageClass()">
      <div
        v-for="(src, index) in shell.images"
        :key="index"
        class="shell-image"
        @click="previewImage(src)"
      >
        <img :src="src" alt="贝壳图片" />
      </div>
    </div>

        <div v-if="showComments" class="comments-section">
      <div v-if="shell.comments.length === 0" class="comments-empty">
        还没有评论，来说两句吧~
      </div>
      <div v-else class="comments-list">
        <div
          v-for="comment in shell.comments"
          :key="comment.id"
          class="comment-item"
        >
          <div class="comment-header">
            <span class="comment-author">{{ comment.nickname || '匿名拾贝人' }}</span>
            <span class="comment-time">{{ formatRelativeTime(comment.createdAt) }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
        </div>
      </div>

      <slot name="comment-editor" />
      <CommentEditor v-if="showComments" @submit="submitComment" />
    </div>
  </div>
</template>

<style scoped>
.shell-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 18px;
  box-shadow: 0 4px 20px rgba(14, 165, 233, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.75);
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.shell-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.shell-author {
  font-weight: 600;
  color: #0f172a;
  font-size: 1rem;
}

.shell-time {
  font-size: 0.8rem;
  color: #64748b;
  cursor: pointer;
  margin-top: 2px;
  user-select: none;
}

.shell-time:hover {
  color: #0ea5e9;
}

.shell-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
}

.icon-btn:hover {
  background: rgba(148, 163, 184, 0.12);
}

.icon-btn.delete:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

.icon-btn.like.active {
  color: #ec4899;
}

.icon-btn.like.active:hover {
  background: rgba(236, 72, 153, 0.08);
}

.icon-btn.favorite.active {
  color: #f59e0b;
}

.icon-btn.favorite.active:hover {
  background: rgba(245, 158, 11, 0.08);
}

.icon-btn.comment.active {
  color: #0ea5e9;
}

.icon-btn.comment.active:hover {
  background: rgba(14, 165, 233, 0.08);
}

.shell-content {
  color: #334155;
  line-height: 1.7;
  margin-bottom: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.comments-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(203, 213, 225, 0.5);
}

.comments-empty {
  font-size: 0.85rem;
  color: #94a3b8;
  padding: 8px 0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-item {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  padding: 10px 12px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.comment-author {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
}

.comment-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.comment-content {
  font-size: 0.9rem;
  color: #334155;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.shell-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.shell-images.single {
  grid-template-columns: 1fr;
  max-width: 280px;
}

.shell-images.two {
  grid-template-columns: repeat(2, 1fr);
}

.shell-image {
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.shell-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.shell-image:hover img {
  transform: scale(1.05);
}

@media (max-width: 480px) {
  .shell-images {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }

  .shell-images.single {
    max-width: 100%;
  }
}
</style>
