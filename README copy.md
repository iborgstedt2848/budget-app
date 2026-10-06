# Budget App

A personal budgeting web app — single self-contained `index.html` (HTML + CSS +
vanilla JS, no build step, no framework). [Chart.js](https://www.chartjs.org/)
is loaded from a CDN for charts.

Live at: budget-with-isa.netlify.app

## What it does

- **Budget** — categories/subcategories with monthly and annual views (annual
  is just monthly × a yearly multiplier, and vice versa).
- **Tracker** — log expenses, salary, side income, and investments; see
  spending vs. budget by category.
- **Net Worth** — account balances, transfers, credit card payments,
  reimbursements.
- **Trends** — spending lookups by day/week/month/year/custom range.
- **Savings** — HYSA goal calculator.
- **Travel** — per-trip spending by category, with a full chronological
  transaction list.
- **Settings** — profile, income sources, payment methods, reimbursement
  methods, Google Sheets sync, backup/import/export.

## How it stores data

All data lives in the browser's `localStorage` on each device. There's no
backend by default — open it on two different devices and you'll have two
separate, unconnected copies of your data.

### Optional cross-device sync

Settings → "Google Sheets sync" connects the app to a Google Apps Script Web
App URL backed by a Google Sheet. The script that needs to be deployed in
your own Google Apps Script project is in [`google-apps-script/budget-sync.gs`](google-apps-script/budget-sync.gs).

To set it up:
1. Create a Google Sheet.
2. Extensions → Apps Script, paste in `budget-sync.gs`.
3. Deploy → New deployment → Web app → Execute as "Me" → Who has access
   "Anyone".
4. Paste the resulting `/exec` URL into the app's Settings → Google Sheets
   sync on every device you want kept in sync.

When you need to change the script later: **edit the deployment and pick
"New version" from the Version dropdown** before clicking Deploy — just
re-saving the code without doing this leaves the old version live at the same
URL.

## Deploying

This is a static site — no build step. Netlify (or any static host) just
needs to serve `index.html`. If this repo is connected to Netlify via Git,
every push to `main` deploys automatically.

## Local development

Open `index.html` directly in a browser, or serve the folder with any static
file server (e.g. `python3 -m http.server`) if you want it on `localhost`
instead of `file://`.
