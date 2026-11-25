# Regenerate verified pre-rendered FFmpeg sample MP4 clips & manifest in public/media/studio-samples/
$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $RepoRoot

Write-Host "[sync-data] Rendering verified FFmpeg studio samples..."
npx tsx scripts/video-studio/generate-samples.ts
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "[sync-data] Completed sample sync."
