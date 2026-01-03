import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';

const CSV_FILE = './totoResult.csv';

console.log('🎯 ENHANCED SINGAPORE POOLS TOTO FETCHER - 2026 Edition');
console.log('========================================================');
console.log(`📅 Current time: ${new Date().toISOString()}`);

async function fetchTOTOWithModernApproach() {
    const endpoints = [
        {
            name: 'Main Results Page',
            url: 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx',
            method: 'GET'
        },
        {
            name: 'Results with Draw Parameter',
            url: 'https://www.singaporepools.com.sg/en/product/Pages/toto_results.aspx?Draw=0',
            method: 'GET'
        },
        {
            name: 'Mobile Optimized',
            url: 'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx',
            method: 'GET'
        },
        {
            name: 'Legacy URL',
            url: 'https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx?Draw=0',
            method: 'GET'
        }
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`\n🌐 Trying: ${endpoint.name}`);
            console.log(`   URL: ${endpoint.url}`);

            const response = await axios.get(endpoint.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                timeout: 15000,
                maxRedirects: 5
            });

            console.log(`   ✅ Status: ${response.status}`);
            console.log(`   📄 Content length: ${response.data.length} characters`);

            if (response.status === 200 && response.data.length > 1000) {
                // Save content for debugging
                fs.writeFileSync(`debug_${endpoint.name.toLowerCase().replace(/\s+/g, '_')}.html`, response.data);
                console.log(`   💾 Saved debug file for analysis`);

                const results = parseModernTOTOResults(response.data, endpoint.name);
                
                if (results && results.length > 0) {
                    console.log(`   🎉 SUCCESS! Found ${results.length} TOTO results`);
                    return results;
                } else {
                    console.log(`   ⚠️ No TOTO results extracted from content`);
                }
            } else {
                console.log(`   ❌ Invalid response: Status ${response.status}, Length ${response.data.length}`);
            }

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }

    return null;
}

