[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [Parameter(Mandatory = $true)]
  [string]$FileName,

  [Parameter(Mandatory = $true)]
  [string]$Title,

  [string]$NavTitle = $Title,

  [switch]$SkipNavigation
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$publicDir = Join-Path $repoRoot "public"
$pagesFile = Join-Path $publicDir "Pages.txt"

if (-not (Test-Path -LiteralPath $publicDir)) {
  throw "Could not find public folder: $publicDir"
}

if ($FileName -notmatch "^[A-Za-z0-9._-]+\.html$") {
  throw 'FileName must be a simple .html file name, like "example.html".'
}

$targetPath = Join-Path $publicDir $FileName

if (Test-Path -LiteralPath $targetPath) {
  throw "Page already exists: $targetPath"
}

$safeTitle = [System.Net.WebUtility]::HtmlEncode($Title)
$safeNavTitle = [System.Net.WebUtility]::HtmlEncode($NavTitle)
$eyebrow = $safeNavTitle

$html = @"
<!DOCTYPE html>
<html lang="en">
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
        <span class="eyebrow">$eyebrow</span>
        <h1>$safeTitle</h1>
        <p class="lead">Replace this text with the content for this page.</p>
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

$createdPage = $false
$addedNavigation = $false

if ($PSCmdlet.ShouldProcess($targetPath, "Create public page")) {
  Set-Content -LiteralPath $targetPath -Value $html -Encoding utf8
  $createdPage = $true
}

if (-not $SkipNavigation) {
  $navLine = 'File name = "' + $FileName + '" Title = "' + $NavTitle.Replace('"', '\"') + '"'
  $existingPagesText = if (Test-Path -LiteralPath $pagesFile) {
    Get-Content -LiteralPath $pagesFile -Raw
  } else {
    ""
  }

  if ($existingPagesText -notmatch [regex]::Escape('File name = "' + $FileName + '"')) {
    if ($PSCmdlet.ShouldProcess($pagesFile, "Add page to navigation")) {
      Add-Content -LiteralPath $pagesFile -Value $navLine -Encoding utf8
      $addedNavigation = $true
    }
  }
}

if ($createdPage) {
  Write-Host "Created public page: public/$FileName"
}

if ($addedNavigation) {
  Write-Host "Added navigation title: $NavTitle"
}
