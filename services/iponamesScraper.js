// services/ipoSuggestionsScraper.js
const axios = require('axios');
const cheerio = require('cheerio');

const scrapeIPOnames = async () => {
  try {
    const { data } = await axios.get('https://www.investorgain.com/report/ipo-subscription-live/333/');
    const $ = cheerio.load(data);

    const suggestions = [];
    const rows = $('table tbody tr');

    rows.each((_, row) => {
      const columns = $(row).find('td');
      const statusText = $(columns[0]).text().trim();
      const ipoName = statusText.split('GMP:')[0].trim();
      const status = statusText.slice(-1); // Extract last character for status

      if (['O', 'C'].includes(status)) {
        suggestions.push(ipoName);
      }
    });

    return suggestions;
  } catch (error) {
    console.error('Error scraping IPO suggestions:', error);
    throw new Error('Failed to fetch IPO suggestions');
  }
};

module.exports = { scrapeIPOnames };

