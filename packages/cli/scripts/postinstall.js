#!/usr/bin/env node

import { existsSync } from 'fs';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const detectShell = () => {
  const shell = process.env.SHELL || '';
  if (shell.includes('zsh')) return 'zsh';
  if (shell.includes('fish')) return 'fish';
  return 'bash';
};

const generateCompletion = (shell) => {
  if (shell === 'bash') {
    return `#!/bin/bash
# fsdk bash completion

_fsdk_completion() {
  local cur prev opts
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"
  opts="create add-page add-component add-store sync-template validate preview completion"
  case "\${prev}" in
    create)
      opts="--template --package-manager --eslint --no-git --no-install"
      ;;
    add-page)
      opts="--router-path --page-name"
      ;;
    add-component)
      opts="--type --name --dir"
      ;;
    add-store)
      opts="--type --name"
      ;;
    sync-template)
      opts="--template --force"
      ;;
    validate)
      opts="--config --templates --strict"
      ;;
    preview)
      opts="--port --host --open --template"
      ;;
    completion)
      opts="bash zsh fish"
      ;;
  esac
  COMPREPLY=($(compgen -W "\${opts}" -- "\${cur}"))
  return 0
}
complete -F _fsdk_completion fsdk`;
  }

  if (shell === 'zsh') {
    return `#compdef fsdk

_fsdk() {
  local -a commands
  commands=(
    'create:Create a new application'
    'add-page:Add a new page'
    'add-component:Add a new component'
    'add-store:Add a new store'
    'sync-template:Sync template files'
    'validate:Validate configuration and templates'
    'preview:Preview template'
    'completion:Generate shell completion script'
  )
  _arguments -C \
    '1: :->command' \
    '2: :->args' \
    '*: :->rest'
  case "$state" in
    command)
      _describe 'command' commands
      ;;
    args)
      case $words[1] in
        create)
          _arguments -s \
            '--template[Template name]' \
            '--package-manager[Package manager: npm|pnpm|yarn|bun]' \
            '--eslint[Enable ESLint]' \
            '--no-git[Skip git initialization]' \
            '--no-install[Skip dependency installation]'
          ;;
        add-page)
          _arguments -s \
            '--router-path[Router path]' \
            '--page-name[Page name]'
          ;;
        add-component)
          _arguments -s \
            '--type[Component type: page|common|business]' \
            '--name[Component name]' \
            '--dir[Subdirectory]'
          ;;
        add-store)
          _arguments -s \
            '--type[Store type: pinia|redux]' \
            '--name[Store name]'
          ;;
        sync-template)
          _arguments -s \
            '--template[Template name]' \
            '--force[Force sync]'
          ;;
        validate)
          _arguments -s \
            '--config[Validate config only]' \
            '--templates[Validate templates only]' \
            '--strict[Strict validation]'
          ;;
        preview)
          _arguments -s \
            '--port[Port number]' \
            '--host[Host address]' \
            '--open[Open browser]' \
            '--template[Template name]'
          ;;
        completion)
          _arguments -s \
            'bash:Generate bash completion' \
            'zsh:Generate zsh completion' \
            'fish:Generate fish completion'
          ;;
      esac
      ;;
  esac
}`;
  }

  if (shell === 'fish') {
    return `# fish completion for fsdk

complete -c fsdk -n '__fish_use_subcommand' -a 'create' -d 'Create a new application'
complete -c fsdk -n '__fish_use_subcommand' -a 'add-page' -d 'Add a new page'
complete -c fsdk -n '__fish_use_subcommand' -a 'add-component' -d 'Add a new component'
complete -c fsdk -n '__fish_use_subcommand' -a 'add-store' -d 'Add a new store'
complete -c fsdk -n '__fish_use_subcommand' -a 'sync-template' -d 'Sync template files'
complete -c fsdk -n '__fish_use_subcommand' -a 'validate' -d 'Validate configuration and templates'
complete -c fsdk -n '__fish_use_subcommand' -a 'preview' -d 'Preview template'
complete -c fsdk -n '__fish_use_subcommand' -a 'completion' -d 'Generate shell completion script'

complete -c fsdk -n '__fish_seen_subcommand_from create' -l template -d 'Template name'
complete -c fsdk -n '__fish_seen_subcommand_from create' -l package-manager -d 'Package manager' -a 'npm pnpm yarn bun'
complete -c fsdk -n '__fish_seen_subcommand_from create' -l eslint -d 'Enable ESLint'
complete -c fsdk -n '__fish_seen_subcommand_from create' -l no-git -d 'Skip git initialization'
complete -c fsdk -n '__fish_seen_subcommand_from create' -l no-install -d 'Skip dependency installation'

complete -c fsdk -n '__fish_seen_subcommand_from add-page' -l router-path -d 'Router path'
complete -c fsdk -n '__fish_seen_subcommand_from add-page' -l page-name -d 'Page name'

complete -c fsdk -n '__fish_seen_subcommand_from add-component' -l type -d 'Component type' -a 'page common business'
complete -c fsdk -n '__fish_seen_subcommand_from add-component' -l name -d 'Component name'
complete -c fsdk -n '__fish_seen_subcommand_from add-component' -l dir -d 'Subdirectory'

complete -c fsdk -n '__fish_seen_subcommand_from add-store' -l type -d 'Store type' -a 'pinia redux'
complete -c fsdk -n '__fish_seen_subcommand_from add-store' -l name -d 'Store name'

complete -c fsdk -n '__fish_seen_subcommand_from sync-template' -l template -d 'Template name'
complete -c fsdk -n '__fish_seen_subcommand_from sync-template' -l force -d 'Force sync'

complete -c fsdk -n '__fish_seen_subcommand_from validate' -l config -d 'Validate config only'
complete -c fsdk -n '__fish_seen_subcommand_from validate' -l templates -d 'Validate templates only'
complete -c fsdk -n '__fish_seen_subcommand_from validate' -l strict -d 'Strict validation'

complete -c fsdk -n '__fish_seen_subcommand_from preview' -l port -d 'Port number'
complete -c fsdk -n '__fish_seen_subcommand_from preview' -l host -d 'Host address'
complete -c fsdk -n '__fish_seen_subcommand_from preview' -l open -d 'Open browser'
complete -c fsdk -n '__fish_seen_subcommand_from preview' -l template -d 'Template name'`;
  }
};

