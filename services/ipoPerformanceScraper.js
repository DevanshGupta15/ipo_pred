const axios = require('axios');
const cheerio = require('cheerio');

const scrapeIPOPerformance = async () => {
  try {
    const { data } = await axios.get('https://www.investorgain.com/report/ipo-gmp-performance/377/');
    const $ = cheerio.load(data);

    const performanceData = {
      totalIPOs: $('div.ipo_performance div.col-4.col-md-2').eq(0).find('p.h4').text().trim(),
      aboveGMP: $('div.ipo_performance div.col-4.col-md-2').eq(1).find('p.h4').text().trim(),
      belowGMP: $('div.ipo_performance div.col-4.col-md-2').eq(2).find('p.h4').text().trim(),
      atParGMP: $('div.ipo_performance div.col-4.col-md-2').eq(3).find('p.h4').text().trim(),
      totalIssueSize: $('div.ipo_performance div.col-4.col-md-2').eq(4).find('p.h4').text().trim(),
    };

    return performanceData;
  } catch (error) {
    console.error('Error scraping IPO performance:', error);
    throw new Error('Failed to fetch IPO performance data');
  }
};

module.exports = { scrapeIPOPerformance };
