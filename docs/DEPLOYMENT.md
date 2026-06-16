# Production Deployment Guide

This guide details deploying the MT5 Trading Automation Platform in a production environment (VPS, Cloud Instances) using Docker Compose and Nginx.

---

## Deployment Architecture

In production, the backend, frontend, and database run as isolated Docker containers on a Linux host (Ubuntu 22.04 LTS VPS recommended). An Nginx reverse proxy terminates SSL (via Let's Encrypt) and routes traffic.

```
                  [ Trader Browser / MT5 Terminal ]
                                 │
                            HTTPS / WSS
                                 │
                                 ▼
                         [ Nginx Proxy ]
                       (Terminates SSL / TLS)
                       ┌─────────┴─────────┐
                       │                   │
                  Port 3000           Port 8000
                       │                   │
                       ▼                   ▼
                 [ Next.js UI ]    [ FastAPI Backend ]
                                           │
                                     Internal Net
                                           │
                                           ▼
                                    [ PostgreSQL ]
```

---

## Step 1: Server Setup

1. Connect to your VPS via SSH.
2. Install Docker and Docker Compose:
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose
   sudo systemctl enable --now docker
   ```

---

## Step 2: Clone & Configure

1. Clone your project onto the server.
2. Copy `docker-compose.yml` to the root workspace.
3. Configure environment variables in the backend settings of `docker-compose.yml` or load them via a secure `.env` file on the server.
   - **Important**: Generate a secure JWT Secret:
     ```bash
     openssl rand -hex 32
     ```
   - Update `SECRET_KEY` with the output.
   - Fill in your Telegram Bot Token and Chat ID to enable automated notifications:
     ```yaml
     TELEGRAM_BOT_TOKEN=720192812:AAH99sK812...
     TELEGRAM_CHAT_ID=55319802
     ```

---

## Step 3: Run Containers

1. Build and launch the containers in detached (background) mode:
   ```bash
   sudo docker-compose up -d --build
   ```
2. Verify all services are running cleanly:
   ```bash
   sudo docker-compose ps
   ```
3. Check the startup logs:
   ```bash
   sudo docker-compose logs -f backend
   ```
   *The backend will automatically generate the database schema tables and seed the default accounts on startup.*

---

## Step 4: Reverse Proxy & SSL Setup (Nginx)

To secure the connection (required for MT5 `WebRequest` over public networks), set up Nginx with SSL.

1. Install Nginx and Certbot:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```
2. Create an Nginx server block config `/etc/nginx/sites-available/tradingplatform`:
   ```nginx
   server {
       listen 80;
       server_name trading.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api/v1/ {
           proxy_pass http://localhost:8000/api/v1/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location /ws {
           proxy_pass http://localhost:8000/ws;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
       }
   }
   ```
3. Enable configuration and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/tradingplatform /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```
4. Obtain an SSL Certificate from Let's Encrypt:
   ```bash
   sudo certbot --nginx -d trading.yourdomain.com
   ```
   Select option to redirect all HTTP traffic to HTTPS.

---

## Step 5: MT5 Connection in Production

1. In the Web Dashboard running on production, check or create accounts to retrieve `api_token` secrets.
2. In the MT5 Terminal options, register the secure domain instead of localhost:
   `https://trading.yourdomain.com`
3. Configure the EA Inputs:
   - `InpApiBaseUrl`: `https://trading.yourdomain.com/api/v1`
   - `InpApiToken`: `<api_token>`
4. Enable Auto Trading.
