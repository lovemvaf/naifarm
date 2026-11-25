# Verify environment, ensure samples exist, start local FFmpeg worker, and print Studio demo URLs
$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $RepoRoot

& (Join-Path $PSScriptRoot "setup-video-studio.ps1")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$manifestPath = Join-Path $RepoRoot "public\media\studio-samples\manifest.json"
if (-not (Test-Path $manifestPath)) {
    & (Join-Path $PSScriptRoot "sync-data.ps1")
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

& (Join-Path $PSScriptRoot "start-video-studio.ps1")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "[demo-local] Worker active at http://127.0.0.1:4090"
Write-Host "[demo-local] Start Next.js in another terminal with: npm run dev"
Write-Host "[demo-local] Open Studio in W02: http://localhost:3000/farmer?mode=erp&tab=studio"
