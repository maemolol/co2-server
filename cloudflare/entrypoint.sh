#!/bin/sh
set -e

echo "Starting Cloudflare Quick Tunnel..."
cloudflared tunnel --no-autoupdate --url http://frontend:80
