// Google Apps Script to sync quotes from Google Sheet to GitHub quotes.json
// Set up: 
// 1. Go to your Google Sheet → Extensions → Apps Script
// 2. Copy this entire code into the script editor
// 3. Follow the setup instructions below

const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN_HERE'; // See setup instructions
const GITHUB_REPO = 'OG-Jaggman/Daily-Quote';
const GITHUB_FILE_PATH = 'public/quotes.json';
const GITHUB_BRANCH = 'main';

// Column mapping - adjust these based on your Google Form columns
const QUOTE_COLUMN = 2;      // Column B - the quote text
const AUTHOR_COLUMN = 3;     // Column C - the author name

/**
 * Run this once after setup to test the connection
 */
function testConnection() {
  Logger.log('Testing GitHub connection...');
  try {
    const currentQuotes = fetchCurrentQuotes();
    Logger.log('Success! Current quotes count: ' + currentQuotes.quotes.length);
  } catch (error) {
    Logger.log('Error: ' + error);
  }
}

/**
 * Main function - syncs new quotes to GitHub
 * Can be triggered manually or via form submission
 */
function syncQuotesToGitHub() {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    // Skip header row (row 1) and fetch current quotes
    const newQuotes = [];
    const startRow = 2; // Start from row 2 (after header)
    
    for (let i = startRow; i < data.length; i++) {
      const quote = data[i][QUOTE_COLUMN - 1]?.toString().trim();
      const author = data[i][AUTHOR_COLUMN - 1]?.toString().trim();
      
      // Only add if both fields are filled
      if (quote && author) {
        newQuotes.push({
          quote: quote,
          author: author
        });
      }
    }
    
    if (newQuotes.length === 0) {
      Logger.log('No new quotes found');
      return;
    }
    
    Logger.log('Found ' + newQuotes.length + ' quotes to sync');
    
    // Fetch current quotes from GitHub
    const currentQuotes = fetchCurrentQuotes();
    
    // Merge: add only new quotes (avoid duplicates)
    const mergedQuotes = mergeQuotes(currentQuotes.quotes, newQuotes);
    
    if (mergedQuotes.length > currentQuotes.quotes.length) {
      const updatedContent = JSON.stringify({ quotes: mergedQuotes }, null, 2);
      updateGitHubFile(updatedContent);
      Logger.log('Successfully synced ' + (mergedQuotes.length - currentQuotes.quotes.length) + ' new quotes');
    } else {
      Logger.log('No new unique quotes to add');
    }
    
  } catch (error) {
    Logger.log('Error in syncQuotesToGitHub: ' + error);
    sendErrorNotification('Sync failed: ' + error);
  }
}

/**
 * Fetch current quotes.json from GitHub
 */
function fetchCurrentQuotes() {
  const url = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_FILE_PATH;
  
  const options = {
    method: 'get',
    headers: {
      'Authorization': 'token ' + GITHUB_TOKEN,
      'Accept': 'application/vnd.github.v3.raw'
    },
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  
  if (response.getResponseCode() !== 200) {
    throw new Error('Failed to fetch quotes.json: ' + response.getContentText());
  }
  
  return JSON.parse(response.getContentText());
}

/**
 * Merge new quotes with existing ones, avoiding duplicates
 */
function mergeQuotes(existingQuotes, newQuotes) {
  const existingSet = new Set(existingQuotes.map(q => q.quote + ' - ' + q.author));
  
  const merged = [...existingQuotes];
  
  for (const quote of newQuotes) {
    const key = quote.quote + ' - ' + quote.author;
    if (!existingSet.has(key)) {
      merged.push(quote);
      existingSet.add(key);
    }
  }
  
  return merged;
}

/**
 * Update quotes.json on GitHub
 */
function updateGitHubFile(content) {
  const url = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_FILE_PATH;
  
  // Get current file SHA (needed for updates)
  const getShaResponse = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: {
      'Authorization': 'token ' + GITHUB_TOKEN,
      'Accept': 'application/vnd.github.v3+json'
    },
    muteHttpExceptions: true
  });
  
  const fileData = JSON.parse(getShaResponse.getContentText());
  const currentSha = fileData.sha;
  
  // Update the file
  const payload = {
    message: 'Add new quotes from Google Form',
    content: Utilities.base64Encode(content),
    sha: currentSha,
    branch: GITHUB_BRANCH
  };
  
  const options = {
    method: 'put',
    headers: {
      'Authorization': 'token ' + GITHUB_TOKEN,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  
  if (response.getResponseCode() !== 200) {
    throw new Error('Failed to update file: ' + response.getContentText());
  }
}

/**
 * Send error notification (optional)
 */
function sendErrorNotification(message) {
  // You can uncomment this to send yourself an email on error
  // MailApp.sendEmail(Session.getActiveUser().getEmail(), 'Quote Sync Error', message);
}

/**
 * Set up form submission trigger (run this once)
 * This will automatically run syncQuotesToGitHub when forms are submitted
 */
function setupFormSubmitTrigger() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const form = FormApp.openByUrl('YOUR_FORM_URL_HERE'); // Replace with your form URL
  
  // Create trigger
  ScriptApp.newTrigger('syncQuotesToGitHub')
    .forForm(form)
    .onFormSubmit()
    .create();
  
  Logger.log('Form submission trigger created!');
}
