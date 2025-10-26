#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${HOME}/LTS"
BACKEND_DIR="${ROOT}/backend"
FRONTEND_DIR="${ROOT}/frontend"
VENV_DIR="${BACKEND_DIR}/venv"
LOG_DIR="${ROOT}/.logs"

# Config port/host
BACKEND_BIND_HOST="0.0.0.0"
BACKEND_LINK_HOST="localhost"
BACKEND_PORT=8000

FRONTEND_BIND_HOST="0.0.0.0"
FRONTEND_LINK_HOST="localhost"
FRONTEND_PORT=5173

mkdir -p "$LOG_DIR"

# Cleanup la ieșire
cleanup() {
  [[ -n "${BACK_PID:-}"  ]] && kill "$BACK_PID"  2>/dev/null || true
  [[ -n "${FRONT_PID:-}" ]] && kill "$FRONT_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Funcție de așteptare pentru port (TCP)
wait_port() {
  local host="$1" port="$2" timeout="${3:-25}"
  local deadline=$((SECONDS + timeout))
  while (( SECONDS < deadline )); do
    if (exec 3<>"/dev/tcp/${host}/${port}") 2>/dev/null; then
      exec 3>&-
      return 0
    fi
    # fallback la nc, dacă există
    if command -v nc >/dev/null 2>&1; then
      if nc -z "${host}" "${port}" >/dev/null 2>&1; then
        return 0
      fi
    fi
    sleep 0.2
  done
  return 1
}

# IP LAN (dacă există), pentru link-uri din aceeași rețea
LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"

# Pornește backend-ul (cu venv)
(
  cd "$BACKEND_DIR"
  if [[ ! -f "${VENV_DIR}/bin/activate" ]]; then
    echo "Eroare: nu găsesc venv la ${VENV_DIR}. Creează-l sau corectează calea." >&2
    exit 1
  fi
  source "${VENV_DIR}/bin/activate"
  exec uvicorn app:app --host "${BACKEND_BIND_HOST}" --port "${BACKEND_PORT}"
) > "${LOG_DIR}/backend.log" 2>&1 &
BACK_PID=$!

# Pornește frontend-ul (Vite) pe port fix (strict)
(
  cd "$FRONTEND_DIR"
  # --strictPort => eșuează dacă portul e ocupat, nu schimbă automat
  exec npm run dev -- --host "${FRONTEND_BIND_HOST}" --port "${FRONTEND_PORT}" --strictPort
) > "${LOG_DIR}/frontend.log" 2>&1 &
FRONT_PID=$!

echo "⏳ Pornesc serviciile..."
# Așteaptă porturile
if wait_port "127.0.0.1" "${BACKEND_PORT}" 25; then
  echo "✅ Backend UP — log: ${LOG_DIR}/backend.log"
else
  echo "❌ Backend NU a pornit în timp util. Verifică ${LOG_DIR}/backend.log"
fi

if wait_port "127.0.0.1" "${FRONTEND_PORT}" 35; then
  echo "✅ Frontend UP — log: ${LOG_DIR}/frontend.log"
else
  echo "❌ Frontend NU a pornit în timp util. Verifică ${LOG_DIR}/frontend.log"
fi

# Afișează link-urile dacă ambele rulează
if ps -p "${BACK_PID}" >/dev/null 2>&1 && ps -p "${FRONT_PID}" >/dev/null 2>&1; then
  echo
  echo "🌐 Link-uri:"
  echo "   Backend:  http://${BACKEND_LINK_HOST}:${BACKEND_PORT}"
  [[ -n "${LAN_IP}" ]] && echo "            (LAN) http://${LAN_IP}:${BACKEND_PORT}"
  echo "   Frontend: http://${FRONTEND_LINK_HOST}:${FRONTEND_PORT}"
  [[ -n "${LAN_IP}" ]] && echo "            (LAN) http://${LAN_IP}:${FRONTEND_PORT}"
  echo
else
  echo "⚠️  Un serviciu nu rulează. Verifică log-urile."
fi

echo "ℹ️  Apasă Ctrl+C aici ca să oprești ambele procese."
# Ține scriptul deschis până când cade unul
wait -n "$BACK_PID" "$FRONT_PID" || true