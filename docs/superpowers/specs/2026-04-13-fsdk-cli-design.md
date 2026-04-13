# fsdk CLI 工具设计文档

**日期**: 2026-04-13
**状态**: 已批准
**作者**: Claude

---

## 1. 项目概述

**fsdk** 是一个 Vue 3 前端项目脚手架 CLI 工具，用于快速创建包含最佳技术栈的项目骨架。

### 1.1 核心目标

- 提供预配置的 Vue 3 项目模板
- 支持多模板系统，可灵活扩展
- 插件化架构，支持功能扩展
- 完善的模板开发工具链

### 1.2 目标用户

- 需要快速搭建 Vue 3 项目的开发者
- 需要统一项目规范的团队
- 需要创建自定义脚手架的开发者

---

## 2. 技术栈

### 2.1 生成的项目技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | ^3.5.0 | 前端框架 |
| Vue Router | ^4.4.0 | 路由（文件路由系统） |
| Pinia | ^2.2.0 | 状态管理 |
| Element Plus | ^2.8.0 | UI 组件库 |
| Vite | ^6.0.0 | 构建工具 |
| SCSS | ^1.80.0 | CSS 预处理器 |
| TypeScript | ~5.6.0 | 类型系统 |
| unplugin-vue-components | ^0.27.0 | 组件自动导入 |
| unplugin-auto-import | ^0.18.0 | API 自动导入 |
| unplugin-vue-router | ^0.10.0 | 文件路由系统 |
| ESLint | ^9.0.0 | 严格代码检查 |

### 2.2 CLI 核心依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| cac | ^6.7.14 | CLI 框架 |
| prompts | ^2.4.2 | 交互式命令行 |
| chalk | ^5.3.0 | 终端颜色 |
| ora | ^8.0.1 | 加载动画 |
| fs-extra | ^11.2.0 | 文件操作 |
| ejs | ^3.1.9 | 模板引擎 |
| fast-glob | ^3.3.2 | 文件匹配 |
| json5 | ^2.2.3 | JSON5 解析 |
| zod | ^3.22.4 | 数据校验 |
| chokidar | ^3.5.3 | 文件监听（热重载） |

---

## 3. 整体架构

### 3.1 Monorepo 目录结构

```
fsdk/
├── packages/
│   ├── cli/                 # CLI 核心包
│   │   ├── src/
│   │   │   ├── commands/    # 各功能命令
│   │   │   │   ├── create-app.ts
│   │   │   │   ├── add-page.ts
│   │   │   │   ├── add-component.ts
│   │   │   │   ├── add-store.ts
│   │   │   │   ├── sync-template.ts
│   │   │   │   ├── validate.ts
│   │   │   │   └── preview.ts
│   │   │   ├── core/        # 核心功能
│   │   │   │   ├── plugin-system.ts
│   │   │   │   ├── template-engine.ts
│   │   │   │   ├── config-loader.ts
│   │   │   │   └── hot-reload.ts
│   │   │   ├── plugins/     # 内置插件
│   │   │   ├── completion/  # Tab 补全
│   │   │   └── index.ts     # CLI 入口
│   │   └── package.json
│   │
│   ├── templates/           # 模板包
│   │   ├── full/            # 完整版模板
│   │   │   ├── package.json
│   │   │   ├── vite.config.ts
│   │   │   ├── src/
│   │   │   └── public/
│   │   ├── base/            # 基础版模板
│   │   │   ├── package.json
│   │   │   ├── vite.config.ts
│   │   │   ├── src/
│   │   │   └── public/
│   │   └── package.json
│   │
│   └── plugins/             # 可发布的外部插件
│       └── add-component/
│
├── apps/
│   └── preview-server/      # 模板预览服务（开发用）
│
├── docs/
│   └── superpowers/specs/
│
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── .gitignore
```

### 3.2 模块职责

| 模块 | 职责 |
|------|------|
| cli/ | CLI 核心入口，负责命令解析、插件加载、模板处理 |
| templates/ | 存放各版本模板，每个模板是独立包 |
| plugins/ | 外部插件存放位置，可独立发布到 npm |
| apps/preview-server/ | 本地预览模板效果的 Vite 项目 |

---

## 4. 插件系统

### 4.1 插件接口

