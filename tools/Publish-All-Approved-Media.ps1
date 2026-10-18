# Andrew Tharwat HSE Portfolio — PUBLIC media publisher (Windows PowerShell 5.1)
# Requires Git for Windows. Extra MP4 conversion requires FFmpeg + FFprobe.
# The script uploads only whitelisted portfolio images, covers and videos to Andrew's own repository.
# It never publishes original operational plans, medical routes or lifting calculations.
param(
  [string]$MediaZip,
  [string]$SourceDirectory,
  [string]$VideoDirectory,
  [switch]$NoDialog
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$repo = 'https://github.com/atstudioimpact0/andrew-hse-portfolio.git'
$selected = @(
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
$extraVideos = @(
  @{ source='lv_0_20261015155925.mp4'; target='andrew-hse-new-video-20261015' },
  @{ source='lv_0_20261015162345.mp4'; target='andrew-hse-new-video-20261015-162345' },
  @{ source='lv_0_20260929171128.mp4'; target='andrew-hse-new-video-20260929-171128' },
  @{ source='2026-09-20-131821601.mp4'; target='andrew-hse-selected-video-20260920-131821601' }
)
function Normalize-DownloadName([string]$name) {
  $builder = New-Object System.Text.StringBuilder
  foreach($letter in $name.ToCharArray()) {
    $n = [int][char]$letter
    if($n -ge 0x660 -and $n -le 0x669) {
      [void]$builder.Append([char](48+$n-0x660))
    } elseif($n -ge 0x6F0 -and $n -le 0x6F9) {
      [void]$builder.Append([char](48+$n-0x6F0))
    } else {
      [void]$builder.Append($letter)
    }
  }
  $normal = $builder.ToString()
  return ($normal -replace ' \([0-9]+\)(?=\.(?:zip|mp4)$)', '')
}
function Select-LocalFiles([string]$filter, [bool]$many) {
  if($NoDialog) { return @() }
  try {
    Add-Type -AssemblyName System.Windows.Forms -ErrorAction Stop
    $picker = New-Object System.Windows.Forms.OpenFileDialog
    $picker.Title = 'Andrew HSE Portfolio - Select downloaded files'
    $picker.Filter = $filter
    $picker.Multiselect = $many
    $downloadDir = Join-Path $HOME 'Downloads'
    if(Test-Path -LiteralPath $downloadDir -PathType Container) {
      $picker.InitialDirectory = $downloadDir
    }
    if($picker.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
      return @($picker.FileNames)
    }
  } catch {
    Write-Host ('The file picker was unavailable: ' + $_.Exception.Message) -ForegroundColor Yellow
  }
  return @()
}
function Verify-Media([string]$file) {
  if(-not (Test-Path -LiteralPath $file -PathType Leaf)) { return $false }
  if((Get-Item -LiteralPath $file).Length -lt 1024) {
    throw "The media file is empty or invalid: $file"
  }
  $header = New-Object byte[] 12
  $stream = [System.IO.File]::OpenRead($file)
  try { [void]$stream.Read($header,0,12) } finally { $stream.Dispose() }
  if($file.EndsWith('.webp',[StringComparison]::OrdinalIgnoreCase)) {
    if([Text.Encoding]::ASCII.GetString($header,0,4) -ne 'RIFF' -or
      [Text.Encoding]::ASCII.GetString($header,8,4) -ne 'WEBP') {
      throw "File is not a valid WebP: $file"
    }
  } elseif($file.EndsWith('.mp4',[StringComparison]::OrdinalIgnoreCase)) {
    if([Text.Encoding]::ASCII.GetString($header,4,4) -ne 'ftyp') {
      throw "File is not a valid MP4: $file"
    }
  } else {
    throw "Unsupported media file: $file"
  }
  return $true
}
function Locate-MediaRoot([string]$folder) {
  if(Test-Path -LiteralPath (Join-Path $folder 'assets') -PathType Container) {
    return $folder
  }
  $candidates = @(Get-ChildItem -LiteralPath $folder -Directory -Recurse -ErrorAction SilentlyContinue |
    Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'assets') -PathType Container })
  if($candidates.Count -gt 0) {
    return $candidates[0].FullName
  }
  return $null
}
if(-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw 'Git for Windows not found. Install Git and sign in to GitHub before running this tool.'
}
$locations = @($SourceDirectory,$VideoDirectory,(Join-Path $HOME 'Downloads'),
  (Join-Path $HOME 'Desktop'),(Get-Location).Path,$PSScriptRoot)
$locations = @($locations | Where-Object { $_ -and (Test-Path -LiteralPath $_ -PathType Container) } |
  Select-Object -Unique)
