# Start local Windows FFmpeg + SQLite Video Worker in background (127.0.0.1:4090)
$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$WorkerDataDir = Join-Path $RepoRoot "services\video-worker\data"
New-Item -ItemType Directory -Force -Path $WorkerDataDir | Out-Null
$PidFile = Join-Path $WorkerDataDir "worker.pid"
$LogOut = Join-Path $WorkerDataDir "worker.out.log"
$LogErr = Join-Path $WorkerDataDir "worker.err.log"

$port = if ($env:VIDEO_WORKER_PORT) { $env:VIDEO_WORKER_PORT } else { "4090" }
$healthUrl = "http://127.0.0.1:$port/health"

try {
    $res = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 2
    if ($res.ok) {
        Write-Host "[start-video-studio] Worker already running at $healthUrl"
        exit 0
    }
} catch {}

$proc = Start-Process -FilePath "npx.cmd" `
    -ArgumentList @("tsx", "services/video-worker/src/index.ts") `
    -WorkingDirectory $RepoRoot `
    -RedirectStandardOutput $LogOut `
    -RedirectStandardError $LogErr `
    -WindowStyle Hidden `
    -PassThru

$proc.Id | Out-File -FilePath $PidFile -Encoding ascii

for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Milliseconds 600
    try {
        $res = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 2
        if ($res.ok) {
            Write-Host "[start-video-studio] Worker listening (PID $($proc.Id)) at $healthUrl"
            exit 0
        }
    } catch {}
}

throw "Worker failed to become healthy within timeout. Inspect $LogErr"
