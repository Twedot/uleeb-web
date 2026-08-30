# uleeb-web

The marketing/landing page for [uleeb](https://github.com/Twedot/uleeb) — a
Nigeria-first rental marketplace, built by Twedot. Plain Vite + React static
site, deployed to `uleeb.twedot.com`.

## Stack

Deliberately mirrors [twedot-site](../prod-twedot-web)'s own stack (Vite +
React, no framework/SSR) — same conventions, same kind of deploy, just a
single landing page instead of a multi-route site.

## Deploy

Pushing to `main` builds the site and deploys it to the same EC2 box as
`uleeb-api`/`twedot-backend` (see `.github/workflows/deploy.yml`), served by
its own nginx site config (`nginx.conf`, synced to
`/etc/nginx/sites-available/uleeb-web` — never touches the other services'
own nginx configs).

### One-time setup before the first deploy works end-to-end

1. **DNS**: point `uleeb.twedot.com` at the same EC2 host `uleebapi.twedot.com`
   already resolves to (A record, or CNAME if that's how the others are set up).
2. **Repo secrets** (`Twedot/uleeb-web` → Settings → Secrets): `EC2_HOST`,
   `EC2_USER`, `EC2_SSH_KEY` — same values already set on `uleeb-api`'s repo.
3. **TLS cert**: the first deploy will run before a cert exists for
   `uleeb.twedot.com`, so `nginx -t` fails and the workflow just skips the
   reload (logged, not fatal — see the workflow's comment). Once DNS has
   propagated, SSH in and run:
   ```
   sudo certbot --nginx -d uleeb.twedot.com
   ```
   Then either re-run the workflow or `sudo systemctl reload nginx` by hand.

`nginx.conf` assumes the deploy user's home directory is `/home/ubuntu` (the
standard AWS Ubuntu AMI default) — adjust `root` in `nginx.conf` if
`EC2_USER` on this box isn't `ubuntu`.

## Local development

```
npm install
npm run dev
```
