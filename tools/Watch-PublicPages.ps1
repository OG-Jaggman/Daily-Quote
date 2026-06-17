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
  Format-Page $Event.SourceEventArgs.FullPath
}

$created = Register-ObjectEvent -InputObject $watcher -EventName Created -Action $action
$renamed = Register-ObjectEvent -InputObject $watcher -EventName Renamed -Action $action

Write-Host "Watching public folder for new .html files."
Write-Host "Press Ctrl+C to stop."

try {
  while ($true) {
    Wait-Event -Timeout 1 | Out-Null
  }
}
finally {
  Unregister-Event -SubscriptionId $created.Id -ErrorAction SilentlyContinue
  Unregister-Event -SubscriptionId $renamed.Id -ErrorAction SilentlyContinue
  $watcher.Dispose()
}
