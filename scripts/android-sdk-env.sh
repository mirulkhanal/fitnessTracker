#!/usr/bin/env bash
# Source from other scripts:  source "$(dirname "$0")/android-sdk-env.sh"
# Resolves ANDROID_HOME from .android-sdk.env or project .android-sdk/

_android_env_script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_android_env_project_root="$(cd "$_android_env_script_dir/.." && pwd)"

if [[ -f "$_android_env_project_root/.android-sdk.env" ]]; then
  # shellcheck disable=SC1091
  source "$_android_env_project_root/.android-sdk.env"
fi

if [[ -z "${ANDROID_HOME:-}" && -d "$_android_env_project_root/.android-sdk" ]]; then
  export ANDROID_HOME="$_android_env_project_root/.android-sdk"
  export ANDROID_SDK_ROOT="$ANDROID_HOME"
  export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
fi

unset _android_env_script_dir _android_env_project_root
