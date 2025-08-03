#!/usr/bin/env bash

echo "🔍 GitHub Actions Dependency Validation"
echo "======================================"

# Check if package.json exists
if [ -f "package.json" ]; then
    echo "✅ package.json - Found"
else
    echo "❌ package.json - Missing"
    exit 1
fi

# Check if package-lock.json exists
if [ -f "package-lock.json" ]; then
    echo "✅ package-lock.json - Found"
    LOCK_FILE_EXISTS=true
else
    echo "⚠️ package-lock.json - Missing (will use npm install instead)"
    LOCK_FILE_EXISTS=false
fi

# Validate package.json structure
echo ""
echo "📋 Validating package.json structure..."

# Check required fields
required_fields=("name" "version" "dependencies")
for field in "${required_fields[@]}"; do
    if grep -q "\"$field\"" package.json; then
        echo "✅ $field - Present"
    else
        echo "❌ $field - Missing"
    fi
done

# Check required dependencies for updateTotoCSV.cjs
echo ""
echo "📦 Checking required dependencies..."
required_deps=("node-fetch" "cheerio")
for dep in "${required_deps[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        echo "✅ $dep - Listed in dependencies"
    else
        echo "❌ $dep - Missing from dependencies"
    fi
done

# Check updateTotoCSV.cjs exists
echo ""
echo "🔧 Checking update script..."
if [ -f "updateTotoCSV.cjs" ]; then
    echo "✅ updateTotoCSV.cjs - Found"
else
    echo "❌ updateTotoCSV.cjs - Missing"
fi

# Check CSV file exists
if [ -f "totoResult.csv" ]; then
    echo "✅ totoResult.csv - Found"
else
    echo "❌ totoResult.csv - Missing"
fi

# Check workflow file
echo ""
echo "⚙️ Checking GitHub Actions workflow..."
if [ -f ".github/workflows/update-toto.yml" ]; then
    echo "✅ update-toto.yml - Found"
    
    # Check for npm ci vs npm install logic
    if grep -q "npm ci" .github/workflows/update-toto.yml; then
        if [ "$LOCK_FILE_EXISTS" = true ]; then
            echo "✅ Workflow uses npm ci with lock file present"
        else
            echo "⚠️ Workflow uses npm ci but no lock file found"
        fi
    fi
    
    if grep -q "npm install" .github/workflows/update-toto.yml; then
        echo "✅ Workflow has npm install fallback"
    fi
    
else
    echo "❌ update-toto.yml - Missing"
fi

echo ""
echo "🎯 Summary:"
echo "----------"

if [ -f "package.json" ] && [ -f "updateTotoCSV.cjs" ] && [ -f "totoResult.csv" ]; then
    echo "✅ All required files present"
    echo "✅ GitHub Actions should work now"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to: https://github.com/Websolution-sg/toto_predictor/actions"
    echo "2. Select 'Auto Update TOTO Result' workflow"
    echo "3. Click 'Run workflow' to test"
    echo "4. Monitor the logs for success"
else
    echo "❌ Some required files are missing"
    echo "❌ Please fix the missing files before running workflow"
fi

echo ""
echo "🔗 Useful links:"
echo "- Repository: https://github.com/Websolution-sg/toto_predictor"
echo "- Actions: https://github.com/Websolution-sg/toto_predictor/actions"
echo "- Live site: https://websolution-sg.github.io/toto_predictor/"
