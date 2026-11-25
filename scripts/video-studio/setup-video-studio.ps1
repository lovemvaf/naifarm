# Setup local dependencies & directories for NaiFarm OCOP AI Video Studio
$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $RepoRoot

Write-Host "[setup-video-studio] Checking required local binaries..."
foreach ($bin in @("node", "npx", "ffmpeg", "ffprobe")) {
    if (-not (Get-Command $bin -ErrorAction SilentlyContinue)) {
        throw "Missing required binary: $bin"
    }
}

$pyBin = Get-Command python -ErrorAction SilentlyContinue
if (-not $pyBin) { $pyBin = Get-Command py -ErrorAction SilentlyContinue }
if (-not $pyBin) { throw "Missing Python interpreter with Pillow (PIL)" }

& $pyBin.Source -c "import PIL; print('[setup-video-studio] Python Pillow OK')"
if ($LASTEXITCODE -ne 0) { throw "Python PIL check failed. Install Pillow: python -m pip install Pillow" }

New-Item -ItemType Directory -Force -Path (Join-Path $RepoRoot "local-media\jobs") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $RepoRoot "services\video-worker\data") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $RepoRoot "public\media\studio-samples") | Out-Null

node -e "import('node:sqlite').then(m => { if (!m.DatabaseSync) process.exit(1); console.log('[setup-video-studio] Node SQLite DatabaseSync OK'); })"
if ($LASTEXITCODE -ne 0) { throw "Node >= 22.5 built-in node:sqlite required" }

Write-Host "[setup-video-studio] Environment ready."