if(-not $MediaZip -and -not $SourceDirectory) {
  foreach($folder in $locations) {
    $zips = @(Get-ChildItem -LiteralPath $folder -File -Filter '*.zip' -ErrorAction SilentlyContinue |
      Where-Object { (Normalize-DownloadName $_.Name) -in @(
        'Andrew_HSE_V9_Media_Upload_Only.zip',
        'Andrew_HSE_V9_ReadyToPublish.zip'
      ) })
    if($zips.Count -gt 0) {
      $preferred = @($zips | Sort-Object @{Expression={
        if($_.Name -like '*Media_Upload_Only*') { 0 } else { 1 }
      }})
      $MediaZip = $preferred[0].FullName
      break
    }
  }
}
if(-not $MediaZip -and -not $SourceDirectory) {
  Write-Host 'No downloaded media ZIP found. Choose the media ZIP file, or Cancel.' -ForegroundColor Yellow
  $chosen = @(Select-LocalFiles 'ZIP files (*.zip)|*.zip' $false)
  if($chosen.Count -gt 0) { $MediaZip = $chosen[0] }
}
$videos = @()
foreach($folder in $locations) {
  $videos += @(Get-ChildItem -LiteralPath $folder -File -Filter '*.mp4' -ErrorAction SilentlyContinue)
}
$videos = @($videos | Sort-Object -Property FullName -Unique)
$missingVideos = @($extraVideos | Where-Object {
  $requiredName = $_.source
  @($videos | Where-Object { (Normalize-DownloadName $_.Name) -eq $requiredName }).Count -eq 0
})
if($missingVideos.Count -gt 0) {
  Write-Host 'Some videos were not detected. You can choose your downloaded MP4 files manually.' -ForegroundColor Yellow
  $chosenVideos = @(Select-LocalFiles 'MP4 videos (*.mp4)|*.mp4' $true)
  foreach($path in $chosenVideos) {
    if(Test-Path -LiteralPath $path -PathType Leaf) {
      $videos += Get-Item -LiteralPath $path
    }
  }
}
$videos = @($videos | Sort-Object -Property FullName -Unique)
$tmp = Join-Path ([IO.Path]::GetTempPath()) ('andrew-publisher-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp -Force | Out-Null
try {
  $source = $SourceDirectory
  if($MediaZip) {
    if(-not (Test-Path -LiteralPath $MediaZip -PathType Leaf)) {
      throw "ZIP not found: $MediaZip"
    }
    $extracted = Join-Path $tmp 'media'
    Expand-Archive -LiteralPath $MediaZip -DestinationPath $extracted -Force
    $source = Locate-MediaRoot $extracted
    if(-not $source) {
      $nested = @(Get-ChildItem -LiteralPath $extracted -File -Filter '*.zip' -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -like '*Media_Upload_Only*.zip' })
      if($nested.Count -gt 0) {
        $inner = Join-Path $tmp 'nested-media'
        Expand-Archive -LiteralPath $nested[0].FullName -DestinationPath $inner -Force
        $source = Locate-MediaRoot $inner
      }
    }
    if(-not $source) {
      Write-Host 'ZIP does not contain the expected approved assets. Use the V9 Media_Upload_Only ZIP.' -ForegroundColor Yellow
    }
  }
  $readyFiles = New-Object 'System.Collections.Generic.List[string]'
  $stagedRoot = Join-Path $tmp 'approved'
  New-Item -ItemType Directory -Path $stagedRoot -Force | Out-Null
  if($source -and (Test-Path -Literal (Join-Path $source 'assets') -PathType Container)) {
    foreach($rel in $selected) {
      $inputPath = Join-Path $source $rel
      if(-not (Test-Path -LiteralPath $inputPath -PathType Leaf)) { continue }
      [void](Verify-Media $inputPath)
      $outputPath = Join-Path $stagedRoot $rel
      New-Item -ItemType Directory -Path (Split-Path -Parent $outputPath) -Force | Out-Null
      Copy-Item -LiteralPath $inputPath -Destination $outputPath -Force
      $readyFiles.Add($rel)
    }
  }
  $ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
  $ffprobe = Get-Command ffprobe -ErrorAction SilentlyContinue
  foreach($item in $extraVideos) {
    $wanted = $item.source
    $original = @($videos | Where-Object {
      (Normalize-DownloadName $_.Name) -eq $wanted
    } | Select-Object -First 1)
    if($original.Count -eq 0) {
      Write-Host ("Video not downloaded: " + $wanted) -ForegroundColor DarkYellow
      continue
    }
    if(-not $ffmpeg -or -not $ffprobe) {
      Write-Host 'FFmpeg and FFprobe are needed for the newer videos. Skipping uncompressed files.' -ForegroundColor Yellow
      continue
    }
    $originalFile = $original[0].FullName
    if((Get-Item -LiteralPath $originalFile).Length -gt 250MB) {
      throw "Source video is unexpectedly large: $originalFile"
    }
    $rel = 'assets/videos/' + $item.target + '.mp4'
    $coverRel = 'assets/video-posters/' + $item.target + '.webp'
    $outFile = Join-Path $stagedRoot $rel
    $coverFile = Join-Path $stagedRoot $coverRel
    New-Item -ItemType Directory -Path (Split-Path -Parent $outFile) -Force | Out-Null
    New-Item -ItemType Directory -Path (Split-Path -Parent $coverFile) -Force | Out-Null
    Write-Host ("Optimizing: " + $original[0].Name) -ForegroundColor Cyan
    foreach($crf in @(27,30,33,36)) {
      $args = @('-hide_banner','-loglevel','error','-nostdin','-y',
        '-i',$originalFile,'-map','0:v:0','-map','0:a:0?',
        '-vf','scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2',
        '-c:v','libx264','-preset','medium','-crf',[string]$crf,
        '-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart',$outFile)
      & ffmpeg @args
      if($LASTEXITCODE -ne 0) {
        throw "FFmpeg could not convert: $originalFile"
      }
      if((Get-Item -LiteralPath $outFile).Length -le 25MB) { break }
    }
    if((Get-Item -LiteralPath $outFile).Length -gt 25MB) {
      Remove-Item -LiteralPath $outFile -Force
      Write-Host 'Skipped a video over 25MB after compression; reduce length or resolution.' -ForegroundColor Yellow
      continue
    }
    $posterArgs = @('-hide_banner','-loglevel','error','-nostdin','-y',
      '-ss','0.5','-i',$outFile,'-frames:v','1',
      '-vf','scale=900:510:force_original_aspect_ratio=decrease:force_divisible_by=2',
      '-c:v','libwebp','-quality','82',$coverFile)
    & ffmpeg @posterArgs
    if($LASTEXITCODE -ne 0) {
      throw "FFmpeg could not create the WebP cover: $originalFile"
    }
    [void](Verify-Media $outFile)
    [void](Verify-Media $coverFile)
    $readyFiles.Add($rel)
    $readyFiles.Add($coverRel)
  }
  if($readyFiles.Count -eq 0) {
    Write-Host 'NO FILES READY. Download the V9 media ZIP and the approved MP4 files, then rerun.' -ForegroundColor Yellow
    exit 0
  }
  Write-Host ''
  Write-Host ('Prepared for PUBLIC GitHub: ' + $readyFiles.Count + ' files') -ForegroundColor Cyan
  foreach($rel in $readyFiles) { Write-Host ('  ' + $rel) }
  Write-Host 'Review each photo/video for permission to publish faces, company marks, and private site details.' -ForegroundColor Yellow
  $approval = Read-Host 'Type PUBLISH only if public release of these exact media files is authorized'
  if($approval -cne 'PUBLISH') {
    Write-Host 'Canceled. No files uploaded.'
    exit 0
  }
  $checkout = Join-Path $tmp 'checkout'
  & git clone --quiet --depth 1 --branch main $repo $checkout
  if($LASTEXITCODE -ne 0) { throw 'Git clone failed. Check your GitHub account permissions.' }
  foreach($rel in $readyFiles) {
    $targetFile = Join-Path $checkout $rel
    New-Item -ItemType Directory -Path (Split-Path -Parent $targetFile) -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $stagedRoot $rel) -Destination $targetFile -Force
  }
  Push-Location $checkout
  try {
    & git add -- assets
    if($LASTEXITCODE -ne 0) { throw 'Git add failed.' }
    & git diff --cached --quiet
    if($LASTEXITCODE -eq 0) {
      Write-Host 'The selected files are already committed. No changes required.' -ForegroundColor Green
      exit 0
    }
    & git diff --cached --stat
    # Set author metadata only in this disposable clone, not in other repositories.
    $commitName = (& git config --get user.name)
    if([string]::IsNullOrWhiteSpace([string]$commitName)) {
      $commitName = Read-Host 'Git commit name (e.g. Andrew Tharwat)'
      if([string]::IsNullOrWhiteSpace($commitName)) {
        throw 'Git commit author name cannot be empty.'
      }
      & git config --local user.name $commitName
      if($LASTEXITCODE -ne 0) { throw 'Could not save local Git author name.' }
    }
    $commitEmail = (& git config --get user.email)
    if([string]::IsNullOrWhiteSpace([string]$commitEmail)) {
      Write-Host 'Use a GitHub verified email or GitHub no-reply email. This may appear in public commit history.' -ForegroundColor Yellow
      $commitEmail = Read-Host 'Git commit email'
      if([string]::IsNullOrWhiteSpace($commitEmail) -or $commitEmail -notlike '*@*.*') {
        throw 'A valid Git commit email is required.'
      }
      & git config --local user.email $commitEmail
      if($LASTEXITCODE -ne 0) { throw 'Could not save local Git email.' }
    }
    & git commit -m 'media: publish authorized Andrew HSE portfolio assets'
    if($LASTEXITCODE -ne 0) {
      throw 'Git commit failed. Configure your Git username and email.'
    }
    & git push origin main
    if($LASTEXITCODE -ne 0) {
      throw 'Git push failed. No force push was attempted.'
    }
    Write-Host 'UPLOAD COMPLETE: media committed to Andrew independent GitHub repository.' -ForegroundColor Green
  } finally {
    Pop-Location
  }
} finally {
  Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
}