function parseModernTOTOResults(html, source) {
    console.log(`🔍 Parsing TOTO results from ${source}...`);
    
    const $ = cheerio.load(html);
    const results = [];

    // Multiple parsing strategies for different website structures
    const strategies = [
        // Strategy 1: Look for table-based results
        () => {
            console.log('   🎯 Strategy 1: Table-based parsing');
            const tables = $('table');
            
            tables.each((i, table) => {
                const $table = $(table);
                const tableText = $table.text();
                
                // Check if this table contains TOTO-related content
                if (tableText.toLowerCase().includes('draw') || 
                    tableText.toLowerCase().includes('winning') ||
                    tableText.toLowerCase().includes('result')) {
                    
                    console.log(`      📊 Found potential TOTO table ${i + 1}`);
                    
                    const rows = $table.find('tr');
                    rows.each((j, row) => {
                        const $row = $(row);
                        const cells = $row.find('td');
                        
                        if (cells.length >= 7) { // Need at least 7 cells for date + 6 numbers
                            const cellTexts = cells.map((k, cell) => $(cell).text().trim()).get();
                            const result = extractTOTOFromCells(cellTexts);
                            if (result) {
                                console.log(`      ✅ Found result: ${result.date} - ${result.numbers.join(',')} + ${result.additional}`);
                                results.push(result);
                            }
                        }
                    });
                }
            });
        },

        // Strategy 2: Look for div-based results
        () => {
            console.log('   🎯 Strategy 2: Div-based parsing');
            const divs = $('div');
            
            divs.each((i, div) => {
                const $div = $(div);
                const divText = $div.text();
                
                if (divText.toLowerCase().includes('winning numbers') ||
                    divText.toLowerCase().includes('draw date') ||
                    divText.includes('TOTO')) {
                    
                    console.log(`      📦 Found potential TOTO div ${i + 1}`);
                    
                    // Look for number patterns within this div
                    const numbers = extractNumbersFromText(divText);
                    const dates = extractDatesFromText(divText);
                    
                    if (numbers.length >= 7 && dates.length > 0) {
                        const result = {
                            date: formatDate(dates[0]),
                            numbers: numbers.slice(0, 6).sort((a, b) => a - b),
                            additional: numbers[6]
                        };
                        
                        console.log(`      ✅ Found result: ${result.date} - ${result.numbers.join(',')} + ${result.additional}`);
                        results.push(result);
                    }
                }
            });
        },

        // Strategy 3: JavaScript/JSON data extraction
        () => {
            console.log('   🎯 Strategy 3: JavaScript/JSON data extraction');
            
            // Look for JSON data in script tags
            $('script').each((i, script) => {
                const scriptContent = $(script).html();
                if (scriptContent) {
                    try {
                        // Look for TOTO data patterns
                        const jsonMatches = scriptContent.match(/{[^}]*"(draw|result|numbers|date)"[^}]*}/gi);
                        
                        if (jsonMatches) {
                            jsonMatches.forEach(match => {
                                try {
                                    const data = JSON.parse(match);
                                    console.log(`      📋 Found JSON data:`, data);
                                    
                                    // Extract TOTO data if structure matches
                                    const result = parseJSONTOTOData(data);
                                    if (result) {
                                        results.push(result);
                                    }
                                } catch (e) {
                                    // Skip invalid JSON
                                }
                            });
                        }
                    } catch (error) {
                        // Skip scripts that can't be parsed
                    }
                }
            });
        },

        // Strategy 4: Text-based pattern matching
        () => {
            console.log('   🎯 Strategy 4: Text pattern matching');
            
            const fullText = $.text();
            
            // Look for date + number patterns
            const patterns = [
                /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})/g,
                /(\d{1,2}-\w{3}-\d{2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})[\s\S]*?(\d{1,2})/g
            ];
            
            patterns.forEach((pattern, index) => {
                console.log(`      🔍 Trying text pattern ${index + 1}...`);
                let match;
                
                while ((match = pattern.exec(fullText)) !== null) {
                    const date = match[1];
                    const numbers = [
                        parseInt(match[2]), parseInt(match[3]), parseInt(match[4]),
                        parseInt(match[5]), parseInt(match[6]), parseInt(match[7])
                    ];
                    const additional = parseInt(match[8]);
                    
                    // Validate numbers
                    if (numbers.every(n => n >= 1 && n <= 49) && additional >= 1 && additional <= 49) {
                        const result = {
                            date: formatDate(date),
                            numbers: numbers.sort((a, b) => a - b),
                            additional
                        };
                        
                        console.log(`      ✅ Found result: ${result.date} - ${result.numbers.join(',')} + ${result.additional}`);
                        results.push(result);
                    }
                }
            });
        }
    ];

    // Run all strategies
    strategies.forEach((strategy, index) => {
        try {
            strategy();
        } catch (error) {
            console.log(`   ❌ Strategy ${index + 1} failed: ${error.message}`);
        }
    });

    // Remove duplicates and sort by date (newest first)
    const uniqueResults = [];
    const seen = new Set();
    
    for (const result of results) {
        const key = `${result.date}-${result.numbers.join(',')}-${result.additional}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueResults.push(result);
        }
    }

    return uniqueResults.length > 0 ? uniqueResults : null;
}

function extractTOTOFromCells(cellTexts) {
    // Try to extract TOTO result from table cells
    let dateCell = null;
    const numbers = [];
    
    for (let i = 0; i < cellTexts.length; i++) {
        const cell = cellTexts[i].trim();
        
        // Check if this looks like a date
        if (cell.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/) || cell.match(/\d{1,2}-\w{3}-\d{2}/)) {
            dateCell = cell;
        }
        
        // Check if this looks like a TOTO number
        const num = parseInt(cell);
        if (!isNaN(num) && num >= 1 && num <= 49) {
            numbers.push(num);
        }
    }
    
    if (dateCell && numbers.length >= 7) {
        return {
            date: formatDate(dateCell),
            numbers: numbers.slice(0, 6).sort((a, b) => a - b),
            additional: numbers[6]
        };
    }
    
    return null;
}

function extractNumbersFromText(text) {
    const numbers = [];
    const matches = text.match(/\b\d{1,2}\b/g);
    
    if (matches) {
        for (const match of matches) {
            const num = parseInt(match);
            if (num >= 1 && num <= 49) {
                numbers.push(num);
            }
        }
    }
    
    return numbers;
}

function extractDatesFromText(text) {
    const dates = [];
    const patterns = [
        /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g,
        /\d{1,2}-\w{3}-\d{2}/g,
        /\d{1,2}\s+\w{3}\s+\d{4}/g
    ];
    
    patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            dates.push(...matches);
        }
    });
    
    return dates;
}

function parseJSONTOTOData(data) {
    // Try to extract TOTO data from JSON object
    // This is a flexible parser for various JSON structures
    
    try {
        let date = null;
        let numbers = [];
        let additional = null;
        
        // Look for date fields
        for (const key of Object.keys(data)) {
            if (key.toLowerCase().includes('date') || key.toLowerCase().includes('draw')) {
                date = data[key];
            }
        }
        
        // Look for number arrays
        for (const key of Object.keys(data)) {
            if (key.toLowerCase().includes('number') || key.toLowerCase().includes('result')) {
                const value = data[key];
                if (Array.isArray(value)) {
                    numbers = value.filter(n => typeof n === 'number' && n >= 1 && n <= 49);
                }
            }
        }
        
        if (date && numbers.length >= 6) {
            return {
                date: formatDate(date),
                numbers: numbers.slice(0, 6).sort((a, b) => a - b),
                additional: numbers[6] || null
            };
        }
    } catch (error) {
        // Skip invalid data
    }
    
    return null;
}

function formatDate(dateStr) {
    try {
        // Convert various date formats to DD-MMM-YY format
        let date;
        
        if (dateStr.includes('/') || dateStr.includes('-')) {
            // Handle DD/MM/YYYY, DD-MM-YYYY, etc.
            const parts = dateStr.split(/[\/\-]/);
            if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]);
                const year = parseInt(parts[2]);
                
                date = new Date(year > 50 ? (year < 100 ? 2000 + year : year) : (year < 100 ? 2000 + year : year), month - 1, day);
            }
        } else {
            date = new Date(dateStr);
        }
        
        if (date && !isNaN(date.getTime())) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const day = date.getDate().toString().padStart(2, '0');
            const month = months[date.getMonth()];
            const year = date.getFullYear().toString().slice(-2);
            
            return `${day}-${month}-${year}`;
        }
    } catch (error) {
        // Fall back to original string
    }
    
    return dateStr;
}

function getCurrentCSVLatest() {
    try {
        const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
            return lines[0]; // First line is the latest
        }
    } catch (error) {
        console.log(`⚠️ Could not read CSV: ${error.message}`);
    }
    return null;
}

function updateCSV(results) {
    try {
        const currentCSV = getCurrentCSVLatest();
        console.log(`\n📊 Current CSV Latest: ${currentCSV}`);
        
        // Sort results by date (newest first)
        results.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });
        
        const newEntries = [];
        
        for (const result of results) {
            const newEntry = `${result.date},${result.numbers.join(',')},${result.additional}`;
            
            if (newEntry !== currentCSV) {
                console.log(`📝 New result: ${newEntry}`);
                newEntries.push(newEntry);
            } else {
                console.log(`✅ Result already in CSV: ${newEntry}`);
                break; // Stop if we find existing result
            }
        }
        
        if (newEntries.length > 0) {
            // Read existing CSV
            let existingContent = '';
            try {
                existingContent = fs.readFileSync(CSV_FILE, 'utf8');
            } catch (error) {
                console.log('📋 Creating new CSV file');
            }
            
            // Prepend new entries
            const newContent = newEntries.join('\n') + (existingContent ? '\n' + existingContent : '');
            
            // Write back to CSV
            fs.writeFileSync(CSV_FILE, newContent);
            
            console.log(`✅ Updated CSV with ${newEntries.length} new result(s)`);
            
            // Show updated content preview
            const updatedLines = newContent.split('\n').slice(0, 5);
            console.log(`📋 Updated CSV preview:`);
            updatedLines.forEach((line, i) => {
                if (line.trim()) console.log(`   ${i + 1}. ${line}`);
            });
            
            return true;
        } else {
            console.log('✅ No new results to update');
            return false;
        }
        
    } catch (error) {
        console.log(`❌ Error updating CSV: ${error.message}`);
        return false;
    }
}

async function main() {
    try {
        console.log('\n🚀 Starting enhanced TOTO fetching...');
        
        const results = await fetchTOTOWithModernApproach();
        
        if (results && results.length > 0) {
            console.log(`\n🎉 SUCCESS! Extracted ${results.length} TOTO result(s):`);
            
            results.forEach((result, index) => {
                console.log(`\n📊 Result ${index + 1}:`);
                console.log(`   📅 Date: ${result.date}`);
                console.log(`   🎯 Numbers: ${result.numbers.join(', ')}`);
                console.log(`   ➕ Additional: ${result.additional}`);
            });
            
            // Update CSV
            const updated = updateCSV(results);
            
            if (updated) {
                console.log('\n🎯 CSV SUCCESSFULLY UPDATED!');
                process.exit(0);
            } else {
                console.log('\n✅ No updates needed - CSV already current');
                process.exit(0);
            }
            
        } else {
            console.log('\n❌ No TOTO results found');
            console.log('🔍 Possible reasons:');
            console.log('   • Website structure changed');
            console.log('   • Results not yet published');
            console.log('   • Anti-scraping measures active');
            console.log('   • Need to check debug files for analysis');
            
            process.exit(1);
        }
        
    } catch (error) {
        console.error(`💥 Fatal error: ${error.message}`);
        process.exit(1);
    }
}

main();