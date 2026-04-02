# Build script for static export (Windows PowerShell)

$basePath = Read-Host "Enter basePath (e.g. staging-culture), or press Enter for root"
$configFile = Join-Path $PSScriptRoot "next.config.mjs"
$content = Get-Content $configFile -Raw

if ($basePath) {
    $replacement = "output: `"export`",`n  basePath: `"/$basePath`","
    Write-Host "Setting basePath to /$basePath" -ForegroundColor Yellow
} else {
    $replacement = "output: `"export`","
    Write-Host "No basePath set (root deployment)" -ForegroundColor Yellow
}

$content = $content -replace 'output: "export",\r?\n  // basePath is managed by build scripts', $replacement
$content = $content -replace 'output: "export",\r?\n  basePath: "[^"]*",', $replacement
Set-Content $configFile $content -NoNewline

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host "Building static export..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    if ($basePath) {
        Write-Host "Build complete. Upload the contents of 'out/' to your web host under /$basePath/" -ForegroundColor Green
    } else {
        Write-Host "Build complete. Upload the contents of 'out/' to your web host root." -ForegroundColor Green
    }
} else {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}