```typescript
export interface FsdkPlugin {
  name: string;
  version: string;

  // 插件初始化
  init?(context: PluginContext): void | Promise<void>;

  // 钩子函数
  beforeCreate?(ctx: CreateContext): void | Promise<void>;
  afterCreate?(ctx: CreateContext): void | Promise<void>;

  // 自定义命令
  commands?: CommandDefinition[];

  // 模板处理器
  templateProcessors?: TemplateProcessor[];

  // 配置合并
  mergeConfig?: (userConfig: any, pluginConfig: any) => any;
}

export interface PluginContext {
  cliVersion: string;
  rootDir: string;
  config: FsdkConfig;
  logger: Logger;
  templateEngine: TemplateEngine;
}
```

### 4.2 内置插件

| 插件名 | 功能 | 钩子/命令 |
|--------|------|-----------|
| core | 核心功能 | beforeCreate, afterCreate |
| add-page | 添加页面 | 命令：`fsdk add-page <name>` |
| add-component | 添加组件 | 命令：`fsdk add-component <name>` |
| add-store | 添加 Store | 命令：`fsdk add-store <name>` |
| sync-template | 同步模板 | 命令：`fsdk sync-template` |
| validate-template | 校验模板 | 命令：`fsdk validate-template <name>` |

### 4.3 插件加载机制

1. **内置插件**：从 `packages/cli/src/plugins/` 加载
2. **外部插件**：从 npm 安装，通过配置文件指定
3. **本地插件**：从项目的 `.fsdk/plugins/` 目录加载

---

## 5. 命令设计

### 5.1 核心命令

```bash
# 创建新项目
fsdk create-app <name> [options]
  --template, -t <name>    模板名称 [default: full]
  --package-manager <pm>   包管理器 [npm|pnpm|yarn|bun] [default: pnpm]
  --eslint <level>        ESLint 级别 [strict|recommended|off] [default: strict]
  --no-git                不初始化 git
  --install               自动安装依赖

# 添加页面
fsdk add-page <name> [options]
  --router-path <path>    路由路径 [default: /name]

# 添加组件
fsdk add-component <name> [options]
  --type <type>          组件类型 [page|common|business] [default: common]
  --dir <dir>            输出目录

# 添加 Store
fsdk add-store <name>

# 同步模板
fsdk sync-template [options]
  --template <name>      指定模板 [default: all]

# 校验模板
fsdk validate-template <name>

# 预览模板
fsdk preview <template> [options]
  --port <port>          端口 [default: 3000]

# 生成补全
fsdk completion [shell]

# 版本信息
fsdk --version, -v
```

### 5.2 命令补全

支持以下 Shell 的 Tab 补全：
- bash
- zsh
- fish

安装命令：
```bash
fsdk completion install
```

### 5.3 配置文件

```typescript
// .fsdkrc.ts
import { defineConfig } from 'fsdk'

export default defineConfig({
  defaultTemplate: 'full',
  packageManager: 'pnpm',
  eslintLevel: 'strict',
  autoInstall: true,
  initGit: true,
  plugins: [],
  variables: {
    author: 'Your Name',
    description: 'My Vue 3 App',
    version: '0.1.0'
  }
})
```

---

## 6. 项目模板设计

### 6.1 full 模板目录结构

```
full/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── eslint.config.mjs
├── .gitignore
├── .env
├── .env.example
├── index.html
│
├── src/
│   ├── main.ts                 # 入口文件（自动导入配置）
│   ├── App.vue                 # 根组件
│   │
│   ├── router/
│   │   └── index.ts            # vue-router 配置
│   │
│   ├── stores/
│   │   ├── index.ts            # Pinia 入口
│   │   └── modules/
│   │       └── app.ts          # 应用状态
│   │
│   ├── views/                  # 页面目录（文件路由）
│   │   ├── home/
│   │   │   └── index.vue
│   │   └── [...all].vue        # 404 页面
│   │
│   ├── components/
│   │   ├── common/             # 通用组件
│   │   └── business/           # 业务组件
│   │
│   ├── composables/            # 组合式函数
│   │   └── useApp.ts
│   │
│   ├── utils/
│   │   ├── request.ts          # HTTP 请求封装
│   │   └── index.ts
│   │
│   ├── constants/
│   │   └── index.ts
│   │
│   ├── types/
│   │   └── global.d.ts
│   │
│   └── styles/
│       ├── variables.scss      # SCSS 变量
│       ├── mixins.scss         # SCSS 混入
│       ├── reset.scss          # 样式重置
│       └── index.scss          # 入口
│
└── public/
    └── favicon.ico
```

