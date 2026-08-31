# Google Apps Script Setup Guide

## Overview
This guide walks you through setting up automatic quote syncing from your Google Form/Sheet to `quotes.json` on GitHub.

## Step 1: Create a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. **Name:** `Google Sheets Quote Sync`
4. **Expiration:** 90 days (or whatever you prefer)
5. **Scopes:** Check `repo` (full control of private repositories)
6. Click "Generate token"
7. **Copy the token** - you'll need it in the next step (you won't see it again!)

## Step 2: Get Your Google Form's URL

1. Open your Google Form
2. Click the three dots (⋮) → "Get pre-filled link" or copy the form URL from your browser
3. You'll need this for the trigger setup

## Step 3: Open Google Apps Script

1. Go to your Google Sheet (the one receiving form responses)
2. Click **Extensions** → **Apps Script**
3. This opens a new tab with the script editor

## Step 4: Add the Script Code

1. Delete any template code in the editor
2. Copy the entire contents of `GoogleAppsScript_SyncToQuotes.gs` from this repo
3. Paste it into the script editor

## Step 5: Configure the Script

1. Find this line near the top:
   ```javascript
   const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN_HERE';
   ```
2. Replace `YOUR_GITHUB_TOKEN_HERE` with the token you created in Step 1

3. Check the column numbers (around line 8-9):
   ```javascript
   const QUOTE_COLUMN = 2;      // Column B - adjust if your quote is elsewhere
   const AUTHOR_COLUMN = 3;     // Column C - adjust if your author is elsewhere
   ```
   - If your Google Form submits quote text in column B and author in column C, leave these as is
   - Otherwise, adjust: Column A = 1, Column B = 2, Column C = 3, etc.

## Step 6: Test the Connection

1. In the script editor, find the dropdown that says `Select function` at the top
2. Change it to `testConnection`
3. Click the ▶️ **Run** button
4. Approve the permissions when prompted
5. Check the **Execution log** at the bottom - you should see success message

## Step 7: Set Up Form Submission Trigger (Automatic Syncing)

**Option A: Automatic (Recommended)**
1. In the script editor, change function to `setupFormSubmitTrigger`
2. Find this line and replace it with your form URL:
   ```javascript
   const form = FormApp.openByUrl('YOUR_FORM_URL_HERE');
   ```
3. Run the function
4. Now quotes will sync **automatically** when someone submits the form!

**Option B: Manual (if Option A doesn't work)**
1. In the script editor, click the **clock icon** ⏱️ (Triggers)
2. Click **+ Create new trigger**
3. Set it up as:
   - Function: `syncQuotesToGitHub`
   - Deployment: Head
   - Event source: From form
   - Event type: On form submit
4. Click Save

## Step 8: Test It!

1. Submit a test quote through your Google Form
2. Wait a few seconds
3. Go to your GitHub repo and refresh `public/quotes.json`
4. Your new quote should appear!

---

## Troubleshooting

**"Authorization failed"**
- Check that your GitHub token is correct
- Make sure the token hasn't expired
- Re-create a new token if needed

**"Script doesn't have permission to access spreadsheet"**
- When running the script for the first time, Google will ask for permissions
- Click "Review permissions" and approve

**No quotes appearing**
- Check your column numbers (`QUOTE_COLUMN` and `AUTHOR_COLUMN`)
- Make sure your Google Form is submitting to the correct columns
- Check the **Execution log** for errors

**Duplicates appearing**
- The script checks for exact duplicates, so small changes create new entries
- If you see duplicates, you can manually remove them from `quotes.json`

## Manual Sync (If Needed)

If you want to manually run the sync:
1. Go to Apps Script editor
2. Select `syncQuotesToGitHub` from the function dropdown
3. Click Run

---

## Next Steps

- Once this is working, you can customize the script further (e.g., add validation, formatting)
- If you run into issues, we can switch to the GitHub Actions approach instead
