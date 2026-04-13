# fsdk

Vue 3 前端项目脚手架 CLI 工具，快速创建包含最佳技术栈的项目骨架。

## 安装

```bash
# 方式一：本地开发模式
cd /path/to/fsdk
pnpm install
pnpm dev

# 方式二：全局安装（发布后）
pnpm build
npm install -g @lumiflora/fsdk
```

## 使用命令

```bash
# 创建新项目
fsdk create my-project              # 交互式创建
fsdk create my-project --template full --package-manager pnpm

# 添加页面
fsdk add-page --page-name user --router-path /user

# 添加组件
fsdk add-component --name Header --type common

# 添加 Store
fsdk add-store --name user

# 校验配置和模板
fsdk validate

# 预览模板
fsdk preview --port 3000

# 生成补全脚本
fsdk completion bash    # 输出到 ~/.fsdk-completion.bash
fsdk completion zsh     # 输出到 ~/.fsdk-completion.zsh
fsdk completion fish    # 输出到 ~/.config/fish/completions/fsdk.fish

# 查看帮助
fsdk --help
fsdk create --help
```

## 模板

| 模板 | 说明 |
|------|------|
| `full` | Vue 3.5 + Vite 6 + Element Plus + Pinia + Vue Router + SCSS |
| `base` | Vue 3.5 + Vite 6 基础版 |

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.5.0 | 前端框架 |
| Vue Router | ^4.4.0 | 路由（文件路由系统） |
| Pinia | ^2.2.0 | 状态管理 |
| Element Plus | ^2.8.0 | UI 组件库 |
| Vite | ^6.0.0 | 构建工具 |
| TypeScript | ~5.6.0 | 类型系统 |
| ESLint | ^9.0.0 | 代码检查 |
