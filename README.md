# Daily Quote — Cloudflare Pages Static Version

This is the static version meant for Cloudflare Pages.

Use the `public/` folder as the Cloudflare Pages deploy folder.

If uploading manually, upload the contents of `public/`.

Includes:
- `public/index.html`
- `public/about.html`
- `public/time.html`
- `public/shutdown.html`
- `public/quotes.json`
- `public/app.js`
- `public/style.css`
- logo and favicon files in `public/`

Not included:
- Node.js server files
- Raspberry Pi/server scripts
- AI tools/admin links

Edit quotes in `public/quotes.json`. The website picks one quote each day based on the date.

## Navigation Pages

Edit `public/Pages.txt` to control the pages shown in the top navigation bar.

Use this format for each navigation item:

```text
File name = "something.html" Title = "Something"
```

Use `index.html` for the home page.

## Creating A New Page

Use the helper script to create a new public page with the same layout, theme button, announcement bar, and navigation setup as the other pages.

```powershell
.\tools\New-PublicPage.ps1 -FileName "example.html" -Title "Example"
```

That creates `public/example.html` and adds this line to `public/Pages.txt`:

```text
File name = "example.html" Title = "Example"
```

To create a page without adding it to the navigation bar, add `-SkipNavigation`.

If you already created a plain `.html` file in `public/`, format it with:

```powershell
.\tools\Format-PublicPage.ps1 -FileName "note.html"
```

To automatically format new `.html` files while you work, keep this watcher running:

```powershell
.\tools\Watch-PublicPages.ps1
```

When the watcher sees a new `.html` file in `public/`, it adds the shared layout and navigation setup, then adds the page to `public/Pages.txt`.


## Dark / Light Mode

A button in the top navigation switches between light mode and dark mode.
The browser remembers the user's choice with localStorage.


## Site-wide Dark / Light Mode

Every page includes `theme.js`, which:
- Adds the Dark Mode / Light Mode button behavior
- Saves the choice in `localStorage`
- Applies the saved mode on every page
