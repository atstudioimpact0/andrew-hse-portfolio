# Andrew Tharwat personal HSE portfolio - media-only publisher. No changes to ATS projects.
# USAGE:
# 1) Extract Andrew_HSE_V9_ReadyToPublish.zip into a folder.
# 2) Right-click Publish-Andrew-Media.ps1 -> Run with PowerShell, or run:
#    powershell -NoProfile -ExecutionPolicy Bypass -File ".\Publish-Andrew-Media.ps1"
#    (Optionally add -MediaZip "path/to/Andrew_HSE_V9_Media_Upload_Only.zip")
param(
  [string]$MediaZip,
  [string]$MediaDirectory,
  [string]$Repository='https://github.com/atstudioimpact0/andrew-hse-portfolio.git'
)
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
$expected = @(
  'assets/signage/restricted-zone.webp',
  'assets/signage/storage-area.webp',
  'assets/signage/parking-area.webp',
  'assets/signage/falling-objects.webp',
  'assets/signage/drowsy-driving.webp',
  'assets/signage/heat-stress.webp',
  'assets/signage/water-conservation.webp',
  'assets/signage/world-environment-day.webp',
  'assets/work/andrew-portrait.webp',
  'assets/work/safety-performance.webp',
  'assets/work/six-million-hours.webp',
  'assets/work/global-safety-day.webp',
  'assets/work/hsse-board.webp',
  'assets/video-posters/hse-decision-training.webp',
  'assets/video-posters/site-safety-briefing.webp',
  'assets/videos/hse-decision-training.mp4',
  'assets/videos/site-safety-briefing.mp4'
)
$expectedSource='https://github.com/atstudioimpact0/andrew-hse-portfolio.git'
if ($Repository -ne $expectedSource) {
  throw "Blocked: must publish ONLY to $expectedSource."
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw 'Git for Windows is required. Install Git for Windows and authenticate with your GitHub account.'
}
if ($MediaZip -and $MediaDirectory) { throw 'Specify either -MediaZip or -MediaDirectory, not both.' }
if (-not $MediaZip -and -not $MediaDirectory) {
  $candidateDirs=@($PSScriptRoot,(Get-Location).Path)
  foreach($dir in $candidateDirs) {
    if ((Test-Path -LiteralPath (Join-Path $dir 'assets/videos/hse-decision-training.mp4') -PathType Leaf)) {
      $MediaDirectory=$dir
      break
    }
    $candidate=Get-ChildItem -LiteralPath $dir -File -Filter '*Media*Upload*.zip' -ErrorAction SilentlyContinue |
      Select-Object -First 1
    if($candidate) { $MediaZip=$candidate.FullName; break }
  }
}
if (-not $MediaZip -and -not $MediaDirectory) {
  throw 'No media package detected. Use -MediaZip "FULL_PATH_TO_MEDIA_ZIP" or -MediaDirectory "FOLDER_WITH_assets".'
}
if ($MediaDirectory -and -not (Test-Path -LiteralPath $MediaDirectory -PathType Container)) {
  throw "Media directory not found: $MediaDirectory"
}
if ($MediaZip -and -not (Test-Path -LiteralPath $MediaZip -PathType Leaf)) {
  throw "Media ZIP not found: $MediaZip"
}
$temp=Join-Path ([IO.Path]::GetTempPath()) ('andrew-hse-v9-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $temp -Force | Out-Null
try {
  $source=$MediaDirectory
  if ($MediaZip) {
    $source=Join-Path $temp 'source'
    Expand-Archive -LiteralPath $MediaZip -DestinationPath $source -Force
  }
  if (-not $source) { throw 'Source unavailable.' }
  # Handle a single wrapper directory inside ZIP, if present.
  if (-not (Test-Path -LiteralPath (Join-Path $source 'assets') -PathType Container)) {
    $children=@(Get-ChildItem -LiteralPath $source -Directory)
    if ($children.Count -eq 1 -and (Test-Path -LiteralPath (Join-Path $children[0].FullName 'assets'))) {
      $source=$children[0].FullName
    }
  }
  foreach($rel in $expected) {
    $p=Join-Path $source $rel
    if (-not (Test-Path -LiteralPath $p -PathType Leaf)) { throw "RELEASE BLOCKED: missing expected media file: $rel" }
    $f=Get-Item -LiteralPath $p
    if($f.Length -lt 100) { throw "RELEASE BLOCKED: empty or invalid media file: $rel" }
    $extension=[IO.Path]::GetExtension($p).ToLowerInvariant()
    $sig=[byte[]]::new(12)
    $stream=[IO.File]::OpenRead($p)
    try { [void]$stream.Read($sig,0,12) } finally { $stream.Dispose() }
    if($extension -eq '.webp') {
      if ([Text.Encoding]::ASCII.GetString($sig,0,4) -ne 'RIFF' -or
          [Text.Encoding]::ASCII.GetString($sig,8,4) -ne 'WEBP') {
        throw "RELEASE BLOCKED: invalid WebP header: $rel"
      }
    }
    if($extension -eq '.mp4' -and [Text.Encoding]::ASCII.GetString($sig,4,4) -ne 'ftyp') {
      throw "RELEASE BLOCKED: invalid MP4 header: $rel"
    }
    if($extension -eq '.mp4' -and $f.Length -gt 80000000) {
      throw "RELEASE BLOCKED: video file is unexpectedly large: $rel"
    }
    Write-Host ("OK  "+$rel+" ("+[Math]::Round($f.Length/1MB,2)+" MB)") -ForegroundColor DarkGreen
  }
  Write-Host "Verified 13 visual artwork/portrait images, 2 video posters and 2 video files." -ForegroundColor Cyan
  if ((Get-ChildItem -LiteralPath (Join-Path $source 'assets') -Recurse -File |
    Where-Object { $_.FullName -match '(original-layouts|medical-routes|lifting-data|traffic-pk04|risk-heat-map)' }).Count -gt 0) {
    throw 'Private site plans or operational drawings detected in source assets. Publishing blocked.'
  }
  Write-Host ''
  Write-Host 'IMPORTANT: this repository is PUBLIC. Worker images, project identity, original drawings and videos must be cleared for publication.' -ForegroundColor Yellow
  $approval=Read-Host 'If you reviewed public-distribution rights for THESE files, type PUBLISH'
  if($approval -cne 'PUBLISH') { Write-Host 'Canceled. No files changed.'; exit 0 }
  $checkout=Join-Path $temp 'checkout'
  & git clone --quiet --depth 1 --branch main $Repository $checkout
  if($LASTEXITCODE -ne 0) {throw 'Git clone failed. Check GitHub credentials.'}
  foreach($rel in $expected) {
    $dest=Join-Path $checkout $rel
    New-Item -ItemType Directory -Path (Split-Path -Parent $dest) -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $source $rel) -Destination $dest -Force
  }
  # Keep the bilingual video manifest that is already reviewed in GitHub.
  # Verify the two video file paths exactly match that manifest.
  $manifest=(Get-Content -LiteralPath (Join-Path $checkout 'data/videos.json') -Raw | ConvertFrom-Json)
  $approvedPaths=@('assets/videos/hse-decision-training.mp4','assets/videos/site-safety-briefing.mp4','assets/videos/andrew-hse-new-video-20261015.mp4','assets/videos/andrew-hse-new-video-20261015-162345.mp4','assets/videos/andrew-hse-new-video-20260929-171128.mp4')
  if (@($manifest.videos).Count -lt 2 -or @($manifest.videos).Count -gt 5) {
    throw 'GitHub video manifest must contain two to five recognized video entries.'
  }
  foreach($item in $manifest.videos) {
    if ($item.src -notin $approvedPaths) {
      throw "Video manifest references an unexpected file: $($item.src)"
    }
  }
  # Additional approved archive videos are optional. Do NOT publish an absent video.
  # Source video files may be >50 MB; optimize them first for a usable public mobile portfolio.
  $extraVideos=@(
    'assets/videos/andrew-hse-new-video-20261015.mp4',
    'assets/videos/andrew-hse-new-video-20261015-162345.mp4',
    'assets/videos/andrew-hse-new-video-20260929-171128.mp4'
  )
  foreach($optional in $extraVideos) {
    $file=Join-Path $source $optional
    if(-not (Test-Path -LiteralPath $file -PathType Leaf)) {continue}
    $f=Get-Item -LiteralPath $file
    if ($f.Length -gt 30000000) {
      throw "OPTIONAL VIDEO IS TOO LARGE FOR WEB RELEASE: $optional. Optimize to <=30 MB with ffmpeg before publishing."
    }
    $sig=[byte[]]::new(12)
    $stream=[IO.File]::OpenRead($file)
    try{[void]$stream.Read($sig,0,12)}finally{$stream.Dispose()}
    if([Text.Encoding]::ASCII.GetString($sig,4,4) -ne 'ftyp'){
      throw "OPTIONAL VIDEO FAILED MP4 SIGNATURE CHECK: $optional"
    }
    $target=Join-Path $checkout $optional
    New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
    Copy-Item -LiteralPath $file -Destination $target -Force
    Write-Host ("Additional video ready: "+$optional) -ForegroundColor Cyan
  }
  Push-Location $checkout
  try {
    & git add -- assets/signage assets/work assets/video-posters assets/videos
    if($LASTEXITCODE -ne 0) {throw 'Git add failed.'}
    & git diff --cached --quiet
    if($LASTEXITCODE -eq 0) {
      Write-Host 'All 17 media files are already identical in the repository.' -ForegroundColor Green
    } else {
      & git diff --cached --stat
      & git commit -m 'media: publish 13 HSE design images, 2 posters and 2 training videos'
      if($LASTEXITCODE -ne 0) {throw 'Git commit failed. Configure Git username and email.'}
      & git push origin main
      if($LASTEXITCODE -ne 0) {throw 'Git push failed. No changes were forced.'}
      Write-Host 'UPLOAD COMPLETE: media committed to Andrew independent main branch.' -ForegroundColor Green
    }
  } finally { Pop-Location }
  $verify=$true
  foreach($rel in $expected){
    & git -C $checkout cat-file -e ('HEAD:'+$rel) 2>$null
    if($LASTEXITCODE -ne 0){$verify=$false; Write-Host "Missing in commit: $rel" -ForegroundColor Red}
  }
  if(-not $verify){throw 'Post-commit media verification failed.'}
  Write-Host 'NEXT: Vercel will deploy GitHub main. Check https://andrew.atstudioimpact.com and /ar.html' -ForegroundColor Cyan
} finally {
  Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue
}
