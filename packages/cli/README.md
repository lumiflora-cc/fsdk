# @lumiflora/fsdk

Vue 3 前端项目脚手架 CLI 工具，快速创建包含最佳技术栈的项目骨架。

## 安装

```bash
npm install -g @lumiflora/fsdk
```

## 快速开始

```bash
# 交互式创建项目
fsdk create

# 指定参数创建
fsdk create my-project --template full --package-manager pnpm
```

## 命令

### create - 创建新项目

```bash
fsdk create [project-name] [options]

Options:
  --template <name>        模板名称 (base|full) [default: base]
  --package-manager <pm>    包管理器 (npm|pnpm|yarn|bun) [default: pnpm]
  --eslint                 启用 ESLint [default: true]
  --no-git                 跳过 git 初始化
  --no-install             跳过依赖安装
```

### add-page - 添加页面

```bash
fsdk add-page [options]

Options:
  --page-name <name>    页面名称
  --router-path <path>  路由路径
```

### add-component - 添加组件

```bash
fsdk add-component [options]

Options:
  --name <name>    组件名称
  --type <type>    组件类型 (page|common|business) [default: common]
  --dir <dir>      子目录
```

### add-store - 添加状态管理

```bash
fsdk add-store [options]

Options:
  --name <name>    Store 名称
  --type <type>    Store 类型 (pinia|redux) [default: pinia]
```

### validate - 校验配置和模板

```bash
fsdk validate [options]

Options:
  --config      仅校验配置
  --templates   仅校验模板
  --strict      严格校验
```

### preview - 预览模板

```bash
fsdk preview [options]

Options:
  --port <port>      端口号 [default: 3000]
  --host <host>      主机地址 [default: localhost]
  --open             打开浏览器
  --template <name>  模板名称
```

### sync-template - 同步模板文件

```bash
fsdk sync-template [options]

Options:
  --template <name>    模板名称
  --force              强制同步
```

### completion - 生成 Shell 补全

```bash
fsdk completion [shell] [options]

Options:
  --install    自动安装到 shell 配置

# 示例
fsdk completion --install    # 自动配置当前 shell
fsdk completion zsh --install
fsdk completion bash --install
```

## 模板

| 模板 | 说明 |
|------|------|
| `base` | Vue 3.5 + Vite 6 基础版 |
| `full` | Vue 3.5 + Vite 6 + Element Plus + Pinia + Vue Router + SCSS + ESLint |

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

## 开发

```bash
# 本地开发
cd packages/cli
pnpm install
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm typecheck
```

## License

MIT
