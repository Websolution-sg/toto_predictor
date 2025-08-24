const Enhanced4DFetcher = require('./new-4d-fetcher.js');

// Export the enhanced fetcher as the main SingaporePoolsFetcher
module.exports = Enhanced4DFetcher;

// Run directly if called from command line
if (require.main === module) {
  const fetcher = new Enhanced4DFetcher();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    fetcher.testConnection()
      .then(success => {
        process.exit(success ? 0 : 1);
      })
      .catch(error => {
        console.error('Test failed:', error.message);
        process.exit(1);
      });
  } else {
    fetcher.fetchLatest4DResults()
      .then(results => {
        console.log(`🎯 Fetch completed. Retrieved ${results.length} results.`);
        process.exit(0);
      })
      .catch(error => {
        console.error('Fetch failed:', error.message);
        process.exit(1);
      });
  }
}
