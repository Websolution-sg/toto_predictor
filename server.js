const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Route to update CSV with new TOTO results
app.post('/api/update-csv', (req, res) => {
  try {
    const { winningNumbers, additionalNumber } = req.body;
    
    // Validate input
    if (!winningNumbers || !Array.isArray(winningNumbers) || winningNumbers.length !== 6) {
      return res.status(400).json({ error: 'Invalid winning numbers' });
    }
    
    if (!additionalNumber || additionalNumber < 1 || additionalNumber > 49) {
      return res.status(400).json({ error: 'Invalid additional number' });
    }
    
    // Read existing CSV
    const csvPath = path.join(__dirname, 'totoResult.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    
    // Create new line
    const newLine = `${winningNumbers.join(',')},${additionalNumber}`;
    
    // Check if this result already exists (avoid duplicates)
    const lines = csvData.trim().split('\n');
    if (lines[0] === newLine) {
      return res.json({ message: 'Result already exists at the top of CSV' });
    }
    
    // Add new result at the beginning
    const updatedCsv = `${newLine}\n${csvData}`;
    
    // Write back to file
    fs.writeFileSync(csvPath, updatedCsv);
    
    res.json({ message: 'CSV updated successfully', newResult: newLine });
    
  } catch (error) {
    console.error('Error updating CSV:', error);
    res.status(500).json({ error: 'Failed to update CSV file' });
  }
});

// Route to fetch latest TOTO results and update CSV automatically
app.post('/api/fetch-and-update', async (req, res) => {
  try {
    // This would contain your Singapore Pools API logic
    // For now, we'll return a placeholder response
    
    // In a real implementation, you'd fetch from Singapore Pools here
    // const response = await fetch('https://www.singaporepools.com.sg/api/toto/latest');
    // const data = await response.json();
    
    res.json({ 
      message: 'This endpoint would fetch from Singapore Pools and update CSV',
      note: 'Singapore Pools API access may require authentication/CORS handling on server-side'
    });
    
  } catch (error) {
    console.error('Error fetching and updating:', error);
    res.status(500).json({ error: 'Failed to fetch and update' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
