#compdef fsdk

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
      create-app)
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
