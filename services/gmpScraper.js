const axios = require('axios');
const cheerio = require('cheerio');

const scrapeGMP = async (ipoName) => {
  try {
    const { data } = await axios.get('https://www.investorgain.com/report/live-ipo-gmp/331/');
    const $ = cheerio.load(data);
    const rows = $('table tbody tr');
    let ipoData = null;

    rows.each((_, row) => {
      const columns = $(row).find('td');
      const name = $(columns[0]).text().trim();
      if (name.toLowerCase().includes(ipoName.toLowerCase())) {
        ipoData = {
          name,
          price: $(columns[1]).text().trim(),
          gmp: $(columns[2]).text().trim(),
          lot: $(columns[6]).text().trim(),
        };
      }
    });
    console.log("gmp",ipoData)
    return ipoData;
  } catch (error) {
    console.error('Error scraping GMP data:', error);
    return null;
  }
};


module.exports = { scrapeGMP };
