<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { useShellStore } from '@/stores/shellStore'
import ShellEditor from './components/ShellEditor.vue'
import ShellList from './components/ShellList.vue'

const store = useShellStore()

const lightboxSrc = shallowRef('')
const isLightboxOpen = shallowRef(false)

onMounted(() => {
  store.loadShells()
})

function openLightbox(src: string) {
  lightboxSrc.value = src
  isLightboxOpen.value = true
}

function closeLightbox() {
  isLightboxOpen.value = false
}
</script>

<template>
  <div class="app">
    <div class="container">
      <header class="header">
        <h1>🐚 沧海拾贝</h1>
        <p>拾起生活里的每一枚闪光贝壳</p>
      </header>

      <ShellEditor />

      <ShellList @preview="openLightbox" />
    </div>

    <div v-if="isLightboxOpen" class="lightbox" @click="closeLightbox">
      <img :src="lightboxSrc" alt="预览" />
    </div>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #374151;
}

.app {
  min-height: 100vh;
  background: url('./assets/bg-beach.jpg') no-repeat center center fixed;
  background-size: cover;
  position: relative;
  padding: 20px;
}

.app::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(224, 247, 250, 0.55) 0%,
    rgba(232, 245, 233, 0.5) 50%,
    rgba(179, 229, 252, 0.55) 100%
  );
  pointer-events: none;
  z-index: 0;
}

.container {
  position: relative;
  z-index: 1;
  max-width: 640px;
  margin: 0 auto;
}

.header {
  text-align: center;
  padding: 40px 0 30px;
}

.header h1 {
  font-size: 2.2rem;
  background: linear-gradient(90deg, #0ea5e9, #10b981);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.header p {
  color: #475569;
  font-size: 0.95rem;
}

.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.lightbox img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
  object-fit: contain;
}

@media (max-width: 480px) {
  .app {
    padding: 12px;
  }

  .header h1 {
    font-size: 1.8rem;
  }
}
</style>
