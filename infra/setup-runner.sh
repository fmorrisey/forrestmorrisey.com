#!/usr/bin/env bash
#
# One-time host setup for the forrestmorrisey.com deploy pipeline on Rainier.
#
#   ./infra/setup-runner.sh
#
# Run as your normal user (needs sudo, and `gh` already authenticated).
# Idempotent: safe to re-run.
#
# Creates:
#   - a `deploy` system user that owns the web root and runs the runner
#   - /srv/www/forrestmorrisey.com, seeded from the current local build
#   - a GitHub Actions self-hosted runner at /opt/actions-runner, labelled
#     `rainier`, installed as a systemd service
#   - recreates the Caddy container to serve the new web root
#
set -euo pipefail

REPO="fmorrisey/forrestmorrisey.com"
WEB_ROOT="/srv/www/forrestmorrisey.com"
RUNNER_DIR="/opt/actions-runner"
RUNNER_USER="deploy"
INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_DIR="$(cd "$INFRA_DIR/../apps/site" && pwd)"

log() { printf '\n\033[1;32m==>\033[0m %s\n' "$1"; }

# --- preflight -------------------------------------------------------------
command -v gh >/dev/null || { echo "gh not found"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh not authenticated -- run: gh auth login"; exit 1; }
command -v rsync >/dev/null || { echo "rsync not found -- sudo apt install rsync"; exit 1; }
sudo -v

# --- 1. deploy user --------------------------------------------------------
if id "$RUNNER_USER" >/dev/null 2>&1; then
  log "user '$RUNNER_USER' already exists, skipping"
else
  log "creating '$RUNNER_USER' user"
  sudo adduser --system --group --shell /bin/bash --home "/home/$RUNNER_USER" "$RUNNER_USER"
fi

# --- 2. web root -----------------------------------------------------------
log "creating web root at $WEB_ROOT"
sudo mkdir -p "$WEB_ROOT"
sudo chown -R "$RUNNER_USER:$RUNNER_USER" "$WEB_ROOT"
sudo chmod 755 "$WEB_ROOT"

# Seed from the current local build so the site never serves an empty dir
# between the compose change and the first pipeline run.
if [ -s "$SITE_DIR/dist/index.html" ]; then
  log "seeding web root from existing local build"
  sudo rsync -a --delete "$SITE_DIR/dist/" "$WEB_ROOT/"
  sudo chown -R "$RUNNER_USER:$RUNNER_USER" "$WEB_ROOT"
else
  echo "WARNING: no local build at $SITE_DIR/dist -- web root will be empty"
  echo "         until the first pipeline run. Build with: cd apps/site && npm run build"
fi

# --- 3. runner download ----------------------------------------------------
if [ -x "$RUNNER_DIR/bin/Runner.Listener" ]; then
  log "runner already installed at $RUNNER_DIR, skipping download"
else
  RUNNER_VERSION="$(gh api repos/actions/runner/releases/latest --jq .tag_name | sed 's/^v//')"
  log "installing actions runner v$RUNNER_VERSION"
  sudo mkdir -p "$RUNNER_DIR"
  sudo chown "$RUNNER_USER:$RUNNER_USER" "$RUNNER_DIR"
  tarball="actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
  sudo -u "$RUNNER_USER" curl -fsSL -o "/tmp/$tarball" \
    "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${tarball}"
  sudo -u "$RUNNER_USER" tar xzf "/tmp/$tarball" -C "$RUNNER_DIR"
  rm -f "/tmp/$tarball"
  log "installing runner OS dependencies"
  sudo "$RUNNER_DIR/bin/installdependencies.sh"
fi

# --- 4. register -----------------------------------------------------------
if [ -f "$RUNNER_DIR/.runner" ]; then
  log "runner already registered, skipping"
else
  log "registering runner with $REPO"
  # Short-lived (1h) registration token, fetched fresh so it can't go stale.
  REG_TOKEN="$(gh api -X POST "repos/$REPO/actions/runners/registration-token" --jq .token)"
  # config.sh resolves ./bin/... relative to the working directory, so it must
  # run from the runner root or it emits spurious ldd errors.
  (cd "$RUNNER_DIR" && sudo -u "$RUNNER_USER" ./config.sh \
    --unattended --replace \
    --url "https://github.com/$REPO" \
    --token "$REG_TOKEN" \
    --name rainier \
    --labels rainier \
    --work _work)
fi

# --- 5. systemd service ----------------------------------------------------
# Check this runner's own .service marker, not `systemctl | grep actions.runner`:
# Rainier also hosts a runner for Spokerv2, and a broad match would see that
# one and silently skip installing this service.
#
# svc.sh, like config.sh, must be invoked from the runner root -- otherwise it
# fails with "Must run from runner root or install is corrupt".
if [ -f "$RUNNER_DIR/.service" ]; then
  log "runner service already installed"
else
  log "installing runner as a systemd service"
  (cd "$RUNNER_DIR" && sudo ./svc.sh install "$RUNNER_USER")
fi
(cd "$RUNNER_DIR" && sudo ./svc.sh start || true)

# --- 6. point Caddy at the new web root ------------------------------------
log "recreating Caddy container against $WEB_ROOT"
(cd "$INFRA_DIR" && docker compose up -d)

# --- 7. verify -------------------------------------------------------------
log "verifying"
sleep 3
code="$(curl -sS -o /dev/null -w '%{http_code}' --retry 5 --retry-delay 2 --retry-all-errors http://127.0.0.1:8090/ || true)"
echo "local origin:  HTTP $code"
echo "public site:   HTTP $(curl -sS -o /dev/null -w '%{http_code}' -m 15 https://forrest.rainierserver.com/ || true)"
(cd "$RUNNER_DIR" && sudo ./svc.sh status || true)

cat <<'EOF'

Done. Remaining manual step (GitHub web UI, 30 seconds):

  Settings -> Actions -> General -> Fork pull request workflows
    set "Require approval for all outside collaborators"

  This repo is PUBLIC. The deploy workflow has no pull_request trigger, so
  forks cannot reach the runner today -- this setting keeps that true if a
  PR-triggered workflow is ever added.

Then push to main (or run the workflow manually) to deploy.
EOF