### 6.2 base 模板目录结构

```
base/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── eslint.config.mjs
├── .gitignore
├── index.html
│
├── src/
│   ├── main.ts
│   ├── App.vue
│   │
│   ├── views/                  # 页面目录（文件路由）
│   │   └── home/
│   │       └── index.vue
│   │
│   ├── components/
│   │   └── common/
│   │
│   └── styles/
│       └── index.css
│
└── public/
    └── favicon.ico
```

### 6.3 unplugin-vue-router 配置

两个模板都使用文件路由系统，配置如下：

```typescript
import VueRouter from 'unplugin-vue-router/vite'

export default defineConfig({
  plugins: [
    VueRouter({
      pagesDir: 'src/views',
      extensions: ['.vue'],
    }),
    vue(),
  ],
})
```

### 6.4 Vite 配置（full 模板）

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    VueRouter({
      pagesDir: 'src/views',
      extensions: ['.vue'],
    }),
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
```

---

## 7. 热重载和开发工具

### 7.1 热重载机制

使用 `chokidar` 监听模板目录变化，自动清除缓存：

```typescript
import chokidar from 'chokidar'

export function enableHotReload() {
  const watcher = chokidar.watch('./packages/templates', {
    ignoreInitial: true,
  })

  watcher.on('all', (event, path) => {
    console.log(chalk.cyan(`[Hot Reload] Template changed: ${path}`))
    templateCache.clear()
  })

  return watcher
}
```

### 7.2 模板校验

使用 JSON Schema + Zod 校验模板结构：

- 必需文件检查（package.json, vite.config.ts 等）
- 配置文件格式验证
- 依赖版本兼容性检查

### 7.3 开发流程

```bash
# 1. 安装依赖
pnpm install

# 2. 开发模式（启用热重载）
pnpm dev

# 3. 修改模板
# 编辑 packages/templates/full/...

# 4. 测试创建项目
fsdk create-app test-project

# 5. 预览模板效果
fsdk preview full

# 6. 校验模板
fsdk validate-template full

# 7. 发布
pnpm build
pnpm publish
```

---

## 8. 发布和部署

### 8.1 npm 包结构

| 包名 | 说明 |
|------|------|
| `@lumiflora/fsdk` | CLI 核心包 |
| `@lumiflora/fsdk-templates` | 模板包（可选分离） |
| `@lumiflora/fsdk-plugin-*` | 外部插件 |

### 8.2 发布流程

```bash
# 1. 更新版本
pnpm changeset
pnpm changeset version

# 2. 构建
pnpm build

# 3. 测试
pnpm test

# 4. 发布
pnpm release
```

### 8.3 Scripts

```json
{
  "scripts": {
    "dev": "tsx packages/cli/src/index.ts",
    "build": "pnpm -r --filter './packages/**' build",
    "test": "vitest",
    "lint": "eslint .",
    "changeset": "changeset",
    "release": "changeset publish",
    "preview": "node apps/preview-server/index.js"
  }
}
```

---

## 9. ESLint 严格配置

### 9.1 配置级别

| 级别 | 说明 |
|------|------|
| strict | 最严格规则，推荐生产使用 |
| recommended | 平衡严格性和便利性 |
| off | 不配置 ESLint |

### 9.2 Strict 规则特点

- 大部分规则设置为 `error`
- 类型检查集成
- 统一代码风格：单引号、2 空格、无分号
- Vue 3 Composition API 最佳实践

---

## 10. 设计原则

1. **可扩展性**：插件系统和多模板架构支持未来扩展
2. **开发体验**：热重载、本地预览、模板校验提供完整开发工具链
3. **现代化**：使用最新的前端工具链和最佳实践
4. **灵活性**：支持参数覆盖和交互式自定义
5. **简单性**：核心功能简洁，按需加载插件

---

## 11. 后续扩展方向

- 支持从远程仓库加载模板
- 模板市场插件
- 可视化配置界面
- 团队协作功能（共享模板、配置）
