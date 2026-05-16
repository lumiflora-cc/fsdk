# @lumiflora/fsdk

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

# 生成并安装补全脚本
fsdk completion bash    # 生成 bash 补全脚本
fsdk completion zsh     # 生成 zsh 补全脚本
fsdk completion fish    # 生成 fish 补全脚本

# 自动安装到 shell 配置文件（推荐）
fsdk completion bash --install
fsdk completion zsh --install

# 查看帮助
fsdk --help
fsdk create --help
```

## Shell 补全

fsdk 支持 bash、zsh 和 fish 的命令行补全。安装后，输入 `fsdk ` 后按 Tab 键可自动补全命令和选项。

### Bash（Linux / macOS）

```bash
# 方式一：自动安装（推荐）
fsdk completion bash --install
source ~/.bashrc

# 方式二：手动安装
fsdk completion bash
echo 'source ~/.fsdk-completion.bash' >> ~/.bashrc
source ~/.bashrc
```

### Zsh（macOS 默认）

```bash
# 方式一：自动安装（推荐）
fsdk completion zsh --install
source ~/.zshrc

# 方式二：手动安装
fsdk completion zsh
# 添加以下内容到 ~/.zshrc：
# fpath=("$HOME/.zsh/completion" $fpath)
# autoload -U compinit && compinit
source ~/.zshrc
```

> **注意**：如果使用 Oh My Zsh，可以将补全文件复制到 `~/.oh-my-zsh/completions/` 目录：
> ```bash
> mkdir -p ~/.oh-my-zsh/completions
> fsdk completion zsh --output ~/.oh-my-zsh/completions/_fsdk
> exec zsh
> ```

### Fish

```bash
fsdk completion fish
# 补全文件自动生成到 ~/.config/fish/completions/fsdk.fish
# 重启 fish 或打开新终端即可生效
```

## 模板

| 模板 | 说明 |
|------|------|
| `full` | Vue 3.5 + Vite 6 + Element Plus + Pinia + Vue Router + SCSS + i18n + Axios |
| `base` | Vue 3.5 + Vite 6 基础版 |

## 技术栈详解

### full 模板

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.5.0 | 前端框架，Composition API |
| Vue Router | ^4.4.0 | 路由（基于 vite-plugin-pages 的文件路由） |
| Pinia | ^2.2.0 | 状态管理 |
| Element Plus | ^2.8.0 | UI 组件库 |
| Vue I18n | ^11.0.0 | 国际化 |
| Axios | ^1.7.0 | HTTP 请求 |
| Vite | ^6.0.0 | 构建工具 |
| TypeScript | ~5.6.0 | 类型系统 |
| ESLint | ^9.0.0 | 代码检查 |
| SCSS | ^1.80.0 | CSS 预处理器 |

### base 模板

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.5.0 | 前端框架 |
| Vite | ^6.0.0 | 构建工具 |
| TypeScript | ~5.6.0 | 类型系统 |
| ESLint | ^9.0.0 | 代码检查 |

## full 模板目录结构

```
full/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.mjs
├── .env                        # 环境变量（本地）
├── .env.example                 # 环境变量模板
└── src/
    ├── main.ts                 # 应用入口
    ├── App.vue                 # 根组件
    ├── api/                    # API 模块
    │   ├── index.ts
    │   └── user.ts
    ├── components/             # 公共组件
    │   ├── ThemeSwitcher.vue
    │   └── LocaleSwitcher.vue
    ├── composables/            # Composables（Vue Hooks）
    │   ├── useApp.ts
    │   └── useTheme.ts
    ├── constants/              # 常量定义
    │   └── index.ts
    ├── i18n/                   # 国际化配置
    │   └── index.ts
    ├── layouts/                # 布局组件
    │   └── default.vue
    ├── locales/                # 语言包
    │   ├── index.ts
    │   ├── zh-CN.ts
    │   └── en-US.ts
    ├── pages/                  # 页面（文件路由）
    │   ├── home/
    │   │   └── index.vue
    │   └── [...all].vue        # 404 捕获
    ├── router/                 # 路由配置
    │   └── index.ts
    ├── stores/                 # Pinia Store
    │   ├── index.ts
    │   └── modules/
    │       ├── app.ts
    │       └── theme.ts
    ├── styles/                # 全局样式
    │   ├── index.scss
    │   ├── variables.scss
    │   ├── mixins.scss
    │   ├── reset.scss
    │   ├── element-variables.scss
    │   └── themes/
    │       ├── index.scss
    │       ├── light.scss
    │       └── dark.scss
    ├── types/                 # 类型定义
    │   ├── index.ts
    │   └── global.d.ts
    └── utils/                 # 工具函数
        ├── index.ts
        └── request.ts
```

## 环境变量

full 模板支持以下环境变量（定义在 `.env` 或 `.env.example` 中）：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_APP_TITLE` | 应用标题 | `Lumiflora` |
| `VITE_APP_BASE_API` | API 基础路径 | `/api` |
| `VITE_APP_TIMEOUT` | 请求超时时间（ms） | `30000` |
| `VITE_APP_LOCALE` | 默认语言 | `zh-CN` |

## 开发

```bash
cd packages/templates/full

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 类型检查
pnpm typecheck

# ESLint 检查
pnpm lint

# 预览构建结果
pnpm preview
```

## 贡献

欢迎提交 Issue 和 Pull Request。详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 许可证

MIT
