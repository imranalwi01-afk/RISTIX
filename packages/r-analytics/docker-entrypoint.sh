#!/bin/bash
set -euo pipefail

# This is a basic entrypoint for the R Analytics container
echo "Starting R Analytics Entrypoint..."

# Some base images export SHINY_SERVER_VERSION=latest (non-semver), which breaks compareVersion().
# Normalize this immediately so every execution path (with/without custom CMD) is safe.
if [ -n "${SHINY_SERVER_VERSION:-}" ] && ! echo "${SHINY_SERVER_VERSION}" | grep -Eq '^[0-9]+(\.[0-9]+)*$'; then
  echo "Sanitizing SHINY_SERVER_VERSION='${SHINY_SERVER_VERSION}' (unset for runtime)"
  unset SHINY_SERVER_VERSION
fi

# Resolve DB variables consistently: prefer FRS9_DB_* when provided.
if [ -n "${FRS9_DB_HOST:-}" ]; then export DB_HOST="${FRS9_DB_HOST}"; fi
if [ -n "${FRS9_DB_PORT:-}" ]; then export DB_PORT="${FRS9_DB_PORT}"; fi
if [ -n "${FRS9_DB_USER:-}" ]; then export DB_USER="${FRS9_DB_USER}"; fi
if [ -n "${FRS9_DB_PASSWORD:-}" ]; then export DB_PASSWORD="${FRS9_DB_PASSWORD}"; fi
if [ -n "${FRS9_DB_NAME:-}" ]; then export DB_NAME="${FRS9_DB_NAME}"; fi
if [ -n "${FRS9_DB_SCHEMA:-}" ]; then export DB_SCHEMA="${FRS9_DB_SCHEMA}"; fi

echo "Resolved DB target for Shiny/API:"
echo "  DB_HOST=${DB_HOST:-<unset>}"
echo "  DB_PORT=${DB_PORT:-<unset>}"
echo "  DB_NAME=${DB_NAME:-<unset>}"
echo "  DB_SCHEMA=${DB_SCHEMA:-public}"

# If a command is provided, execute it directly.
if [ $# -gt 0 ]; then
  exec "$@"
fi

echo "Preserving environment variables for R runtime..."
# Explicitly preserve connection and tenant variables so R sessions see them.
# Avoid writing under /opt/r-analytics/shiny-app because local compose mounts it read-only.
R_ENV_FILE="/tmp/r-analytics.Renviron"
env | grep -E '^(DB_|FRS9_|TENANT_|BANKING_|USER_|SHINY_|R_|LOG_)' > "${R_ENV_FILE}" || true
export R_ENVIRON_USER="${R_ENV_FILE}"

prefix_logs() {
  local prefix="$1"
  while IFS= read -r line; do
    printf '%s%s\n' "${prefix}" "${line}"
  done
}

json_escape() {
  printf '%s' "${1:-}" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\r/ /g; s/\n/ /g'
}

send_alert() {
  local event="${1:-event}"
  local component="${2:-runtime}"
  local message="${3:-}"
  local webhook_url="${R_ANALYTICS_ALERT_WEBHOOK_URL:-}"

  if [ -z "${webhook_url}" ]; then
    return 0
  fi

  local now
  now="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  local host
  host="$(hostname 2>/dev/null || echo unknown)"

  local payload
  if echo "${webhook_url}" | grep -Eqi 'discord(app)?\.com/api/webhooks/'; then
    local content
    content="[r-analytics][${component}] ${event} | ${message} | host=${host} | ts=${now}"
    payload="{\"content\":\"$(json_escape "${content}")\"}"
  else
    payload="$(cat <<EOF
{"service":"r-analytics","event":"$(json_escape "${event}")","component":"$(json_escape "${component}")","host":"$(json_escape "${host}")","timestamp":"$(json_escape "${now}")","message":"$(json_escape "${message}")"}
EOF
)"
  fi

  local timeout="${R_ANALYTICS_ALERT_WEBHOOK_TIMEOUT:-8}"
  curl -sS -m "${timeout}" \
    -X POST \
    -H "Content-Type: application/json" \
    --data-binary "${payload}" \
    "${webhook_url}" >/dev/null || true
}

DASHBOARD_PORT="${R_PORT:-4236}"
API_PORT="${R_SERVICE_PORT:-4241}"
export R_PORT="${DASHBOARD_PORT}"
export R_SERVICE_PORT="${API_PORT}"

HEALTHCHECK_INTERVAL="${R_ANALYTICS_HEALTHCHECK_INTERVAL:-20}"
HEALTHCHECK_TIMEOUT="${R_ANALYTICS_HEALTHCHECK_TIMEOUT:-5}"
HEALTHCHECK_FAILURE_THRESHOLD="${R_ANALYTICS_HEALTHCHECK_FAILURES:-3}"
STARTUP_GRACE_PERIOD="${R_ANALYTICS_STARTUP_GRACE_PERIOD:-120}"
SERVICE_STATE_DIR="/tmp/r-analytics-service-state"
mkdir -p "${SERVICE_STATE_DIR}"

# Centralized log dir for Docker visibility.
export R_ANALYTICS_LOG_DIR="${R_ANALYTICS_LOG_DIR:-/opt/r-analytics/logs}"
mkdir -p "${R_ANALYTICS_LOG_DIR}"
for log_file in "ifrs9_app.log" "ifrs9_error.log" "ifrs9_data.log" "ifrs9_model.log" "ifrs9_pd.log"; do
  > "${R_ANALYTICS_LOG_DIR}/${log_file}"
done

run_api() {
  stdbuf -oL -eL Rscript start_api.R \
    > >(prefix_logs "[R-API] ") \
    2> >(prefix_logs "[R-API] " >&2)
}

