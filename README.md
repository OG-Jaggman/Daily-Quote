# Daily Quote — Cloudflare Pages Static Version

This is the static version meant for Cloudflare Pages.

Upload the contents of this folder, or upload this zip to Cloudflare Pages.

Includes:
- index.html
- about.html
- time.html
- quotes.json
- app.js
- style.css
- logo and favicon files

Not included:
- Node.js server files
- Raspberry Pi scripts
- GPIO code
- Fire alarm/breaker panel code
- AI tools/admin links

Edit quotes in quotes.json. The website picks one quote each day based on the date.


## Dark / Light Mode

A button in the top navigation switches between light mode and dark mode.
The browser remembers the user's choice with localStorage.


## Site-wide Dark / Light Mode

Every page includes `theme.js`, which:
- Adds the Dark Mode / Light Mode button behavior
- Saves the choice in `localStorage`
- Applies the saved mode on every page
