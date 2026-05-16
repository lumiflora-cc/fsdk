# Full 模板使用指南

本文档详细介绍 full 模板的技术栈用法和最佳实践。

## 目录

- [快速开始](#快速开始)
- [路由系统](#路由系统)
- [状态管理](#状态管理)
- [HTTP 请求](#http-请求)
- [国际化](#国际化)
- [主题切换](#主题切换)
- [样式规范](#样式规范)
- [组件开发](#组件开发)
- [API 定义](#api-定义)

---

## 快速开始

```bash
# 创建基于 full 模板的新项目
fsdk create my-app --template full

cd my-app
pnpm install
pnpm dev
```

---

## 路由系统

### 文件路由

模板使用 `vite-plugin-pages` 实现基于文件的路由系统。

**路由规则**：

| 文件路径 | 路由路径 |
|----------|----------|
| `src/pages/index.vue` | `/` |
| `src/pages/home/index.vue` | `/home` |
| `src/pages/user/list.vue` | `/user/list` |
| `src/pages/[id].vue` | `/xxx`（动态参数） |
| `src/pages/[...all].vue` | `*`（404 捕获） |

**示例**：创建 `/about` 页面

```bash
# 创建页面文件
mkdir -p src/pages/about
echo '<script setup lang="ts">
definePageMeta({ title: '"'"'关于'"'"' })
</script>

<template>
  <div>关于页面</div>
</template>' > src/pages/about/index.vue
```

### 路由元信息

通过 `definePageMeta` 定义页面元信息：

```vue
<script setup lang="ts">
definePageMeta({
  title: '用户列表',
  layout: 'default',
  middleware: ['auth']
})
</script>
```

### 路由守卫

在 `src/router/index.ts` 中配置全局导航守卫：

```typescript
router.beforeEach((to, from, next) => {
  // 检查登录状态
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})
```

---

## 状态管理

### Pinia Store

模板使用 Pinia 进行状态管理。

#### 创建 Store

```typescript
// src/stores/modules/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const name = ref('')
  const token = ref('')

  function setUser(user: { name: string; token: string }) {
    name.value = user.name
    token.value = user.token
  }

  function logout() {
    name.value = ''
    token.value = ''
    localStorage.removeItem('token')
  }

  return { name, token, setUser, logout }
})
```

#### 在组件中使用

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

// 直接访问
console.log(userStore.name)

// 修改状态
userStore.setUser({ name: '张三', token: 'xxx' })
</script>
```

#### Composable 封装

推荐使用 Composable 封装 Store 访问：

```typescript
// src/composables/useUser.ts
import { computed } from 'vue'
import { useUserStore } from '@/stores/modules/user'

export function useUser() {
  const userStore = useUserStore()

  const name = computed(() => userStore.name)
  const isLoggedIn = computed(() => !!userStore.token)

  function login(credentials: { username: string; password: string }) {
    // 登录逻辑
    userStore.setUser({ name: credentials.username, token: 'xxx' })
  }

  function logout() {
    userStore.logout()
  }

  return { name, isLoggedIn, login, logout }
}
```

---

## HTTP 请求

### 请求封装

模板在 `src/utils/request.ts` 中提供了基于 Axios 的请求封装：

```typescript
import { get, post } from '@/utils/request'
import type { ApiResponse } from '@/types'

// GET 请求
const res = await get<User[]>('/users', { page: 1, pageSize: 10 })

// POST 请求
const res = await post<User, CreateUserDTO>('/users', {
  name: '张三',
  email: 'zhang@example.com'
})
```

### 请求方法

| 方法 | 用途 | 签名 |
|------|------|------|
| `get<T>` | GET 请求 | `get<T>(url, params?, config?)` |
| `post<T, D>` | POST 请求 | `post<T, D>(url, data?, config?)` |
| `put<T, D>` | PUT 请求 | `put<T, D>(url, data?, config?)` |
| `patch<T, D>` | PATCH 请求 | `patch<T, D>(url, data?, config?)` |
| `del<T>` | DELETE 请求 | `del<T>(url, params?, config?)` |
| `paginate<T>` | 分页请求 | `paginate<T>(url, params?)` |
| `list<T>` | 列表请求（不分页） | `list<T>(url, params?)` |
| `upload<T>` | 文件上传 | `upload<T>(url, file, data?)` |
| `download` | 文件下载 | `download(url, params?, filename?)` |

### 响应类型

```typescript
// 基础响应
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 分页响应
interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages?: number
  }
}
```

### Token 处理

请求拦截器自动从 `localStorage` 读取 `token` 并添加到 `Authorization` 头：

```typescript
const token = localStorage.getItem('token')
if (token && config.headers) {
  config.headers.Authorization = `Bearer ${token}`
}
```

### 定义 API 模块

```typescript
// src/api/article.ts
import { get, post, put, del, paginate } from '@/utils/request'
import type { ApiResponse, ListParams } from '@/types'

export interface Article {
  id: number
  title: string
  content: string
  author: string
  status: 'draft' | 'published' | 'archived'
  createdAt: string
}

export function getArticleList(params: ListParams) {
  return paginate<Article>('/articles', params)
}

export function getArticle(id: number) {
  return get<Article>(`/articles/${id}`)
}

export function createArticle(data: Partial<Article>) {
  return post<Article, Partial<Article>>('/articles', data)
}

export function updateArticle(id: number, data: Partial<Article>) {
  return put<Article, Partial<Article>>(`/articles/${id}`, data)
}

export function deleteArticle(id: number) {
  return del<void>(`/articles/${id}`)
}
```

---

## 国际化

### 语言包结构

```
src/locales/
├── index.ts        # 导出配置
├── zh-CN.ts        # 简体中文
└── en-US.ts        # English
```

### 使用翻译

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <h1>{{ t('menu.home') }}</h1>
  <p>{{ t('common.loading') }}</p>
</template>
```

### 切换语言

```typescript
import { setLocale } from '@/i18n'

// 切换到英文
setLocale('en-US')

// 切换到中文
setLocale('zh-CN')
```

### 添加新语言

1. 在 `src/locales/` 下创建新的语言文件（如 `ja-JP.ts`）
2. 在 `src/locales/index.ts` 中导入并添加到 `messages`

```typescript
import jaJP from './ja-JP'

export const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP
}
```

3. 在 `supportedLocales` 中添加语言选项

---

## 主题切换

### 亮色/暗色主题

模板使用 CSS 变量实现主题切换，通过 `html.dark` 选择器区分。

**主题变量定义**：

```scss
// light.scss - 亮色变量
:root {
  --el-color-primary: #409eff;
  --el-bg-color: #ffffff;
}

// dark.scss - 暗色变量
html.dark {
  --el-color-primary: #409eff;
  --el-bg-color: #1d1e1f;
}
```

**切换主题**：

```typescript
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme, setTheme } = useTheme()

// 切换
toggleTheme()

// 设置指定主题
setTheme('dark')
setTheme('light')
```

### Element Plus 主题变量

Element Plus 主题变量在 `src/styles/element-variables.scss` 中定义：

```scss
/* 亮色主题 */
:root {
  --el-color-primary: #409eff;
  --el-border-color-base: #dcdfe6;
}

/* 暗色主题 */
html.dark {
  --el-color-primary: #409eff;
  --el-border-color-base: #4c4c4c;
}
```

---

## 样式规范

### SCSS 变量

在 `src/styles/variables.scss` 中定义全局 SCSS 变量：

```scss
$primary-color: #409eff;
$success-color: #67c23a;
$border-radius-base: 4px;
```

使用：

```scss
.my-component {
  color: $primary-color;
  border-radius: $border-radius-base;
}
```

### Mixins

在 `src/styles/mixins.scss` 中定义可复用的 mixin：

```scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

使用：

```scss
.my-component {
  @include flex-center;
  @include text-ellipsis;
}
```

### 全局样式注入

Vite 配置中通过 `additionalData` 自动注入全局样式到每个 SCSS 文件：

```typescript
// vite.config.ts
css: {
  preprocessorOptions: {
    scss: {
      additionalData: `
        @use "@/styles/themes/index.scss" as *;
        @use "@/styles/variables.scss" as *;
        @use "@/styles/mixins.scss" as *;
      `
    }
  }
}
```

---

## 组件开发

### 组件结构

```vue
<!-- src/components/MyComponent.vue -->
<script setup lang="ts">
/**
 * 组件说明
 */
import { ref, computed } from 'vue'

// Props 定义
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// Emit 定义
const emit = defineEmits<{
  (e: 'update', value: number): void
  (e: 'click'): void
}>()

// 组合式 API
const localCount = ref(props.count)

function handleClick() {
  localCount.value++
  emit('update', localCount.value)
  emit('click')
}
</script>

<template>
  <div class="my-component">
    <h3>{{ title }}</h3>
    <p>Count: {{ localCount }}</p>
    <el-button @click="handleClick">增加</el-button>
  </div>
</template>

<style lang="scss" scoped>
.my-component {
  padding: 16px;
  border: 1px solid var(--el-border-color-base);
  border-radius: var(--el-border-radius-base);
}
</style>
```

### 自动导入

模板配置了 `unplugin-auto-import` 和 `unplugin-vue-components`，以下内容自动导入：

**Vue API**：`ref`, `computed`, `watch`, `onMounted` 等
**组件**：Element Plus 组件（直接使用 `<el-button>` 而无需手动 import）
**图标**：`unplugin-icons` 提供的图标（使用 `<i-ep-xxx>` 格式）

---

## API 定义

### 类型定义

在 `src/types/index.ts` 中定义通用类型：

```typescript
// 分页参数
interface ListParams {
  page?: number
  pageSize?: number
  keyword?: string
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

// 分页元数据
interface PageMeta {
  total: number
  page: number
  pageSize: number
  totalPages?: number
}

// 分页响应
interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: PageMeta
  error?: string
}
```

---

## 常见问题

### 如何添加新页面？

在 `src/pages/` 下创建 `.vue` 文件即可自动生成路由。例如创建 `src/pages/settings/index.vue`，访问 `/settings` 即可。

### 如何添加新 Store？

在 `src/stores/modules/` 下创建新文件，然后导出到 `src/stores/index.ts`。

### 如何修改 API 基础路径？

在 `.env` 文件中设置 `VITE_APP_BASE_API=/api`。

### 如何禁用某个插件的自动导入？

修改 `vite.config.ts` 中对应插件的配置。
