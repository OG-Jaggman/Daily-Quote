[CmdletBinding()]
param(
  [switch]$SkipExistingScan
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$publicDir = Join-Path $repoRoot "public"
$formatter = Join-Path $PSScriptRoot "Format-PublicPage.ps1"

if (-not (Test-Path -LiteralPath $publicDir)) {
  throw "Could not find public folder: $publicDir"
}

function Format-Page([string]$Path) {
  if (-not $Path.EndsWith(".html", [System.StringComparison]::OrdinalIgnoreCase)) { return }
  if (-not (Test-Path -LiteralPath $Path)) { return }

  Start-Sleep -Milliseconds 250

  $fileName = [System.IO.Path]::GetFileName($Path)
  & $formatter -FileName $fileName
}

if (-not $SkipExistingScan) {
  Get-ChildItem -LiteralPath $publicDir -Filter "*.html" -File | ForEach-Object {
    $content = Get-Content -LiteralPath $_.FullName -Raw
    if ($content -notmatch "data-site-page" -and $content -notmatch "data-pages-nav") {
      Format-Page $_.FullName
    }
  }
}

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $publicDir
$watcher.Filter = "*.html"
$watcher.IncludeSubdirectories = $false
$watcher.EnableRaisingEvents = $true

$action = {
  $path = $Event.SourceEventArgs.FullPath
  if (-not $path.EndsWith(".html", [System.StringComparison]::OrdinalIgnoreCase)) { return }
  if (-not (Test-Path -LiteralPath $path)) { return }

  Start-Sleep -Milliseconds 500

  $content = Get-Content -LiteralPath $path -Raw -ErrorAction SilentlyContinue
  if ($content -match "data-site-page" -or $content -match "data-pages-nav") { return }

  $fileName = [System.IO.Path]::GetFileName($path)
  & $Event.MessageData.Formatter -FileName $fileName
}

$messageData = @{
  Formatter = $formatter
}

$created = Register-ObjectEvent -InputObject $watcher -EventName Created -Action $action -MessageData $messageData
$changed = Register-ObjectEvent -InputObject $watcher -EventName Changed -Action $action -MessageData $messageData
$renamed = Register-ObjectEvent -InputObject $watcher -EventName Renamed -Action $action -MessageData $messageData

Write-Host "Watching public folder for new .html files."
Write-Host "Press Ctrl+C to stop."

try {
  while ($true) {
    Wait-Event -Timeout 1 | Out-Null
  }
}
finally {
  Unregister-Event -SubscriptionId $created.Id -ErrorAction SilentlyContinue
  Unregister-Event -SubscriptionId $changed.Id -ErrorAction SilentlyContinue
  Unregister-Event -SubscriptionId $renamed.Id -ErrorAction SilentlyContinue
  $watcher.Dispose()
}
