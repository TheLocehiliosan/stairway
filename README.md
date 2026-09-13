# Stairway to Ascension

NetHack ascension progress tracker and next-game goal suggester.

## Development stages

| Stage | Status | What to review |
| ----- | ------ | -------------- |
| 1 | Done | Shell UI, dark theme, player lookup (`?player=`), localStorage, scoreboard link |
| 2 | Done | Fetch scoreboard via self-hosted proxy; ascension count + summary bars |
| 3 | Done | Detail grids (roles, alignments, races, conducts, wiki-style combo grid) |
| 4 | Done | Goal suggester with wiki links (roles first, then random among other missing goals) |
| 5 | Planned | GitHub Pages deploy polish |

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

Try:

- Default player: `TheLocehiliosan`
- URL param: `?player=YourName` (case-sensitive)
- Search box updates the URL and remembers the last player in localStorage

## Domains

| Service | URL |
| ------- | --- |
| Site (GitHub Pages) | `https://stairway.locehilios.com` |
| Scoreboard proxy (VPS) | `https://stairway-proxy.locehilios.com:8999` |

`public/CNAME` is set for the custom GitHub Pages domain. See [proxy/README.md](proxy/README.md) for VPS setup with `uv`, systemd, and Caddy on AlmaLinux 9.

### DNS

| Host | Type | Value |
| ---- | ---- | ----- |
| `stairway.locehilios.com` | CNAME | `<your-github-username>.github.io` |
| `stairway-proxy.locehilios.com` | A | Your VPS public IP |

Configure the custom domain in your GitHub repo under **Settings → Pages**.

**First-time deploy:** Pages must use **GitHub Actions** as the source or the deploy job fails with a 404. See [docs/DEPLOY.md](docs/DEPLOY.md).

## Scoreboard data / CORS

The scoreboard does not send CORS headers. Fetch order:

1. **Dev:** Vite proxy (`/scoreboard/...`)
2. **Prod:** Self-hosted proxy at `stairway-proxy.locehilios.com:8999`
3. **Fallback:** Public CORS proxies (`allorigins`, `corsproxy.io`)
4. **Last resort:** Direct fetch

The proxy must use **HTTPS** on port 8999 (GitHub Pages is HTTPS; plain HTTP would be blocked as mixed content). See `proxy/Caddyfile.example`.

The blue status banner shows which source succeeded.

## Build

```bash
npm run build
npm run preview
```
