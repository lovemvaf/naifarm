# Create timestamped local backup of SQLite job queue + sample manifest (outside Git tree)
$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupDir = Join-Path $RepoRoot "services\video-worker\data\backups\$Stamp"
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$DbFile = Join-Path $RepoRoot "services\video-worker\data\video-studio.sqlite"
if (Test-Path $DbFile) {
    Copy-Item $DbFile (Join-Path $BackupDir "video-studio.sqlite") -Force
}

$ManifestFile = Join-Path $RepoRoot "public\media\studio-samples\manifest.json"
if (Test-Path $ManifestFile) {
    Copy-Item $ManifestFile (Join-Path $BackupDir "samples-manifest.json") -Force
}

Write-Host "[backup-video-studio] Snapshot saved under $BackupDir"
