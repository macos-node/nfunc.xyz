#!/bin/bash
# deploy.sh — build and push nfunc.xyz
set -e
cd "$(dirname "${BASH_SOURCE[0]}")"
SERVER="nfunc.xyz"   # a Host alias in ~/.ssh/config, the same name on every machine

npm ci --silent
rm -rf .svelte-kit build
npm run build
[ -f build/404.html ] || { echo "❌ build/404.html missing"; exit 1; }

# The webroot is owned by the deploy user, so no sudo is needed. nginx only
# reads, so force world-readable modes rather than copying local permissions.
rsync -rlptvz --delete --chmod=D755,F644 build/ "$SERVER:/var/www/nfunc.xyz/"
echo "✅ https://nfunc.xyz"
