#!/bin/bash
# fsdk bash completion

_fsdk_completion() {
  local cur prev opts
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"

  opts="create add-page add-component add-store sync-template validate preview completion"

  case "${prev}" in
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

  COMPREPLY=($(compgen -W "${opts}" -- "${cur}"))
  return 0
}

complete -F _fsdk_completion fsdk
