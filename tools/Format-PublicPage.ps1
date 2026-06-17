[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [Parameter(Mandatory = $true)]
  [string]$FileName,

  [string]$Title,

  [string]$NavTitle,

  [switch]$SkipNavigation,

  [switch]$Force
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$publicDir = Join-Path $repoRoot "public"
$pagesFile = Join-Path $publicDir "Pages.txt"

function ConvertTo-Title([string]$Name) {
  $baseName = [System.IO.Path]::GetFileNameWithoutExtension($Name)
  $words = $baseName -replace "[-_]+", " "
  return (Get-Culture).TextInfo.ToTitleCase($words)
}

function Get-PageBody([string]$RawContent) {
  if ($RawContent -match "(?is)<body[^>]*>(.*?)</body>") {
    return $Matches[1].Trim()
  }

  if ($RawContent -match "(?is)<html|<!doctype") {
    return "<p class=""lead"">Replace this text with the content for this page.</p>"
  }

  $encoded = [System.Net.WebUtility]::HtmlEncode($RawContent.Trim())
  if ([string]::IsNullOrWhiteSpace($encoded)) {
    return "<p class=""lead"">Replace this text with the content for this page.</p>"
  }

  return "<p class=""lead"">$encoded</p>"
}

function Add-ToNavigation([string]$Name, [string]$Label) {
  if ($SkipNavigation) { return }

  $navLine = 'File name = "' + $Name + '" Title = "' + $Label.Replace('"', '\"') + '"'
  $existingPagesText = if (Test-Path -LiteralPath $pagesFile) {
    Get-Content -LiteralPath $pagesFile -Raw
  } else {
    ""
  }

  if ($existingPagesText -notmatch [regex]::Escape('File name = "' + $Name + '"')) {
    Add-Content -LiteralPath $pagesFile -Value $navLine -Encoding utf8
    Write-Host "Added navigation title: $Label"
  }
}

if (-not (Test-Path -LiteralPath $publicDir)) {
  throw "Could not find public folder: $publicDir"
}

if ($FileName -notmatch "^[A-Za-z0-9._-]+\.html$") {
  throw 'FileName must be a simple .html file name, like "example.html".'
}

$targetPath = Join-Path $publicDir $FileName

if (-not (Test-Path -LiteralPath $targetPath)) {
  throw "Could not find page: $targetPath"
}

if ([string]::IsNullOrWhiteSpace($Title)) {
  $Title = ConvertTo-Title $FileName
}

if ([string]::IsNullOrWhiteSpace($NavTitle)) {
  $NavTitle = $Title
}

$rawContent = Get-Content -LiteralPath $targetPath -Raw

if (-not $Force -and $rawContent -match "data-site-page") {
  Add-ToNavigation $FileName $NavTitle
  Write-Host "Already formatted: public/$FileName"
  return
}

$safeTitle = [System.Net.WebUtility]::HtmlEncode($Title)
$safeNavTitle = [System.Net.WebUtility]::HtmlEncode($NavTitle)
$bodyContent = Get-PageBody $rawContent

$html = @"
<!DOCTYPE html>
<html lang="en" data-site-page>
<head>
  <title>$safeTitle | Daily Quote</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <script src="/theme.js"></script>
  <script src="/nav.js"></script>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <main class="page-shell">
    <div class="announcement-bar" role="status">
      <span>This website may permanently shut down on January 1, 2027 at 12:30 P.M. EST.</span>
      <a href="/shutdown.html">Learn more</a>
    </div>

    <header class="topbar">
      <a class="brand" href="/">
        <img src="/logo.png" alt="daily-quote.today logo">
        <span class="brand-text">
          <strong>daily-quote.today</strong>
          <span>A fresh quote every day</span>
        </span>
      </a>
      <nav class="nav" aria-label="Main navigation" data-pages-nav>
        <a href="/">Home</a>
        <a class="secondary" href="/about.html">About</a>
        <a class="secondary" href="/time.html">Time</a>
        <a href="/shutdown.html">Donate/Support</a>
        <button class="theme-toggle" id="themeToggle" type="button" data-theme-toggle>Dark Mode</button>
      </nav>
    </header>

    <section class="hero">
      <article class="card">
        <span class="eyebrow">$safeNavTitle</span>
        <h1>$safeTitle</h1>
        $bodyContent
      </article>

      <aside class="card logo-panel">
        <img src="/logo.png" alt="daily-quote.today logo">
        <p>daily-quote.today</p>
      </aside>
    </section>

    <p class="footer">daily-quote.today</p>
  </main>
</body>
</html>
"@

if ($PSCmdlet.ShouldProcess($targetPath, "Format public page")) {
  Set-Content -LiteralPath $targetPath -Value $html -Encoding utf8
  Add-ToNavigation $FileName $NavTitle
  Write-Host "Formatted public page: public/$FileName"
}
