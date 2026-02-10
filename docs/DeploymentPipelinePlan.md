# Deployment Pipeline Plan — forrestmorrisey.com (Self-Hosted, Similar to Your Spoker Pattern)

You already have the hard part: a stable host (Rainier) + Cloudflare Tunnel.  
For the personal site, the clean “Spoker-like” move is:

- **GitHub Actions builds the static site**
- **GitHub Actions ships `/apps/site/dist` to Rainier over SSH**
- **Rainier serves it via Caddy (or Nginx)**
- **Cloudflared routes `forrestmorrisey.com` → local port**

This gives you: *push to main = site updates*.

---

## 1) Rainier: One-time Server Setup

### A) Create a deploy user (least privilege)
```bash
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG docker deploy
````

### B) Create a web root for the built site

Pick a canonical path that won’t move:

```bash
sudo mkdir -p /srv/www/forrestmorrisey.com
sudo chown -R deploy:deploy /srv/www/forrestmorrisey.com
```

### C) Update your Caddy container to serve that folder

If you already have `infra/caddy/Caddyfile`, change its root mount to `/srv/www/forrestmorrisey.com` (host path) and serve it on a unique port (example: **8090**).

Example compose (conceptually):

* host folder: `/srv/www/forrestmorrisey.com`
* container folder: `/srv`
* Caddy listens on `:8090`
* cloudflared ingress routes hostname to `http://localhost:8090`

(You can keep your current “single tunnel / many hostnames” config style.)

---

## 2) GitHub: Secrets + SSH

### A) Add repo secrets (Settings → Secrets and variables → Actions)

* `RAINIER_SSH_HOST` = your reachable host (or Tailscale IP if that’s what you use)
* `RAINIER_SSH_USER` = `deploy`
* `RAINIER_SSH_KEY` = private key (ed25519)
* `RAINIER_SSH_PORT` = `22` (or custom)
* `RAINIER_WEB_ROOT` = `/srv/www/forrestmorrisey.com`

### B) Add public key to Rainier

On Rainier:

```bash
sudo -u deploy mkdir -p /home/deploy/.ssh
sudo -u deploy chmod 700 /home/deploy/.ssh
sudo -u deploy tee -a /home/deploy/.ssh/authorized_keys >/dev/null <<'EOF'
<PASTE_PUBLIC_KEY_HERE>
EOF
sudo -u deploy chmod 600 /home/deploy/.ssh/authorized_keys
```

---

## 3) GitHub Actions Workflow (Build + Deploy)

Create: `.github/workflows/deploy.yml`

```yaml
name: Build & Deploy (forrestmorrisey.com)

on:
  push:
    branches: [ "main" ]
  workflow_dispatch:

concurrency:
  group: forrest-site-deploy
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/site

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: apps/site/package-lock.json

      - name: Install
        run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Build
        run: npm run build

      - name: Upload dist artifact
        uses: actions/upload-artifact@v4
        with:
          name: site-dist
          path: apps/site/dist

  deploy:
    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: Download dist artifact
        uses: actions/download-artifact@v4
        with:
          name: site-dist
          path: dist

      - name: Setup SSH key
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.RAINIER_SSH_KEY }}

      - name: Add host to known_hosts
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -p "${{ secrets.RAINIER_SSH_PORT }}" "${{ secrets.RAINIER_SSH_HOST }}" >> ~/.ssh/known_hosts

      - name: Deploy dist to Rainier (atomic-ish)
        run: |
          set -euo pipefail
          RELEASE_DIR="${{ secrets.RAINIER_WEB_ROOT }}.releases/$(date +%Y%m%d%H%M%S)"
          ssh -p "${{ secrets.RAINIER_SSH_PORT }}" "${{ secrets.RAINIER_SSH_USER }}@${{ secrets.RAINIER_SSH_HOST }}" "mkdir -p '$RELEASE_DIR' '${{ secrets.RAINIER_WEB_ROOT }}.releases'"

          rsync -az --delete \
            -e "ssh -p ${{ secrets.RAINIER_SSH_PORT }}" \
            ./dist/ "${{ secrets.RAINIER_SSH_USER }}@${{ secrets.RAINIER_SSH_HOST }}:$RELEASE_DIR/"

          ssh -p "${{ secrets.RAINIER_SSH_PORT }}" "${{ secrets.RAINIER_SSH_USER }}@${{ secrets.RAINIER_SSH_HOST }}" "\
            ln -sfn '$RELEASE_DIR' '${{ secrets.RAINIER_WEB_ROOT }}.current' && \
            rsync -a --delete '${{ secrets.RAINIER_WEB_ROOT }}.current/' '${{ secrets.RAINIER_WEB_ROOT }}/' \
          "

      - name: (Optional) Reload Caddy container
        run: |
          ssh -p "${{ secrets.RAINIER_SSH_PORT }}" "${{ secrets.RAINIER_SSH_USER }}@${{ secrets.RAINIER_SSH_HOST }}" "\
            cd /home/fmorrisey/code/forrestmorrisey.com/infra && \
            docker compose exec -T site caddy reload --config /etc/caddy/Caddyfile || true \
          "
```

Notes:

* The deploy uses a timestamped “release dir” then syncs into the live web root. It’s simple and resilient.
* The optional reload step is only needed if Caddy config changes; static file updates don’t require reload.

---

## 4) Cloudflared Ingress Addition (from your current config)

Add these lines and keep everything else the same:

```yaml
  - hostname: forrestmorrisey.com
    service: http://localhost:8090
  - hostname: www.forrestmorrisey.com
    service: http://localhost:8090
```

---

## 5) Minimal “Pseudo-Prod” Operating Rules

* **Only deploy from `main`**
* **Build must succeed before deploy**
* **One deploy at a time** (concurrency)
* **Static assets cached hard** (Caddy headers)
* **No runtime app servers** needed (fast, low failure surface)

---

## 6) What This Looks Like To Hiring Managers

* repo shows: CI + deploy automation
* infra is explicit (Tunnel + Caddy + dist)
* content edits are visible PRs
* production updates are deterministic and boring

---
