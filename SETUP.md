# GitHub Pages Setup for TOTO Predictor

## Quick Setup Checklist

### ✅ Repository Setup
1. Ensure all files are committed and pushed to your main branch
2. Your repository should be public (or have GitHub Pro for private pages)

### ✅ Enable GitHub Pages
1. Go to `Settings` → `Pages`
2. Set Source: `Deploy from a branch`
3. Branch: `main`
4. Folder: `/ (root)`
5. Click `Save`

### ✅ Enable GitHub Actions  
1. Go to `Actions` tab
2. Click `I understand my workflows, go ahead and enable them` if prompted
3. The workflow will appear as "Update TOTO Results"

### ✅ Test the Setup
1. Your site will be available at: `https://[your-username].github.io/[repository-name]`
2. Manual trigger: Go to `Actions` → `Update TOTO Results` → `Run workflow`

## First Time Setup Commands

If you're setting this up locally and pushing to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit with TOTO predictor and GitHub Actions"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/[username]/[repository].git

# Push to GitHub
git push -u origin main
```

## Manual Workflow Trigger

After setup, you can manually update results:

1. Go to your repository on GitHub
2. Click `Actions` tab
3. Click `Update TOTO Results` workflow
4. Click `Run workflow` button
5. Keep `main` branch selected
6. Click `Run workflow`

The workflow will run and update your CSV file automatically!

## Verification

After GitHub Pages is enabled:
- Visit your live site URL
- Check that the page loads correctly
- The workflow should run daily at 10 PM Singapore time
- Check `Actions` tab for successful runs
