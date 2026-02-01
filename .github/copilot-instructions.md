# Singapore TOTO Predictor - AI Coding Agent Instructions

## Project Overview
This is a web-based Singapore TOTO lottery prediction system:
- **TOTO Predictor** (`index.html`) - Main 6-number lottery predictor 

## Core Architecture

### Data Structure
- `totoResult.csv`: TOTO draws in format `date,n1,n2,n3,n4,n5,n6,additional` 
- CSV files are auto-updated via GitHub Actions on Mon/Thu at 1:00 UTC

### Prediction Algorithm Foundation
All prediction methods use **base numbers** as anchors:
- Fixed base numbers: `[16, 22, 10]` (scientifically selected high-frequency numbers)
- Base numbers excluded from final predictions to avoid duplicates
- Used for compatibility scoring (co-occurrence patterns)

### Core Prediction Methods

#### 1. Frequency + Compatibility (Primary Algorithm)
```javascript
// Standard scoring pattern used across codebase
const scores = freq.map((f, i) => f + compat[i]);
const suggestions = scores
  .map((score, n) => ({ n, score, freq: freq[n], compat: compat[n] }))
  .filter(o => o.n >= 1 && o.n <= 49 && !bases.includes(o.n))
  .sort((a, b) => b.score - a.score)
  .slice(0, 6);
```

#### 2. Enhanced Ensemble (Recommended)
Multi-factor scoring: frequency (30%) + weighted recency (35%) + compatibility (25%) + patterns (10%)

#### 3. Weighted Recent Analysis
Time-weighted frequency with recent draws having higher impact

#### 4. Hot/Cold Balance
Temperature-based analysis comparing recent vs overall frequency rates

## Critical Development Patterns

### File Naming Conventions
- `*_predictor.html` - Main application files
- `*_validator.js` - Algorithm validation scripts
- `*_analysis.js` - Data analysis utilities
- `check_*.js` - Verification scripts
- `auto-*` - Automation scripts

### Key Workflows

#### Local Development
```bash
# Test predictions locally
node comprehensive_prediction_validation.mjs

# Validate algorithms match website
node frequency_compatibility_validator.js

# Check CSV integrity
node comprehensive_csv_validation.js
```

#### Deployment via VS Code Tasks
- **"Deploy TOTO Updates"** - Full deployment pipeline
- **"Check Git Status"** - Pre-deployment verification
- **"Add CSV Changes"** - Stage CSV updates only

#### Auto-Update Pipeline
1. GitHub Action fetches latest Singapore Pools results
2. Updates CSV files with robust parsing
3. Auto-commits with structured message format
4. Deploys to GitHub Pages

### Data Processing Standards

#### CSV Parsing Requirements
- Handle Singapore Pools format variations
- Robust date parsing (multiple formats)
- Validate number ranges (TOTO: 1-49)
- Preserve draw sequence integrity

#### Prediction Validation Pattern
All new algorithms must implement validation against historical results:
```javascript
function validatePrediction(predicted, actual) {
  const matches = predicted.filter(n => actual.includes(n)).length;
  return { matches, accuracy: (matches / 6) * 100 };
}
```

## Integration Points

### External Dependencies
- **Singapore Pools**: Source for lottery results
- **Chart.js**: Visualization library for prediction charts
- **GitHub Pages**: Hosting platform
- **GitHub Actions**: Automated data updates

### Cross-Component Communication
- Common CSV validation utilities
- Unified analytics and accuracy tracking

## Critical Implementation Details

### Browser Compatibility Requirements
- Must work without build step (vanilla JS/HTML/CSS)
- Chart.js loaded via CDN for visualizations
- No modern JS features that require transpilation

### Performance Considerations
- CSV files loaded client-side (limit file size growth)
- Prediction calculations run in browser
- Optimize for mobile responsiveness

### Error Handling Standards
- Graceful CSV parsing failures
- Default to safe prediction methods if algorithms fail
- Console logging for debugging prediction mismatches

## Testing & Validation

When modifying prediction algorithms:
1. Run corresponding validator script in `/` directory
2. Test against last 20 draws using `prediction-validation.mjs`
3. Verify accuracy doesn't significantly decrease
4. Update documentation if algorithm scoring changes

For CSV updates:
1. Validate format using `comprehensive_csv_validation.js`
2. Check date sequence integrity
3. Ensure no duplicate draws

## Key Files for Algorithm Changes
- `index.html` (lines 600-900) - Main TOTO prediction logic
- `*_validator.js` - Individual algorithm testing
- `comprehensive_prediction_validation.mjs` - Full system validation