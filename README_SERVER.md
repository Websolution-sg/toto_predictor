# TOTO Predictor with Server-Side CSV Updates

# TOTO Predictor with GitHub Pages Auto-Updates

This application fetches the latest Singapore TOTO results and automatically updates the CSV file using GitHub Actions.

## Setup Instructions

### 1. Enable GitHub Pages
1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "Deploy from a branch"
4. Select "main" branch and "/" (root) folder
5. Save the settings

### 2. Enable GitHub Actions
1. Go to the "Actions" tab in your repository
2. Enable workflows if prompted
3. The workflow will automatically run daily at 10 PM SGT

### 3. Access the Application

Your app will be available at: `https://[username].github.io/[repository-name]`

## How It Works

### Frontend
- Automatically checks for updated CSV data on page load
- Updates the display with the latest results
- Uses cache-busting to ensure fresh data

### GitHub Action
- Runs daily at 10 PM SGT (after TOTO draws)
- Scrapes Singapore Pools website for latest results
- Updates the CSV file automatically
- Commits changes back to the repository

## GitHub Action Workflow

The workflow (`.github/workflows/update-toto-results.yml`) does the following:

1. **Scheduled Execution**: Runs every day at 10 PM SGT
2. **Manual Trigger**: Can be manually triggered from Actions tab
3. **Web Scraping**: Fetches latest results from Singapore Pools website
4. **CSV Update**: Adds new results to the top of `totoResult.csv`
5. **Auto-Commit**: Commits and pushes changes automatically

## Manual Trigger

You can manually trigger the workflow:
1. Go to "Actions" tab in your repository
2. Click "Update TOTO Results" workflow
3. Click "Run workflow" button
4. Select the main branch and click "Run workflow"

## File Structure

```
├── .github/workflows/
│   └── update-toto-results.yml  # GitHub Action workflow
├── index.html                   # Frontend application
├── totoResult.csv              # Historical TOTO results data
├── README_SERVER.md            # This file
└── README.md                   # Original README
```

## Features

- ✅ Automatic daily updates via GitHub Actions
- ✅ GitHub Pages hosting (no server required)
- ✅ Web scraping from Singapore Pools website
- ✅ Duplicate prevention
- ✅ Manual workflow trigger option
- ✅ Cache-busting for fresh data
- ✅ Real-time display updates

## Monitoring

### Check Workflow Status
1. Go to "Actions" tab in your repository
2. View the "Update TOTO Results" workflow runs
3. Check logs for any errors or successful updates

### View Recent Updates
- Check the commit history to see when CSV was last updated
- Each update includes a timestamp in the commit message

## Troubleshooting

### Workflow Not Running
- Ensure GitHub Actions are enabled in repository settings
- Check if the workflow file is in the correct location
- Verify the cron schedule is correct for your timezone

### No New Results
- The workflow only updates if new results are found
- Singapore Pools website structure may change (requires workflow update)
- Check workflow logs for error messages

### Manual Override
- Use the manual entry function in the frontend for immediate updates
- Manual entries are temporary (until next workflow run)

## Notes

- The workflow uses web scraping since Singapore Pools API may not be publicly available
- Updates are committed with GitHub Action user credentials
- The CSV file maintains chronological order (newest first)
- GitHub Pages may take a few minutes to reflect CSV changes
