# Check local FFmpeg worker health, Muse provider flag, and pre-rendered samples manifest
$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$port = if ($env:VIDEO_WORKER_PORT) { $env:VIDEO_WORKER_PORT } else { "4090" }
$healthUrl = "http://127.0.0.1:$port/health"

Write-Host "[check-video-studio] Checking manifest..."
$manifestPath = Join-Path $RepoRoot "public\media\studio-samples\manifest.json"
if (-not (Test-Path $manifestPath)) { throw "Missing manifest.json at $manifestPath" }
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
Write-Host "[check-video-studio] Pre-rendered samples count: $($manifest.Count)"

try {
    $health = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 2
    Write-Host "[check-video-studio] Worker ONLINE: mode=$($health.workerMode), ai=$($health.aiProvider.status)"
} catch {
    Write-Host "[check-video-studio] Worker OFFLINE (Vercel/Cloud sample preview remains available)."
}
