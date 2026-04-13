# fsdk CLI 工具实现

**日期**: 2026-04-13
**状态**: 已完成
**类型**: 功能实现

---

## 1. 概述

fsdk 是一个 Vue 3 前端项目脚手架 CLI 工具，用于快速创建包含最佳技术栈的项目骨架。

## 2. 实现内容

### 2.1 Monorepo 基础结构

- `pnpm-workspace.yaml` - pnpm workspace 配置
- `tsconfig.json` - TypeScript 根配置
- `package.json` - 根包配置
- `.gitignore` - Git 忽略配置

### 2.2 CLI 核心包 (packages/cli)

| 文件 | 说明 |
|------|------|
| `src/index.ts` | CLI 入口，使用 cac 框架 |
| `src/core/plugin-system.ts` | 插件系统 |
| `src/core/template-engine.ts` | EJS 模板引擎 |
| `src/core/config-loader.ts` | Zod 配置加载 |
| `src/core/hot-reload.ts` | chokidar 热重载 |
| `src/commands/create.ts` | 创建项目命令 |
| `src/commands/add-page.ts` | 添加页面命令 |
| `src/commands/add-component.ts` | 添加组件命令 |
| `src/commands/add-store.ts` | 添加 Store 命令 |
| `src/commands/sync-template.ts` | 同步模板命令 |
| `src/commands/validate.ts` | 校验模板命令 |
| `src/commands/preview.ts` | 预览模板命令 |
| `src/commands/completion.ts` | Tab 补全命令 |
| `src/plugins/*.ts` | 内置插件 |
| `src/utils/*.ts` | 工具函数 |
| `src/completion/*.ts` | 补全脚本 |

### 2.3 模板包 (packages/templates)

**full 模板** (25 文件):
- Vue 3.5 + Vite 6 + Element Plus + Pinia + Vue Router
- 文件路由系统
- SCSS 样式
- 严格 ESLint 配置

**base 模板** (12 文件):
- Vue 3.5 + Vite 6 基础版
- 最小配置

### 2.4 预览服务 (apps/preview-server)

- Vite preview 模式
- chokidar 监听模板变化
- SSE 热重载
- 模板切换功能

## 3. 验证结果

```bash
# CLI 版本
$ pnpm exec tsx src/index.ts --version
fsdk/0.1.0 linux-x64 node-v24.11.1

# 创建项目
$ pnpm exec tsx src/index.ts create
[INFO] Creating new application...
[? What is the project name? › my-app

# 校验命令
$ pnpm exec tsx src/index.ts validate
[INFO] Validating configuration...
[INFO] Validating templates...
[WARN] Validation passed with warnings: ...
```

## 4. 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.5.0 | 前端框架 |
| Vite | ^6.0.0 | 构建工具 |
| TypeScript | ~5.6.0 | 类型系统 |
| cac | ^6.7.14 | CLI 框架 |
| ejs | ^3.1.9 | 模板引擎 |
| chokidar | ^3.5.3 | 文件监听 |
| zod | ^3.22.4 | 数据校验 |

## 5. 已知问题

~~- `--help` 参数在命令后不生效（cac 配置问题）~~ ✓ 已修复
~~- fish shell 补全脚本未实现~~ ✓ 已修复

## 6. 后续扩展

- 远程模板仓库支持
- 模板市场插件
- 可视化配置界面
