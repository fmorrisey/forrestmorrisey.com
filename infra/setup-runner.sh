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
#
# Only when the web root is empty. Re-running this script later from a stale
# working copy must not rsync --delete an old build over live content that the
# pipeline has since published.
if [ -s "$WEB_ROOT/index.html" ]; then
  log "web root already populated, leaving it alone"
elif [ -s "$SITE_DIR/dist/index.html" ]; then
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
  # Stage inside the runner dir, not /tmp. The download runs as $RUNNER_USER,
  # and /tmp is sticky-bit, so removing it afterwards as the invoking user
  # fails with EPERM -- which `rm -f` does not suppress and `set -e` turns into
  # an abort partway through the install.
  sudo -u "$RUNNER_USER" curl -fsSL -o "$RUNNER_DIR/$tarball" \
    "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${tarball}"
  sudo -u "$RUNNER_USER" tar xzf "$RUNNER_DIR/$tarball" -C "$RUNNER_DIR"
  sudo -u "$RUNNER_USER" rm -f "$RUNNER_DIR/$tarball"
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
# Not `|| true`: if the service will not start there is nothing to deploy to,
# and the operator needs to see that now rather than after pushing to main and
# watching a job queue forever.
(cd "$RUNNER_DIR" && sudo ./svc.sh start)

# --- 6. point Caddy at the new web root ------------------------------------
log "recreating Caddy container against $WEB_ROOT"
# --remove-orphans clears the retired forrest-site-tunnel container. Left
# running it would be a second cloudflared connector for the same hostname,
# pointed at the old :8080 origin, causing intermittent 502s.
(cd "$INFRA_DIR" && docker compose up -d --remove-orphans)

# --- 7. verify -------------------------------------------------------------
log "verifying"
sleep 3
code="$(curl -sS -o /dev/null -w '%{http_code}' --retry 5 --retry-delay 2 --retry-all-errors http://127.0.0.1:8090/ || true)"
echo "local origin:  HTTP $code"
# The origin is the one thing this script is responsible for. Fail loudly
# rather than printing "Done." over a broken serve.
if [ "$code" != "200" ]; then
  echo "ERROR: origin is not serving (expected 200, got ${code:-no response})" >&2
  exit 1
fi
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
