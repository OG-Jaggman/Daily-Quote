# Daily Quote — Cloudflare Pages Static Version

This is the static version meant for Cloudflare Pages.

## Quote Picking Info

The website picks one quote each day based on the date.

## Dark / Light Mode

A button in the top navigation switches between light mode and dark mode.
The browser remembers the user's choice with localStorage.


## Site-wide Dark / Light Mode

Every page includes `theme.js`, which:
- Adds the Dark Mode / Light Mode button behavior
- Saves the choice in `localStorage`
- Applies the saved mode on every page
