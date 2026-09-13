# Deploying to GitHub Pages

Site URL: **https://stairway.locehilios.com**

## 1. Enable GitHub Pages (required once)

The deploy workflow fails with `Failed to create deployment (status: 404)` until Pages is turned on.

1. Open [github.com/TheLocehiliosan/stairway/settings/pages](https://github.com/TheLocehiliosan/stairway/settings/pages)
2. Under **Build and deployment → Source**, choose **GitHub Actions** (not “Deploy from a branch”)
3. Save

## 2. Re-run the deployment

After enabling Pages:

1. Open [Actions](https://github.com/TheLocehiliosan/stairway/actions)
2. Select **Deploy to GitHub Pages**
3. Click **Run workflow** → **Run workflow**

Or push any commit to `main`.

## 3. Custom domain DNS

At your DNS host for `locehilios.com`:

| Name | Type | Value |
| ---- | ---- | ----- |
| `stairway` | CNAME | `TheLocehiliosan.github.io` |

Wait for DNS to propagate (minutes to a few hours).

## 4. Configure custom domain in GitHub

1. Return to [Pages settings](https://github.com/TheLocehiliosan/stairway/settings/pages)
2. Under **Custom domain**, enter `stairway.locehilios.com`
3. Enable **Enforce HTTPS** once the certificate is issued

The repo already includes `public/CNAME` so future builds keep the domain configured.

## 5. Verify

- Default Pages URL: `https://thelocehiliosan.github.io/stairway/` (until DNS propagates)
- Custom domain: `https://stairway.locehilios.com`
- Scoreboard data loads via `https://stairway-proxy.locehilios.com:8999`

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| Deploy job 404 | Enable Pages with **GitHub Actions** source (step 1) |
| Site 404 at custom domain | Check CNAME DNS and GitHub custom domain setting |
| Mixed content / no data | Proxy must use HTTPS on port 8999 |
| Wrong asset paths | Rebuild after changing `vite.config.js` `base` |
