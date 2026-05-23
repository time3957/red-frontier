# deploy.ps1 — Deploy Red Frontier to Remote Server
# Builds client, packages server, uploads via SCP, and restarts via PM2

$ErrorActionPreference = "Stop"

# 1. Build Client
Write-Host "Building React Client..." -ForegroundColor Cyan
Push-Location client
npm run build
Pop-Location

# 2. Create Temp Dir for packaging
Write-Host "Creating packaging directory..." -ForegroundColor Cyan
$tempDir = "D:\GProject\temp-deploy"
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path "$tempDir\server" -Force | Out-Null

# 3. Copy necessary files (excl. node_modules)
Write-Host "Copying files to package..." -ForegroundColor Cyan
Copy-Item -Path "server\src" -Destination "$tempDir\server\src" -Recurse -Force
Copy-Item -Path "server\public" -Destination "$tempDir\server\public" -Recurse -Force
Copy-Item -Path "server\package.json" -Destination "$tempDir\server\package.json" -Force
Copy-Item -Path "server\package-lock.json" -Destination "$tempDir\server\package-lock.json" -Force
Copy-Item -Path "server\.env" -Destination "$tempDir\server\.env" -Force

# 4. Zip the files
Write-Host "Creating zip archive..." -ForegroundColor Cyan
$zipFile = "D:\GProject\deploy.zip"
if (Test-Path $zipFile) {
    Remove-Item -Path $zipFile -Force
}
Compress-Archive -Path "$tempDir\server" -DestinationPath $zipFile

# Clean up local temp folder
Remove-Item -Path $tempDir -Recurse -Force

# 5. Upload zip via SCP
Write-Host "Uploading package to remote server via SCP..." -ForegroundColor Cyan
scp $zipFile "admin_es@119.59.99.192:/home/admin_es/deploy.zip"

# Clean up local zip
Remove-Item -Path $zipFile -Force

# 6. Extract and run PM2 commands on Remote Linux Server
Write-Host "Deploying and restarting PM2 process on remote server..." -ForegroundColor Cyan
ssh admin_es@119.59.99.192 @"
  mkdir -p /home/admin_es/red-frontier
  cd /home/admin_es
  unzip -o deploy.zip -d /home/admin_es/red-frontier
  rm deploy.zip
  cd /home/admin_es/red-frontier/server
  npm install --omit=dev
  pm2 delete red-frontier-server 2>/dev/null || true
  pm2 start src/index.js --name \"red-frontier-server\"
  pm2 save
"@

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🎮 Red Frontier is online at http://119.59.99.192:5003" -ForegroundColor Green
