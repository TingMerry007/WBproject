# AGENTS.md

## 项目概览

- **名称**: 沧海拾贝
- **技术栈**: Vue 3 + TypeScript + Vite + Pinia
- **数据持久化**: LocalStorage（key: `canghai_shells`）
- **测试**: Vitest（Node 环境，不使用 jsdom/happy-dom）
- **遗留文件**: `index.legacy.html` 是原始单文件 HTML 版本，不参与构建

## 常用命令

```bash
npm run dev          # 启动开发服务器（默认 localhost:5173）
npm run build        # TypeScript 检查 + Vite 生产构建
npm run preview      # 预览生产构建产物
npm run test         # 监听模式运行 Vitest
npm run test:run     # 单次运行所有测试
npm run typecheck    # 仅运行 vue-tsc 类型检查
```

## 验证顺序

提交前建议按顺序执行：

```bash
npm run typecheck
npm run test:run
npm run build
```

## 项目结构

```
src/
  components/        # Vue 组件（SFC，使用 <script setup lang="ts">）
    ImageUploader.vue
    ShellEditor.vue
    ShellCard.vue
    ShellList.vue
  composables/       # 可复用逻辑
    useImageCompression.ts   # 图片压缩为 JPEG（依赖浏览器 Canvas）
  stores/
    shellStore.ts    # Pinia store：增删赞、LocalStorage 同步
  types/
    shell.ts         # Shell 数据接口
  utils/
    storage.ts       # localStorage 封装
    formatTime.ts    # 相对/具体时间格式化
  __tests__/         # 单元测试（与源码并列）
  App.vue            # 页面根组件
  main.ts            # 应用入口：createApp + createPinia
```

## 路径别名

- `@/` 映射到 `src/`，在 `vite.config.ts`、`vitest.config.ts`、`tsconfig.app.json` 中统一配置。

## 测试注意事项

- Vitest 运行在 **Node 环境**，没有 `localStorage`、`HTMLCanvasElement`、`document`、`Image`、`FileReader` 等浏览器 API。
- 测试这些浏览器相关代码时，需要在测试文件里手动 mock 上述全局对象。
- 已存在的测试示例：
  - `src/__tests__/storage.spec.ts`：mock localStorage
  - `src/__tests__/useImageCompression.spec.ts`：mock FileReader、Image、document.createElement
  - `src/__tests__/shellStore.spec.ts`：mock localStorage + `setActivePinia(createPinia())`

## 代码风格

- 使用 Vue 3 Composition API + `<script setup lang="ts">`
- 组件文件名使用 PascalCase
- Store 使用 Setup Store 风格（函数式）
- 优先使用 `shallowRef` 存储原始值和大型数组
- 工具函数放在 `utils/` 或 `composables/`，保持组件轻量

## 已知约束

- 图片压缩使用 Base64 存储在 LocalStorage，单张建议不超过 1MB，否则容易超出存储上限。
- 生产构建依赖 `vue-tsc`，类型错误会阻断构建。
- 没有 ESLint/Prettier 配置，修改代码时注意保持现有风格。

## 遗留文件

- `index.legacy.html`：原始 HTML+CSS+JS 单文件版本，不要删除，保留作为备份。
