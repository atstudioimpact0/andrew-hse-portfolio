# Andrew Tharwat | V11 approved media publisher
# Save this script and the V9 media ZIP to your Downloads folder; save new uploaded MP4s there too.
# Run in Windows PowerShell with: powershell -NoProfile -ExecutionPolicy Bypass -File .\Publish-All-Approved-Media.ps1
# Requires authenticated Git for Windows. Additional source videos need FFmpeg and FFprobe.
param([string]$MediaZip,[string]$SourceDirectory,[string]$VideoDirectory)
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
$repo='https://github.com/atstudioimpact0/andrew-hse-portfolio.git'
$selected=@(
 'assets/signage/restricted-zone.webp','assets/signage/storage-area.webp',
 'assets/signage/parking-area.webp','assets/signage/falling-objects.webp',
 'assets/signage/drowsy-driving.webp','assets/signage/heat-stress.webp',
 'assets/signage/water-conservation.webp','assets/signage/world-environment-day.webp',
 'assets/work/andrew-portrait.webp','assets/work/safety-performance.webp',
 'assets/work/six-million-hours.webp','assets/work/global-safety-day.webp',
 'assets/work/hsse-board.webp',
 'assets/video-posters/hse-decision-training.webp',
 'assets/video-posters/site-safety-briefing.webp',
 'assets/videos/hse-decision-training.mp4',
 'assets/videos/site-safety-briefing.mp4'
)
$extras=@(
 @{file='lv_0_20261015155925.mp4';dest='andrew-hse-new-video-20261015'},
 @{file='lv_0_20261015162345.mp4';dest='andrew-hse-new-video-20261015-162345'},
 @{file='lv_0_20260929171128.mp4';dest='andrew-hse-new-video-20260929-171128'},
 @{file='2026-09-20-131821601.mp4';dest='andrew-hse-selected-video-20260920-131821601'}
)
function Standard-Name([string]$name){
 $result=[System.Text.StringBuilder]::new()
 foreach($char in $name.ToCharArray()){
   $number=[int][char]$char
   if($number -ge 0x660 -and $number -le 0x669){[void]$result.Append([char](48+$number-0x660))}
   elseif($number -ge 0x6F0 -and $number -le 0x6F9){[void]$result.Append([char](48+$number-0x6F0))}
   else{[void]$result.Append($char)}
 }
 return $result.ToString()
}
function Verify-File([string]$path){
 if(!(Test-Path -LiteralPath $path -PathType Leaf)){return $false}
 if((Get-Item -LiteralPath $path).Length -lt 1024){throw "Empty media: $path"}
 $bytes=[byte[]]::new(12)
 $stream=[IO.File]::OpenRead($path)
 try{[void]$stream.Read($bytes,0,12)}finally{$stream.Dispose()}
 if($path.ToLower().EndsWith('.webp')){
   if([Text.Encoding]::ASCII.GetString($bytes,0,4) -ne 'RIFF' -or
      [Text.Encoding]::ASCII.GetString($bytes,8,4) -ne 'WEBP'){throw "Invalid WebP: $path"}
 }elseif($path.ToLower().EndsWith('.mp4')){
   if([Text.Encoding]::ASCII.GetString($bytes,4,4) -ne 'ftyp'){throw "Invalid MP4: $path"}
 }else{throw "Blocked extension: $path"}
 return $true
}
if(!(Get-Command git -ErrorAction SilentlyContinue)){throw 'Git for Windows not found. Install Git and sign in to GitHub.'}
$places=@($SourceDirectory,$VideoDirectory,(Join-Path $HOME 'Downloads'),(Join-Path $HOME 'Desktop'),(Get-Location).Path,$PSScriptRoot)
$places=@($places | Where-Object {$_ -and (Test-Path -LiteralPath $_ -PathType Container)} | Select-Object -Unique)
if(!$MediaZip){
 foreach($place in $places){
  $match=@(Get-ChildItem -LiteralPath $place -File -ErrorAction SilentlyContinue | Where-Object {
    $_.Name -in @('Andrew_HSE_V9_ReadyToPublish.zip','Andrew_HSE_V9_Media_Upload_Only.zip','Andrew_HSE_Portfolio_V9_Review_Package.zip')
  })
  if($match.Count){$MediaZip=$match[0].FullName;break}
 }
}
$tmp=Join-Path ([IO.Path]::GetTempPath()) ('andrew-approved-'+[Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp -Force | Out-Null
try {
 $checkout=Join-Path $tmp 'repo'
 & git clone --quiet --depth 1 --branch main $repo $checkout
 if($LASTEXITCODE -ne 0){throw 'Unable to clone independent Andrew portfolio GitHub repo'}
 $source=$SourceDirectory
 if($MediaZip){
  if(!(Test-Path -LiteralPath $MediaZip -PathType Leaf)){throw "ZIP missing: $MediaZip"}
  $source=Join-Path $tmp 'media'
  Expand-Archive -LiteralPath $MediaZip -DestinationPath $source -Force
  if(!(Test-Path (Join-Path $source 'assets'))){
    $inner=@(Get-ChildItem -LiteralPath $source -Directory | Where-Object {Test-Path (Join-Path $_.FullName 'assets')})
    if($inner.Count -eq 1){$source=$inner[0].FullName}
  }
 }
 $ready=[System.Collections.Generic.List[string]]::new()
 if($source -and (Test-Path (Join-Path $source 'assets'))){
  foreach($relative in $selected){
   $from=Join-Path $source $relative
   if(!(Test-Path -LiteralPath $from -PathType Leaf)){Write-Host "ZIP does not contain $relative" -ForegroundColor DarkYellow;continue}
   [void](Verify-File $from)
   $dest=Join-Path $checkout $relative
   New-Item -ItemType Directory -Path (Split-Path -Parent $dest) -Force | Out-Null
   Copy-Item -LiteralPath $from -Destination $dest -Force
   $ready.Add($relative)
  }
 } else {
   Write-Host 'V9 media ZIP not found. Download it to your Downloads folder to include safety signs and the first two videos.' -ForegroundColor Yellow
 }
 $found=@()
 foreach($place in $places){$found+=@(Get-ChildItem -LiteralPath $place -Filter '*.mp4' -File -ErrorAction SilentlyContinue)}
 $found=@($found | Select-Object -Unique)
 $ff=(Get-Command ffmpeg -ErrorAction SilentlyContinue)
 $probe=(Get-Command ffprobe -ErrorAction SilentlyContinue)
 foreach($item in $extras){
  $original=$found | Where-Object {(Standard-Name $_.Name) -eq $item.file} | Select-Object -First 1
  if(!$original){Write-Host "Extra film not downloaded: $($item.file)" -ForegroundColor DarkYellow;continue}
  if(!$ff -or !$probe){Write-Host 'Additional videos need FFmpeg and FFprobe; upload of approved V9 files can still continue.' -ForegroundColor Yellow;continue}
  $path='assets/videos/'+$item.dest+'.mp4'
  $coverPath='assets/video-posters/'+$item.dest+'.webp'
  $output=Join-Path $checkout $path
  $poster=Join-Path $checkout $coverPath
  New-Item -ItemType Directory -Path (Split-Path -Parent $output) -Force | Out-Null
  New-Item -ItemType Directory -Path (Split-Path -Parent $poster) -Force | Out-Null
  $settings=@('-hide_banner','-loglevel','error','-nostdin','-y','-i',$original.FullName,'-map','0:v:0','-map','0:a:0?','-vf','scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2','-c:v','libx264','-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart')
  foreach($crf in @(27,30,33,36)){
   $args1=@($settings)+@('-crf',([string]$crf),$output)
   & ffmpeg @args1
   if($LASTEXITCODE -ne 0){throw "Unable to compress $($original.Name)"}
   if((Get-Item -LiteralPath $output).Length -le 25MB){break}
  }
  if((Get-Item -LiteralPath $output).Length -gt 25MB){Write-Host "Video still too large, skipped: $($original.Name)" -ForegroundColor Yellow;Remove-Item $output;continue}
  $args2=@('-hide_banner','-loglevel','error','-nostdin','-y','-ss','1.0','-i',$output,'-frames:v','1','-vf','scale=900:510:force_original_aspect_ratio=decrease:force_divisible_by=2','-c:v','libwebp','-quality','82',$poster)
  & ffmpeg @args2
  if($LASTEXITCODE -ne 0){throw "Cannot create poster for $($item.dest)"}
  [void](Verify-File $output);[void](Verify-File $poster)
  $ready.Add($path);$ready.Add($coverPath)
  Write-Host "Optimized: $($item.dest)" -ForegroundColor Green
 }
 if($ready.Count -eq 0){Write-Host 'Nothing ready. Download the approved V9 ZIP and source videos locally, then rerun.' -ForegroundColor Yellow;exit 0}
 Write-Host 'Files for PUBLIC GitHub publication:' -ForegroundColor Cyan
 foreach($rel in $ready){Write-Host $rel}
 Write-Host 'Review permission to publish any identified people, project marks and images. This script intentionally excludes all original layouts/emergency maps.' -ForegroundColor Yellow
 $confirmation=Read-Host 'Type PUBLISH only after confirming public display rights for these exact files'
 if($confirmation -cne 'PUBLISH'){Write-Host 'Cancelled';exit 0}
 Push-Location $checkout
 try{
  & git add -- assets/signage assets/work assets/videos assets/video-posters
  if($LASTEXITCODE -ne 0){throw 'Git add failed'}
  & git diff --cached --quiet
  if($LASTEXITCODE -eq 0){Write-Host 'Already uploaded: nothing to change.' -ForegroundColor Green;exit 0}
  & git diff --cached --stat
  & git commit -m 'media: publish approved portfolio imagery and optimized videos'
  if($LASTEXITCODE -ne 0){throw 'Git commit failed; configure git user.name and user.email'}
  & git push origin main
  if($LASTEXITCODE -ne 0){throw 'Git push failed; no force push was attempted.'}
  Write-Host 'PUBLISHED. Check andrew.atstudioimpact.com after Vercel deployment.' -ForegroundColor Green
 }finally{Pop-Location}
}finally{Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue}
