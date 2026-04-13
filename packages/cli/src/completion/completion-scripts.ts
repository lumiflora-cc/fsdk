export const BASH_COMPLETION = `#!/bin/bash
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

export const FISH_COMPLETION = `# fsdk fish completion

function __fsdk_commands
  echo "create-app\tCreate a new application"
  echo "add-page\t\tAdd a new page"
  echo "add-component\tAdd a new component"
  echo "add-store\tAdd a new store"
  echo "sync-template\tSync template files"
  echo "validate\t\tValidate configuration and templates"
  echo "preview\t\tPreview template"
  echo "completion\tGenerate shell completion script"
end

function __fsdk_create_app_opts
  echo "--template\tTemplate name (base|full)"
  echo "--package-manager\tPackage manager (npm|pnpm|yarn|bun)"
  echo "--eslint\tEnable ESLint"
  echo "--no-git\tSkip git initialization"
  echo "--no-install\tSkip dependency installation"
end

function __fsdk_add_page_opts
  echo "--router-path\tRouter path"
  echo "--page-name\tPage name"
end

function __fsdk_add_component_opts
  echo "--type\tComponent type (page|common|business)"
  echo "--name\tComponent name"
  echo "--dir\tSubdirectory"
end

function __fsdk_add_store_opts
  echo "--type\tStore type (pinia|redux)"
  echo "--name\tStore name"
end

function __fsdk_sync_template_opts
  echo "--template\tTemplate name"
  echo "--force\tForce sync"
end

function __fsdk_validate_opts
  echo "--config\tValidate config only"
  echo "--templates\tValidate templates only"
  echo "--strict\tStrict validation"
end

function __fsdk_preview_opts
  echo "--port\tPort number"
  echo "--host\tHost address"
  echo "--open\tOpen browser"
  echo "--template\tTemplate name"
end

function __fsdk_completion_opts
  echo "bash\tGenerate bash completion"
  echo "zsh\tGenerate zsh completion"
  echo "fish\tGenerate fish completion"
end

complete -c fsdk -f -a "(__fsdk_commands)"

complete -c fsdk -n "not __fish_seen_subcommand_from create-app" -a "(__fsdk_create_app_opts)" --option
complete -c fsdk -n "not __fish_seen_subcommand_from add-page" -a "(__fsdk_add_page_opts)" --option
complete -c fsdk -n "not __fish_seen_subcommand_from add-component" -a "(__fsdk_add_component_opts)" --option
complete -c fsdk -n "not __fish_seen_subcommand_from add-store" -a "(__fsdk_add_store_opts)" --option
complete -c fsdk -n "not __fish_seen_subcommand_from sync-template" -a "(__fsdk_sync_template_opts)" --option
complete -c fsdk -n "not __fish_seen_subcommand_from validate" -a "(__fsdk_validate_opts)" --option
complete -c fsdk -n "not __fish_seen_subcommand_from preview" -a "(__fsdk_preview_opts)" --option
complete -c fsdk -n "not __fish_seen_subcommand_from completion" -a "(__fsdk_completion_opts)" --option
`;

export const ZSH_COMPLETION = `#compdef fsdk

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
