const axios = require('axios');
const cheerio = require('cheerio');

const scrapeSubscription = async (ipoName) => {
  try {
    const { data } = await axios.get('https://www.investorgain.com/report/ipo-subscription-live/333/');
    const $ = cheerio.load(data);
    const rows = $('table tbody tr');
    let subscriptionData = {};

    rows.each((_, row) => {
      const columns = $(row).find('td');
      const name = $(columns[0]).text().trim();
      if (name.toLowerCase().includes(ipoName.toLowerCase())) {
        subscriptionData = {
          QIB: $(columns[6]).text().trim(),
          NII: $(columns[7]).text().trim(),
          RII: $(columns[10]).text().trim(),
        };
      }
    });
    console.log("subscrption",subscriptionData)
    return subscriptionData;
  } catch (error) {
    console.error('Error scraping subscription data:', error);
    return null;
  }
};



module.exports = { scrapeSubscription };
