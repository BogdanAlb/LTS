#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${HOME}/LTS"
LOG_DIR="${ROOT}/.logs"
mkdir -p "${LOG_DIR}"

KIOSK_URL="${KIOSK_URL:-http://localhost:5173}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

build_kiosk_launch_url() {
  local base_url="$1"
  local stamp
  stamp="$(date +%s)"

  if [[ "${base_url}" == *"?"* ]]; then
    printf '%s&v=%s\n' "${base_url}" "${stamp}"
  else
    printf '%s?v=%s\n' "${base_url}" "${stamp}"
  fi
}

log() {
  printf '[%s] %s\n' "$(date +'%F %T')" "$*" >> "${LOG_DIR}/kiosk.log"
}

wait_port() {
  local host="$1" port="$2" timeout="${3:-25}"
  local deadline=$((SECONDS + timeout))
  while (( SECONDS < deadline )); do
    if (exec 3<>"/dev/tcp/${host}/${port}") 2>/dev/null; then
      exec 3>&-
      return 0
    fi
    if command -v nc >/dev/null 2>&1; then
      if nc -z "${host}" "${port}" >/dev/null 2>&1; then
        return 0
      fi
    fi
    sleep 0.2
  done
  return 1
}

wait_url() {
  local url="$1" timeout="${2:-120}"
  local deadline=$((SECONDS + timeout))
  if command -v curl >/dev/null 2>&1; then
    while (( SECONDS < deadline )); do
      if curl -fsS --max-time 2 "${url}" >/dev/null 2>&1; then
        return 0
      fi
      sleep 0.5
    done
    return 1
  fi

  wait_port "127.0.0.1" "${FRONTEND_PORT}" "${timeout}"
}

if pgrep -x chromium >/dev/null 2>&1; then
  log "chromium already running; exiting"
  exit 0
fi

if ! wait_port "127.0.0.1" "${FRONTEND_PORT}" 1; then
  log "frontend not reachable on ${FRONTEND_PORT}; relying on systemd services"
fi

if ! wait_url "${KIOSK_URL}" 120; then
  log "timeout waiting for ${KIOSK_URL}; launching chromium anyway"
fi

KIOSK_LAUNCH_URL="$(build_kiosk_launch_url "${KIOSK_URL}")"

exec /usr/bin/chromium \
  --kiosk \
  --incognito \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-component-update \
  --check-for-update-interval=31536000 \
  --enable-features=UseOzonePlatform \
  --ozone-platform=wayland \
  "${KIOSK_LAUNCH_URL}"
