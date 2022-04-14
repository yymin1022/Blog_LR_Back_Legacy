echo "=== Stopping Current Service ==="
pm2 stop app.js

echo "=== Updating to Latest Source ==="
git pull origin master

echo "=== Updating Dependencies ==="
npm install

echo "=== Restarting Service ==="
pm2 start app.js