run_shiny() {
  (
    cd /opt/r-analytics/shiny-app
    export R_ANALYTICS_SHINY_APP_DIR="/opt/r-analytics/shiny-app"
    stdbuf -oL -eL Rscript -e "shiny::runApp('/opt/r-analytics/shiny-app/app44.R', host='0.0.0.0', port=as.integer(Sys.getenv('R_PORT','4236')), launch.browser=FALSE)"
  ) > >(prefix_logs "[SHINY] ") 2> >(prefix_logs "[SHINY] " >&2)
}

supervise_service() {
  local service_name="$1"
  local runner_fn="$2"
  local restart_delay=2
  local crash_count=0
  local started_at_file="${SERVICE_STATE_DIR}/${service_name}.started_at"
  local healthy_once_file="${SERVICE_STATE_DIR}/${service_name}.healthy"

  while true; do
    echo "Starting ${service_name}..."
    send_alert "service_starting" "${service_name}" "Starting ${service_name} process"
    date +%s > "${started_at_file}"
    rm -f "${healthy_once_file}"

    set +e
    "${runner_fn}"
    local exit_code=$?
    set -e

    crash_count=$((crash_count + 1))
    send_alert "service_stopped" "${service_name}" "Process exited with code ${exit_code}. restart=${crash_count}"
    echo "${service_name} stopped with exit code ${exit_code}. Restarting in ${restart_delay}s..."
    sleep "${restart_delay}"
    if [ "${restart_delay}" -lt 30 ]; then
      restart_delay=$((restart_delay * 2))
      if [ "${restart_delay}" -gt 30 ]; then
        restart_delay=30
      fi
    fi
  done
}

monitor_endpoint() {
  local service_name="$1"
  local url="$2"
  local kill_pattern="$3"
  local failures=0
  local started_at_file="${SERVICE_STATE_DIR}/${service_name}.started_at"
  local healthy_once_file="${SERVICE_STATE_DIR}/${service_name}.healthy"

  while true; do
    local now
    now="$(date +%s)"
    local started_at
    started_at="$(cat "${started_at_file}" 2>/dev/null || echo "${now}")"
    local startup_age=$((now - started_at))

    if curl -fsS -m "${HEALTHCHECK_TIMEOUT}" "${url}" >/dev/null; then
      failures=0
      touch "${healthy_once_file}"
    else
      if [ ! -f "${healthy_once_file}" ] && [ "${startup_age}" -lt "${STARTUP_GRACE_PERIOD}" ]; then
        echo "[HEALTH] ${service_name} waiting for startup grace (${startup_age}s/${STARTUP_GRACE_PERIOD}s) url=${url}"
        sleep "${HEALTHCHECK_INTERVAL}"
        continue
      fi
      failures=$((failures + 1))
      echo "[HEALTH] ${service_name} probe failed (${failures}/${HEALTHCHECK_FAILURE_THRESHOLD}) url=${url}"
      if [ "${failures}" -ge "${HEALTHCHECK_FAILURE_THRESHOLD}" ]; then
        send_alert "service_unhealthy" "${service_name}" "Health probe failed ${failures} times. Restarting process."
        pkill -f "${kill_pattern}" 2>/dev/null || true
        failures=0
      fi
    fi
    sleep "${HEALTHCHECK_INTERVAL}"
  done
}

cleanup() {
  send_alert "container_stopping" "runtime" "R Analytics container is stopping"
  kill "${API_SUPERVISOR_PID:-}" "${SHINY_SUPERVISOR_PID:-}" "${SHINY_MONITOR_PID:-}" "${API_MONITOR_PID:-}" "${LOG_TAIL_PID:-}" 2>/dev/null || true
  wait "${API_SUPERVISOR_PID:-}" "${SHINY_SUPERVISOR_PID:-}" "${SHINY_MONITOR_PID:-}" "${API_MONITOR_PID:-}" "${LOG_TAIL_PID:-}" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

# Forward file-based app logs to Docker stdout for easy diagnostics.
tail -n +1 -F \
  "${R_ANALYTICS_LOG_DIR}/ifrs9_app.log" \
  "${R_ANALYTICS_LOG_DIR}/ifrs9_error.log" \
  "${R_ANALYTICS_LOG_DIR}/ifrs9_data.log" \
  "${R_ANALYTICS_LOG_DIR}/ifrs9_model.log" \
  "${R_ANALYTICS_LOG_DIR}/ifrs9_pd.log" 2>/dev/null | prefix_logs "[R-LOG] " &
LOG_TAIL_PID=$!

supervise_service "api" run_api &
API_SUPERVISOR_PID=$!

supervise_service "shiny" run_shiny &
SHINY_SUPERVISOR_PID=$!

monitor_endpoint "api" "http://127.0.0.1:${API_PORT}/health" "Rscript start_api.R" &
API_MONITOR_PID=$!

monitor_endpoint "shiny" "http://127.0.0.1:${DASHBOARD_PORT}/" "shiny::runApp('/opt/r-analytics/shiny-app/app44.R'" &
SHINY_MONITOR_PID=$!

send_alert "container_started" "runtime" "R Analytics container started. dashboard_port=${DASHBOARD_PORT} api_port=${API_PORT}"

# Keep PID 1 alive while supervisors run.
wait -n "${API_SUPERVISOR_PID}" "${SHINY_SUPERVISOR_PID}" "${SHINY_MONITOR_PID}" "${API_MONITOR_PID}" "${LOG_TAIL_PID}"
exit_code=$?
echo "A supervisor process exited unexpectedly with code ${exit_code}."
send_alert "container_supervisor_exit" "runtime" "Supervisor process exited with code ${exit_code}"
exit "${exit_code}"
