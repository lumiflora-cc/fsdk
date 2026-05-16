# 贡献指南

感谢您对 @lumiflora/fsdk 的关注与贡献！

## 如何贡献

### 报告问题

- 使用 GitHub Issues 提交 bug 报告或功能请求
- 描述清晰，包含复现步骤、环境信息
- 标签：`bug` / `enhancement` / `question`

### 提交代码

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feat/your-feature-name`
3. 提交更改：`git commit -m 'feat: add some feature'`
4. 推送分支：`git push origin feat/your-feature-name`
5. 创建 Pull Request

## 分支规范

| 分支类型 | 命名规范 | 说明 |
|----------|----------|------|
| 功能分支 | `feat/` | 新功能开发 |
| 修复分支 | `fix/` | bug 修复 |
| 重构分支 | `refactor/` | 代码重构 |
| 文档分支 | `docs/` | 文档更新 |

## 提交信息规范

使用 Conventional Commits 格式：

```
<type>: <description>

[optional body]
```

**type 类型**：

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | bug 修复 |
| `docs` | 文档变更 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 重构（非功能变更） |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具变更 |

**示例**：

```
feat(full-template): 添加主题切换功能

支持亮色/暗色主题切换，保留用户偏好到 localStorage

Closes #123
```

## 代码规范

### TypeScript

- 使用 strict 模式
- 避免使用 `any`，优先使用 `unknown` + 类型收窄
- 导出函数需明确声明返回类型
- 接口命名使用 PascalCase

### Vue 组件

- 使用 `<script setup lang="ts">` 语法
- Props 使用 `defineProps` 声明
- Emit 使用 `defineEmits` 声明
- 组件名使用 PascalCase

### CSS / SCSS

- 使用 SCSS 预处理器
- 遵循 BEM 命名规范（块__元素--修饰符）
- 使用 CSS 自定义属性（变量）管理主题色
- 避免行内样式

## 模板开发指南

### 新增模板

1. 在 `packages/templates/` 下创建模板目录
2. 目录结构遵循 `src/` 标准布局
3. 提供 `package.json`、`vite.config.ts`、`tsconfig.json`
4. 更新 README.md 模板表格

### 模板要求

- 所有依赖版本需锁定（不使用 `latest`）
- 提供 `.env.example` 环境变量模板
- 包含基础页面示例（home/about/error）
- 国际化支持（中英文语言包）

## Pull Request 流程

1. PR 需要通过所有 CI 检查
2. 至少 1 个维护者 Review 通过
3. 关联的 Issue 已关闭或引用
4. 合并使用 Squash Merge

## 开发环境

```bash
# 克隆仓库
git clone https://github.com/lumiflora/fsdk.git
cd fsdk

# 安装依赖
pnpm install

# 本地开发 CLI
cd packages/cli
pnpm dev

# 测试模板
cd packages/templates/full
pnpm dev
```

## 测试

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率
pnpm test --coverage
```

## 许可证

通过提交代码，您同意将您的贡献按照 MIT 许可证发布。
