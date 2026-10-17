# Publish the sixth Andrew HSE portfolio video to the independent public repository.
# Requires local FFmpeg/FFprobe and authenticated Git for Windows.
# Example: powershell -NoProfile -ExecutionPolicy Bypass -File .\Publish-Approved-Video.ps1 -SourceFile "C:\Videos\2026-09-20-131821601.mp4"
param(
  [Parameter(Mandatory=$true)][string]$SourceFile
)
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest

$videoId='andrew-hse-selected-video-20260920-131821601'
$sourceName='2026-09-20-131821601.mp4'
$repo='https://github.com/atstudioimpact0/andrew-hse-portfolio.git'
if (-not (Test-Path -LiteralPath $SourceFile -PathType Leaf)) {throw "Video missing: $SourceFile"}
if ((Split-Path -Leaf $SourceFile) -cne $sourceName) {throw "Unexpected input: expected $sourceName"}
foreach($tool in @('ffmpeg','ffprobe','git')){
  if(-not (Get-Command $tool -ErrorAction SilentlyContinue)){throw "Missing dependency: $tool"}
}
$bytes=(Get-Item -LiteralPath $SourceFile).Length
if($bytes -lt 10000 -or $bytes -gt 200MB){throw 'Invalid source file size'}
$probeText=(& ffprobe -v error -show_entries 'format=duration:stream=codec_type,codec_name,width,height' -of json $SourceFile) -join [Environment]::NewLine
if($LASTEXITCODE -ne 0){throw 'ffprobe could not inspect input'}
$probe=$probeText | ConvertFrom-Json
$duration=[double]$probe.format.duration
$visual=@($probe.streams|Where-Object{$_.codec_type -eq 'video'}|Select-Object -First 1)
if($duration -le 0 -or $visual.Count -lt 1){throw 'Invalid or missing video stream'}
Write-Host ("Video 06: {0:N1} seconds, {1:N1} MB" -f $duration, ($bytes/1MB))
Write-Host 'The repository and website are PUBLIC. Review people, logos, footage ownership, and site-sensitive details before proceeding.' -ForegroundColor Yellow
$approval=Read-Host 'Type PUBLISH to confirm public release of this exact video'
if($approval -cne 'PUBLISH'){Write-Host 'Canceled without changes.';exit 0}
$tmp=Join-Path ([IO.Path]::GetTempPath()) ('andrew-hse-video06-'+[Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp -Force | Out-Null
try{
  $mp4=Join-Path $tmp ($videoId+'.mp4')
  $poster=Join-Path $tmp ($videoId+'.webp')
  & ffmpeg -hide_banner -loglevel error -nostdin -y -i $SourceFile -map '0:v:0' -map '0:a:0?' -vf "scale=w='min(1280,iw)':h=-2" -c:v libx264 -preset medium -crf 27 -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart $mp4
  if($LASTEXITCODE -ne 0 -or -not (Test-Path $mp4)){throw 'MP4 encoding failed'}
  if((Get-Item $mp4).Length -gt 30MB){
    & ffmpeg -hide_banner -loglevel error -nostdin -y -i $SourceFile -map '0:v:0' -map '0:a:0?' -vf "scale=w='min(960,iw)':h=-2" -c:v libx264 -preset medium -crf 31 -pix_fmt yuv420p -c:a aac -b:a 80k -movflags +faststart $mp4
    if($LASTEXITCODE -ne 0){throw 'Second MP4 encoding failed'}
  }
  if((Get-Item $mp4).Length -gt 30MB){throw 'Optimized clip exceeds 30MB; manual compression needed'}
  $seek=[Math]::Min(1.4,[Math]::Max(0.1,$duration/4))
  & ffmpeg -hide_banner -loglevel error -nostdin -y -ss $seek -i $mp4 -frames:v 1 -vf "scale=w='min(900,iw)':h=-2" -c:v libwebp -quality 80 $poster
  if($LASTEXITCODE -ne 0 -or -not (Test-Path $poster)){throw 'WebP cover creation failed'}
  Write-Host ("Optimized {0:N1} MB. WebP poster {1:N0} KB" -f ((Get-Item $mp4).Length/1MB), ((Get-Item $poster).Length/1KB))
  $checkout=Join-Path $tmp 'source'
  & git clone --quiet --depth 1 --branch main $repo $checkout
  if($LASTEXITCODE -ne 0){throw 'Git clone failed'}
  $manifestFile=Join-Path $checkout 'data/videos.json'
  $data=(Get-Content -LiteralPath $manifestFile -Raw -Encoding UTF8|ConvertFrom-Json)
  $found=@($data.videos|Where-Object{$_.id -eq $videoId}|Select-Object -First 1)
  if($found.Count -ne 1 -or $found[0].owner_approved -ne $true){throw 'Video ID has no approved manifest record'}
  $videoPath="assets/videos/$videoId.mp4"
  $coverPath="assets/video-posters/$videoId.webp"
  if($found[0].src -ne $videoPath){throw 'Manifest filename mismatch'}
  foreach($folder in @('assets/videos','assets/video-posters')){
    New-Item -ItemType Directory -Path (Join-Path $checkout $folder) -Force | Out-Null
  }
  Copy-Item -LiteralPath $mp4 -Destination (Join-Path $checkout $videoPath) -Force
  Copy-Item -LiteralPath $poster -Destination (Join-Path $checkout $coverPath) -Force
  $found[0]|Add-Member -NotePropertyName poster -NotePropertyValue $coverPath -Force
  $found[0]|Add-Member -NotePropertyName duration_seconds -NotePropertyValue ([Math]::Round($duration,2)) -Force
  $found[0]|Add-Member -NotePropertyName file_ready -NotePropertyValue $true -Force
  $found[0]|Add-Member -NotePropertyName playback_tested -NotePropertyValue $false -Force
  $found[0]|Add-Member -NotePropertyName optimized_size_bytes -NotePropertyValue ((Get-Item $mp4).Length) -Force
  $data|ConvertTo-Json -Depth 20|Set-Content -LiteralPath $manifestFile -Encoding UTF8
  Push-Location $checkout
  try {
    & git add -- $videoPath $coverPath 'data/videos.json'
    if($LASTEXITCODE -ne 0){throw 'Unable to stage media'}
    & git diff --cached --quiet
    if($LASTEXITCODE -eq 0){Write-Host 'Identical media already present.';exit 0}
    & git commit -m "media: publish approved HSE portfolio video 06"
    if($LASTEXITCODE -ne 0){throw 'Git commit failed'}
    & git push origin main
    if($LASTEXITCODE -ne 0){throw 'Git push failed; no remote publication'}
  } finally{Pop-Location}
  Write-Host 'GitHub media uploaded; wait for Vercel deployment and confirm real playback in English and Arabic.' -ForegroundColor Green
  Write-Host 'https://andrew.atstudioimpact.com/#video-library'
} finally{
  Remove-Item -LiteralPath $tmp -Force -Recurse -ErrorAction SilentlyContinue
}