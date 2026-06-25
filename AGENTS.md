# AGENTS.md

## 项目概览

- **名称**: 沧海拾贝
- **前端**: Vue 3 + TypeScript + Vite + Pinia
- **后端**: Hono + TypeScript + 内存存储（`server/` 目录）
- **数据存储**: 后端内存存储，通过 RESTful API 交互
- **遗留文件**: `index.legacy.html` 是原始单文件 HTML 版本，不参与构建

## 常用命令

```bash
# 前端
npm run dev          # 启动开发服务器（默认 localhost:5173）
npm run build        # TypeScript 检查 + Vite 生产构建
npm run preview      # 预览生产构建产物
npm run test         # 监听模式运行 Vitest
npm run test:run     # 单次运行所有测试
npm run typecheck    # 仅运行 vue-tsc 类型检查

# 后端
npm run server:dev   # 启动 Hono 后端开发服务器（默认 localhost:3000）
npm run server:start # 启动 Hono 后端
npm run server:test  # 运行后端 Vitest 测试
```

## 启动顺序

前端依赖后端 API，开发时需要先启动后端：

```bash
npm run server:dev   # 终端 1
npm run dev          # 终端 2
```

## 验证顺序

提交前建议按顺序执行：

```bash
npm run typecheck
npm run test:run
npm run server:test
npm run build
```

## 项目结构

```
src/                    # 前端
  api/
    shellApi.ts         # 后端 API 调用封装
  components/           # Vue 组件
    ImageUploader.vue
    ShellEditor.vue
    ShellCard.vue
    ShellList.vue
  composables/
    useImageCompression.ts   # 图片压缩为 JPEG（依赖浏览器 Canvas）
  stores/
    shellStore.ts       # Pinia store：通过 API 与后端交互
  types/
    shell.ts            # Shell 数据接口
  utils/
    formatTime.ts       # 相对/具体时间格式化
  __tests__/            # 单元测试
  App.vue
  main.ts

server/                 # 后端
  src/
    index.ts            # Hono 入口
    routes/shells.ts    # RESTful 路由
    store/shellStore.ts # 内存存储
    types/shell.ts      # 类型定义
    __tests__/shells.test.ts
```

## 后端 API

Base URL：`http://localhost:3000/api`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/shells` | 获取所有贝壳（按 createdAt 降序） |
| GET | `/api/shells/:id` | 获取单个贝壳 |
| POST | `/api/shells` | 创建贝壳 |
| DELETE | `/api/shells/:id` | 删除贝壳 |
| POST | `/api/shells/:id/like` | 切换点赞状态 |

## 路径别名

- `@/` 映射到 `src/`，在 `vite.config.ts`、`vitest.config.ts`、`tsconfig.app.json` 中统一配置。

## 测试注意事项

- 前端 Vitest 运行在 **Node 环境**，没有 `HTMLCanvasElement`、`document`、`Image`、`FileReader` 等浏览器 API。
- 浏览器相关代码测试时需要手动 mock 上述全局对象。
- 后端 Vitest 直接测试 Hono app（`app.request`），无需启动真实服务器。
- 前端 `shellStore.spec.ts` 使用 `vi.mock('@/api/shellApi')` mock API 调用。

## 代码风格

- 使用 Vue 3 Composition API + `<script setup lang="ts">`
- 组件文件名使用 PascalCase
- Store 使用 Setup Store 风格（函数式）
- 优先使用 `shallowRef` 存储原始值和大型数组
- 后端使用 Hono 函数式路由，内存存储用 `Map`

## 已知约束

- 后端使用内存存储，重启后数据丢失。
- 图片压缩使用 Base64，单张建议不超过 1MB。
- 生产构建依赖 `vue-tsc`，类型错误会阻断构建。
- TypeScript 启用 `erasableSyntaxOnly`，禁止使用参数属性等实验性语法。
- 没有 ESLint/Prettier 配置，修改代码时注意保持现有风格。

## 遗留文件

- `index.legacy.html`：原始 HTML+CSS+JS 单文件版本，不要删除，保留作为备份。
