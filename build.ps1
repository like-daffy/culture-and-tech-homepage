# Build script for static export (Windows PowerShell)

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host "Building static export..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build complete. Upload the contents of the 'out/' folder to your web host." -ForegroundColor Green
} else {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}
