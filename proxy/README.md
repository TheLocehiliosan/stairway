# Stairway Proxy

Python CORS proxy for [nethackscoreboard.org](https://nethackscoreboard.org) player pages.

The static site at `https://stairway.locehilios.com` calls this service because the scoreboard does not send CORS headers.

## Endpoints

| Path | Description |
| ---- | ----------- |
| `GET /health` | Health check |
| `GET /players/{letter}/{username}.nh.html` | Proxied player page |

Example:

```text
https://stairway-proxy.locehilios.com:8999/players/T/TheLocehiliosan.nh.html
```

## HTTPS requirement

`stairway.locehilios.com` is served over HTTPS (GitHub Pages). Browsers block HTTPS pages from calling plain HTTP APIs (**mixed content**), so the proxy must be reachable at **`https://stairway-proxy.locehilios.com:8999`**.

Recommended layout:

- **uvicorn** listens on `127.0.0.1:8998` (see `stairway-proxy.service`)
- **Caddy** terminates TLS on `0.0.0.0:8999` and reverse-proxies to uvicorn (see `Caddyfile.example`)

## AlmaLinux 9 setup

### 1. DNS

| Host | Type | Value |
| ---- | ---- | ----- |
| `stairway-proxy.locehilios.com` | A | Your VPS public IP |

### 2. Firewall

```bash
sudo firewall-cmd --permanent --add-port=8999/tcp
sudo firewall-cmd --reload
```

### 3. Install uv and deploy app

```bash
sudo useradd --system --home /opt/stairway-proxy --shell /sbin/nologin stairway
sudo mkdir -p /opt/stairway-proxy
sudo cp app.py requirements.txt /opt/stairway-proxy/
sudo chown -R stairway:stairway /opt/stairway-proxy

sudo -u stairway bash -c '
  cd /opt/stairway-proxy
  uv venv .venv
  uv pip install -r requirements.txt
'
```

### 4. systemd

```bash
sudo cp stairway-proxy.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now stairway-proxy
sudo systemctl status stairway-proxy
```

Test locally on the VPS:

```bash
curl -s http://127.0.0.1:8998/health
curl -s http://127.0.0.1:8998/players/T/TheLocehiliosan.nh.html | head
```

### 5. Caddy (TLS on port 8999)

```bash
sudo dnf install -y caddy
sudo cp Caddyfile.example /etc/caddy/Caddyfile
sudo systemctl enable --now caddy
```

Caddy obtains a Let's Encrypt certificate automatically once DNS points at the VPS.

Test from your laptop:

```bash
curl -s https://stairway-proxy.locehilios.com:8999/health
```

### Environment variables

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `ALLOWED_ORIGINS` | `https://stairway.locehilios.com,...` | CORS allowlist |
| `SCOREBOARD_BASE` | `https://nethackscoreboard.org` | Upstream host |
| `FETCH_TIMEOUT` | `20` | Upstream timeout (seconds) |

## Security

- Only `/players/{letter}/{username}.nh.html` is proxied
- Usernames are validated (alphanumeric, `_`, `-`)
- Path letter must match the first character of the username
- No generic open-proxy behaviour
