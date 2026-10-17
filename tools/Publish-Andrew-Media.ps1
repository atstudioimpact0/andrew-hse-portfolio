# Andrew Tharwat HSE Portfolio - first-party photo and video publishing.
# Read before use: GitHub repository is PUBLIC. This never touches the ATS website repository.
param(
  [Parameter(Mandatory=$true)][string]$MediaZip,
  [string]$Repository = 'https://github.com/atstudioimpact0/andrew-hse-portfolio.git'
)
$ErrorActionPreference = 'Stop'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw 'Git for Windows must be installed and signed into an authorized GitHub account.'
}
if (-not (Test-Path -LiteralPath $MediaZip -PathType Leaf)) {
  throw "Media ZIP not found: $MediaZip"
}
if (-not $Repository.EndsWith('atstudioimpact0/andrew-hse-portfolio.git')) {
  throw 'Invalid destination: only the independent Andrew HSE Portfolio repository is allowed.'
}
Write-Host 'This PUBLIC release contains Andrew portfolio artwork, a portrait and TWO HSE training videos.' -ForegroundColor Yellow
Write-Host 'Confirm rights to display identifiable people, construction imagery, logos and other protected assets.' -ForegroundColor Yellow
$approval = Read-Host 'Type PUBLISH after checking public-sharing rights for these exact assets'
if ($approval -cne 'PUBLISH') {
  Write-Host 'Canceled without changes.'
  exit 0
}
$temp = Join-Path ([System.IO.Path]::GetTempPath()) ('andrew-hse-public-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $temp | Out-Null
try {
  $source = Join-Path $temp 'package'
  Expand-Archive -LiteralPath $MediaZip -DestinationPath $source
  $required = @(
    'data/videos.json',
    'assets/videos/hse-decision-training.mp4',
    'assets/videos/site-safety-briefing.mp4',
    'assets/video-posters/hse-decision-training.webp',
    'assets/video-posters/site-safety-briefing.webp'
  )
  foreach($rel in $required) {
    if (-not (Test-Path -LiteralPath (Join-Path $source $rel) -PathType Leaf)) {
      throw "Mandatory media asset absent: $rel"
    }
  }
  $all = @(Get-ChildItem -LiteralPath $source -Recurse -File)
  foreach($item in $all) {
    $relative = $item.FullName.Substring($source.Length).TrimStart('\','/') -replace '\\','/'
    if ($relative -notmatch '^(assets/(signage|work|videos|video-posters)/[A-Za-z0-9._-]+\.(webp|mp4)|data/videos\.json)$') {
      throw "Unexpected archive file; release blocked: $relative"
    }
  }
  $json = Get-Content -LiteralPath (Join-Path $source 'data/videos.json') -Raw | ConvertFrom-Json
  if (@($json.videos).Count -ne 2) {
    throw 'Manifest does not contain exactly the two reviewed training videos.'
  }
  $checkout = Join-Path $temp 'checkout'
  & git clone --depth 1 --branch main $Repository $checkout
  if ($LASTEXITCODE -ne 0) { throw 'Could not clone independent repository.' }
  foreach($rel in @('assets/signage','assets/work','assets/videos','assets/video-posters','data/videos.json')) {
    $from=Join-Path $source $rel
    if (-not (Test-Path -LiteralPath $from)) { throw "Expected package path missing: $rel" }
    $to=Join-Path $checkout $rel
    New-Item -ItemType Directory -Path (Split-Path -Parent $to) -Force | Out-Null
    Copy-Item -LiteralPath $from -Destination $to -Recurse -Force
  }
  Push-Location $checkout
  try {
    & git add -- assets/signage assets/work assets/videos assets/video-posters data/videos.json
    if ($LASTEXITCODE -ne 0) { throw 'Could not stage media files.' }
    & git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) { Write-Host 'The repository already contains this media.'; exit 0 }
    & git diff --cached --stat
    & git commit -m 'media: publish approved original design work and two HSE training films'
    if ($LASTEXITCODE -ne 0) { throw 'Git commit failed; configure git user.email and user.name.' }
    & git push origin main
    if ($LASTEXITCODE -ne 0) { throw 'Push rejected; changes are not published. Git repo stays unchanged.' }
    Write-Host 'Uploaded to the independent GitHub repository. Check the Vercel deployment, media playback and Arabic page.' -ForegroundColor Green
  }
  finally { Pop-Location }
}
finally {
  Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue
}
