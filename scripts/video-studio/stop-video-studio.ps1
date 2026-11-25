# Cleanly stop the local Windows FFmpeg Video Worker started by start-video-studio.ps1
$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$PidFile = Join-Path $RepoRoot "services\video-worker\data\worker.pid"

if (Test-Path $PidFile) {
    $workerPid = (Get-Content $PidFile -Raw).Trim()
    if ($workerPid -match '^\d+$') {
        $proc = Get-Process -Id ([int]$workerPid) -ErrorAction SilentlyContinue
        if ($proc) {
            Stop-Process -Id $proc.Id -Force
            Write-Host "[stop-video-studio] Stopped worker PID $workerPid"
        }
    }
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "[stop-video-studio] No worker.pid file found."
}