const installCompletion = () => {
  const shell = detectShell();
  const home = process.env.HOME || process.env.USERPROFILE || '';
  let rcFile = '';
  let completionFile = '';
  let configLine = '';

  if (shell === 'bash') {
    rcFile = path.resolve(home, '.bashrc');
    completionFile = path.resolve(home, '.fsdk-completion.bash');
    configLine = 'source ~/.fsdk-completion.bash';
  } else if (shell === 'zsh') {
    rcFile = path.resolve(home, '.zshrc');
    completionFile = path.resolve(home, '.zsh', 'completion', '_fsdk');
    configLine = 'fpath=("~/.zsh/completion" $fpath)';
  } else if (shell === 'fish') {
    rcFile = path.resolve(home, '.config', 'fish', 'config.fish');
    completionFile = path.resolve(home, '.config', 'fish', 'completions', 'fsdk.fish');
    configLine = '';
  }

  // 生成补全文件
  try {
    const content = generateCompletion(shell);
    writeFileSync(completionFile, content, 'utf-8');
    if (shell === 'bash') {
      import('fs').then(fs => { fs.chmodSync(completionFile, 0o755); });
    }
  } catch (err) {
    console.error('Failed to write completion file:', err.message);
    process.exit(1);
  }

  // Fish 不需要额外配置
  if (shell === 'fish') {
    console.log('✓ fsdk completion installed to', completionFile);
    console.log('  Restart your fish shell or open a new terminal to apply');
    return;
  }

  // 读取现有配置
  let rcContent = '';
  if (existsSync(rcFile)) {
    rcContent = readFileSync(rcFile, 'utf-8');
  }

  // 先检测原始内容是否已有有效配置
  const alreadyHasValidConfig = (shell === 'bash' && rcContent.includes('source ~/.fsdk-completion.bash')) ||
                          (shell === 'zsh' && /fpath=.*\.zsh\/completion/.test(rcContent));

  if (alreadyHasValidConfig) {
    console.log('✓ fsdk completion already configured in', rcFile);
    return;
  }

  // 清理旧的 fsdk completion 配置
  const lines = rcContent.split('\n');
  const newLines = [];
  let skipLines = false;
  for (const line of lines) {
    if (line.includes('# fsdk completion') || line.includes('# zsh fsdk completion') || line.includes('# bash fsdk completion')) {
      skipLines = true;
      continue;
    }
    if (skipLines) {
      if (line.trim() === '') {
        skipLines = false;
      }
      continue;
    }
    newLines.push(line);
  }

  const newContent = newLines.join('\n');

  // 检查是否已有 compinit（使用原始 rcContent）
  const alreadyHasCompinit = rcContent.includes('autoload -U compinit');

  // 决定添加什么配置
  let configToAdd = '';
  if (shell === 'zsh' && alreadyHasCompinit) {
    // 已有 compinit，只添加 fpath
    configToAdd = '# zsh fsdk completion\n' + configLine + '\n';
  } else if (configLine) {
    configToAdd = `# ${shell} fsdk completion\n${configLine}\n`;
  }

  // 写入新配置
  writeFileSync(rcFile, (newContent ? newContent + '\n' : '') + configToAdd, 'utf-8');
  console.log('✓ fsdk completion installed to', rcFile);
  console.log('  Run "source', rcFile, '" or restart your shell to apply');
};

installCompletion();
