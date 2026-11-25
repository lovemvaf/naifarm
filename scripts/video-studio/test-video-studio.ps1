# Run automated verification suite T01-T16 for OCOP AI Video Studio
$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $RepoRoot

npx tsx scripts/test-video-studio.ts
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
