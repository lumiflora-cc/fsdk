# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@lumiflora/fsdk` is a Vue 3 frontend project scaffold CLI tool that rapidly creates project skeletons with best-practice tech stacks.

## Common Commands

```bash
# Install dependencies (from fsdk root)
pnpm install

# Local development mode (from packages/cli)
pnpm dev

# Build for production
pnpm build

# Type check
pnpm typecheck

# Run tests
pnpm test

# Lint
pnpm lint
```

## Architecture

```
packages/cli/src/
├── index.ts           # CLI entry point - CAC-based command router
├── commands/          # Command implementations
│   ├── create-app.ts  # Scaffold new Vue projects
│   ├── add-page.ts    # Add new page with file-router
│   ├── add-component.ts
│   ├── add-store.ts
│   ├── validate.ts
│   ├── preview.ts
│   ├── completion.ts
│   └── sync-template.ts
├── core/              # Core systems
│   ├── plugin-system.ts    # Plugin lifecycle hooks (before/after Register/Exec)
│   ├── template-engine.ts  # EJS-based template rendering
│   ├── config-loader.ts    # Plugin context creation
│   └── hot-reload.ts
├── plugins/           # Built-in plugins
│   ├── core-plugin.ts
│   ├── add-page-plugin.ts
│   ├── add-component-plugin.ts
│   └── add-store-plugin.ts
├── utils/             # Utilities
│   ├── logger.ts      # Chalk-based logger with debug/error/success/warning
│   ├── path.ts        # Path resolution (uses global __cliRoot set by index.ts)
│   └── spinner.ts
└── completion/        # Shell completion scripts (bash, zsh)

apps/preview-server/   # Template preview server (Vite + Express)
```

## Key Patterns

### Path Resolution
`src/utils/path.ts` uses a global `__cliRoot` set in `index.ts` to locate templates at `../templates` relative to CLI root. Templates are stored in `packages/templates/` (sibling to `packages/cli/`).

### Plugin System
Commands use plugin hooks (`beforeExec`/`afterExec`) through `pluginSystem.execHook()`. Plugin context is created via `configLoader.createPluginContext()`.

### Template Engine
Uses EJS for `.ejs`/`.tpl`/`.tmpl` files, copies other files as-is. Templates live in `packages/templates/{templateName}/src/`.

### Commands
All commands follow pattern: validate options → create plugin context → exec beforeExec hook → execute command → exec afterExec hook with success/error status.

## TypeScript Config
Uses ESNext modules with `moduleResolution: "bundler"`. Strict mode enabled. Test files use Vitest with `environment: 'node'`.
