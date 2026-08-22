# Personal Ledger — standalone app

A small installable web app for tracking payments received and paid across
your bank accounts and cash. It runs entirely in your phone's browser.

## Where your data lives

All accounts and transactions are stored **only on your device**, in the
browser's local storage. Nothing is sent to any server — not Claude's, not
Google's, not anyone's — unless you tap **Back up now**, which creates a
JSON file that you choose where to send.

## How to get it on your phone (free, ~5 minutes)

The easiest way to make this installable (so it gets a home-screen icon and
works offline) is to host these files somewhere with a `https://` address.
**GitHub Pages** is free and simple:

1. Go to github.com and create a free account if you don't have one.
2. Create a new repository (e.g. `my-ledger`) — keep it **public** (Pages on
   the free tier needs public repos) — nothing about your transactions lives
   in the code, so this is safe.
3. Upload **all 9 files** from this folder (`index.html`, `app.js`,
   `manifest.json`, `sw.js`, `icon.svg`, `icon-192.png`, `icon-512.png`,
   `icon-192-maskable.png`, `icon-512-maskable.png`) to the repo — drag and
   drop them on the GitHub "Add file → Upload files" screen. All of them
   matter — missing an icon file is what stops Android from offering a
   real install.
4. In the repo, go to **Settings → Pages**, set Source to your main branch,
   and save. GitHub gives you a URL like
   `https://yourusername.github.io/my-ledger/`.
5. Open that URL on your phone **in Chrome**.
6. Tap the **⋮** menu → **Install app** (wording may say "Add to Home
   screen" on older Chrome versions). Confirm **Install** on the popup.
7. Find the app icon on your home screen or app drawer, and open from there
   (not from the browser or a notification).

If you'd installed an earlier version before these icon files existed,
uninstall/remove that shortcut first (long-press it → Remove/Uninstall),
then reinstall after re-uploading these files — otherwise Chrome may keep
using the old, broken install.

You now have an app icon that opens straight into your ledger, works
offline, and keeps its data on your phone between launches.

## Backing up to Google Drive

Open **Settings** (gear icon) inside the app → **Back up now**.

- On Android, this usually opens your phone's share sheet — pick **Drive**
  and it saves straight there.
- On iPhone, it downloads a `.json` file. Open the **Files** app, find it
  in Downloads, and use **Share → Save to Drive** (or move it into your
  Drive folder if you have Drive set up as a Files location).

To restore on a new phone: install the app there the same way, open
**Settings → Restore from a backup file**, and pick the JSON file from
Drive.

## If you'd rather not use GitHub

You can also just open `index.html` directly on your phone (e.g. by
emailing yourself the file and opening it) — but without hosting over
`https://`, the "install as app" and offline features won't work, and
you'll just get a normal browser tab. The data storage and backup features
work either way.
