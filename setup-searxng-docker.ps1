# Docker SearXNG Setup Script for Windows
# Run this script in PowerShell as Administrator

Write-Host "🐳 Setting up Docker SearXNG Private Instance" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker not found. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker is installed" -ForegroundColor Green

# Create configuration directory
$configDir = "$env:USERPROFILE\searxng-config"
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force
    Write-Host "✅ Created configuration directory: $configDir" -ForegroundColor Green
} else {
    Write-Host "✅ Configuration directory already exists: $configDir" -ForegroundColor Green
}

# Stop existing container if running
$existingContainer = docker ps -q -f name=searxng-private
if ($existingContainer) {
    Write-Host "🔄 Stopping existing container..." -ForegroundColor Yellow
    docker stop searxng-private
    docker rm searxng-private
    Write-Host "✅ Existing container removed" -ForegroundColor Green
}

# Pull latest SearXNG image
Write-Host "📥 Pulling latest SearXNG image..." -ForegroundColor Yellow
docker pull searxng/searxng:latest
Write-Host "✅ SearXNG image pulled successfully" -ForegroundColor Green

# Run new container
Write-Host "🚀 Starting SearXNG container..." -ForegroundColor Yellow
docker run -d `
  --name=searxng-private `
  -p 8080:8080 `
  -v "${configDir}:/etc/searxng" `
  -e "BASE_URL=http://localhost:8080/" `
  -e "INSTANCE_NAME=my-private-searxng" `
  --restart always `
  searxng/searxng:latest

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SearXNG container started successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start SearXNG container" -ForegroundColor Red
    exit 1
}

# Wait for container to start
Write-Host "⏳ Waiting for container to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test container
Write-Host "🧪 Testing container..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 30 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ SearXNG is accessible at http://localhost:8080" -ForegroundColor Green
    } else {
        Write-Host "❌ SearXNG returned unexpected status code: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to connect to SearXNG: $($_.Exception.Message)" -ForegroundColor Red
}

# Show container status
Write-Host "`n📊 Container Status:" -ForegroundColor Cyan
docker ps -f name=searxng-private

# Show logs
Write-Host "`n📋 Recent Logs:" -ForegroundColor Cyan
docker logs --tail 10 searxng-private

Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Visit http://localhost:8080 to verify SearXNG is working" -ForegroundColor White
Write-Host "2. Configure authentication in settings.yml if needed" -ForegroundColor White
Write-Host "3. Add private instance to Claude Code CLI:" -ForegroundColor White
Write-Host "   claude mcp add searxng-private --scope user --env SEARXNG_URL=http://localhost:8080 -- npx -y mcp-searxng" -ForegroundColor White

Write-Host "`n🎉 Setup completed successfully!" -ForegroundColor Green