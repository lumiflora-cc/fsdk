import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/index.js';

export type ShellType = 'bash' | 'zsh' | 'fish';

export interface CompletionOptions {
  shell?: ShellType;
  output?: string;
}

const BASH_COMPLETION = `#!/bin/bash
# fsdk bash completion

_fsdk_completion() {
  local cur prev opts
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"

  opts="create-app add-page add-component add-store sync-template validate preview completion"

  case "\${prev}" in
    create-app)
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

complete -F _fsdk_completion fsdk
`;

const ZSH_COMPLETION = `#compdef fsdk

local -a commands
commands=(
  'create-app:Create a new application'
  'add-page:Add a new page'
  'add-component:Add a new component'
  'add-store:Add a new store'
  'sync-template:Sync template files'
  'validate:Validate configuration and templates'
  'preview:Preview template'
  'completion:Generate shell completion script'
)

_arguments -C \\
  '1: :->command' \\
  '2: :->args' \\
  '*: :->rest'

case "$state" in
  command)
    _describe 'command' commands
    ;;
  args)
    case $words[1] in
      create-app)
        _arguments -s \\
          '--template[Template name]' \\
          '--package-manager[Package manager: npm|pnpm|yarn|bun]' \\
          '--eslint[Enable ESLint]' \\
          '--no-git[Skip git initialization]' \\
          '--no-install[Skip dependency installation]'
        ;;
      add-page)
        _arguments -s \\
          '--router-path[Router path]' \\
          '--page-name[Page name]'
        ;;
      add-component)
        _arguments -s \\
          '--type[Component type: page|common|business]' \\
          '--name[Component name]' \\
          '--dir[Subdirectory]'
        ;;
      add-store)
        _arguments -s \\
          '--type[Store type: pinia|redux]' \\
          '--name[Store name]'
        ;;
      sync-template)
        _arguments -s \\
          '--template[Template name]' \\
          '--force[Force sync]'
        ;;
      validate)
        _arguments -s \\
          '--config[Validate config only]' \\
          '--templates[Validate templates only]' \\
          '--strict[Strict validation]'
        ;;
      preview)
        _arguments -s \\
          '--port[Port number]' \\
          '--host[Host address]' \\
          '--open[Open browser]' \\
          '--template[Template name]'
        ;;
      completion)
        _arguments -s \\
          'bash:Generate bash completion' \\
          'zsh:Generate zsh completion' \\
          'fish:Generate fish completion'
        ;;
    esac
    ;;
esac
`;

const FISH_COMPLETION = `# fish completion for fsdk

complete -c fsdk -n '__fish_use_subcommand' -a 'create-app' -d 'Create a new application'
complete -c fsdk -n '__fish_use_subcommand' -a 'add-page' -d 'Add a new page'
complete -c fsdk -n '__fish_use_subcommand' -a 'add-component' -d 'Add a new component'
complete -c fsdk -n '__fish_use_subcommand' -a 'add-store' -d 'Add a new store'
complete -c fsdk -n '__fish_use_subcommand' -a 'sync-template' -d 'Sync template files'
complete -c fsdk -n '__fish_use_subcommand' -a 'validate' -d 'Validate configuration and templates'
complete -c fsdk -n '__fish_use_subcommand' -a 'preview' -d 'Preview template'
complete -c fsdk -n '__fish_use_subcommand' -a 'completion' -d 'Generate shell completion script'

# create-app options
complete -c fsdk -n '__fish_seen_subcommand_from create-app' -l template -d 'Template name'
complete -c fsdk -n '__fish_seen_subcommand_from create-app' -l package-manager -d 'Package manager' -a 'npm pnpm yarn bun'
complete -c fsdk -n '__fish_seen_subcommand_from create-app' -l eslint -d 'Enable ESLint'
complete -c fsdk -n '__fish_seen_subcommand_from create-app' -l no-git -d 'Skip git initialization'
complete -c fsdk -n '__fish_seen_subcommand_from create-app' -l no-install -d 'Skip dependency installation'

# add-page options
complete -c fsdk -n '__fish_seen_subcommand_from add-page' -l router-path -d 'Router path'
complete -c fsdk -n '__fish_seen_subcommand_from add-page' -l page-name -d 'Page name'

# add-component options
complete -c fsdk -n '__fish_seen_subcommand_from add-component' -l type -d 'Component type' -a 'page common business'
complete -c fsdk -n '__fish_seen_subcommand_from add-component' -l name -d 'Component name'
complete -c fsdk -n '__fish_seen_subcommand_from add-component' -l dir -d 'Subdirectory'

# add-store options
complete -c fsdk -n '__fish_seen_subcommand_from add-store' -l type -d 'Store type' -a 'pinia redux'
complete -c fsdk -n '__fish_seen_subcommand_from add-store' -l name -d 'Store name'

# sync-template options
complete -c fsdk -n '__fish_seen_subcommand_from sync-template' -l template -d 'Template name'
complete -c fsdk -n '__fish_seen_subcommand_from sync-template' -l force -d 'Force sync'

# validate options
complete -c fsdk -n '__fish_seen_subcommand_from validate' -l config -d 'Validate config only'
complete -c fsdk -n '__fish_seen_subcommand_from validate' -l templates -d 'Validate templates only'
complete -c fsdk -n '__fish_seen_subcommand_from validate' -l strict -d 'Strict validation'

# preview options
complete -c fsdk -n '__fish_seen_subcommand_from preview' -l port -d 'Port number'
complete -c fsdk -n '__fish_seen_subcommand_from preview' -l host -d 'Host address'
complete -c fsdk -n '__fish_seen_subcommand_from preview' -l open -d 'Open browser'
complete -c fsdk -n '__fish_seen_subcommand_from preview' -l template -d 'Template name'
`;

export async function generateCompletion(options: CompletionOptions = {}): Promise<void> {
  const shell = options.shell || detectShell();
  const outputPath = options.output || getDefaultOutputPath(shell);

  try {
    const content = getCompletionScript(shell);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, content, 'utf-8');

    if (shell === 'bash') {
      fs.chmodSync(outputPath, 0o755);
    }

    logger.success(`Completion script for ${shell} generated at ${outputPath}`);

    if (shell !== 'fish') {
      logger.info(`Add the following line to your shell configuration:`);
      logger.info(`  source ${outputPath}`);
    } else {
      logger.info(`Add the following line to your fish config:`);
      logger.info(`  source ${outputPath}`);
    }
  } catch (error) {
    logger.error('Failed to generate completion script:', error);
    throw error;
  }
}

function detectShell(): ShellType {
  const shell = process.env.SHELL || '';
  if (shell.includes('zsh')) return 'zsh';
  if (shell.includes('fish')) return 'fish';
  return 'bash';
}

function getDefaultOutputPath(shell: ShellType): string {
  const home = process.env.HOME || process.env.USERPROFILE || '';
  switch (shell) {
    case 'bash':
      return path.resolve(home, '.fsdk-completion.bash');
    case 'zsh':
      return path.resolve(home, '.fsdk-completion.zsh');
    case 'fish':
      return path.resolve(home, '.config', 'fish', 'completions', 'fsdk.fish');
  }
}

function getCompletionScript(shell: ShellType): string {
  switch (shell) {
    case 'bash':
      return BASH_COMPLETION;
    case 'zsh':
      return ZSH_COMPLETION;
    case 'fish':
      return FISH_COMPLETION;
  }
}
