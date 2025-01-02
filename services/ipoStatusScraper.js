const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment'); // For date handling

const scrapeIPOStatus = async () => {
  try {
    const { data } = await axios.get('https://www.investorgain.com/report/live-ipo-gmp/331/');
    const $ = cheerio.load(data);

    const rows = $('table tbody tr');
    const ipoData = {
      ongoing: [],
      closed: [],
      upcoming: [],
    };

    const today = moment().startOf('day'); // Current date

    rows.each((_, row) => {
      const columns = $(row).find('td');
      if (columns.length < 9) {
        console.warn('Skipping row due to insufficient columns:', $(row).html());
        return;
      }

      // Extract IPO details
      const statusText = $(columns[0]).find('span').text().trim(); // Extract status (Upcoming, Open, Closed)
      const name = $(columns[0]).find('a').text().trim(); // Extract IPO name
      const rawOpenDate = $(columns[7]).text().trim();
      const rawCloseDate = $(columns[8]).text().trim();

      // Parse and format dates
      const openDate = moment(rawOpenDate, 'D-MMM');
      const closeDate = moment(rawCloseDate, 'D-MMM');

      if (!openDate.isValid() || !closeDate.isValid()) {
        console.warn('Invalid dates:', { rawOpenDate, rawCloseDate });
        return;
      }

      const ipo = {
        name,
        price: $(columns[1]).text().trim(),
        gmp: $(columns[2]).text().trim(),
        estListing: $(columns[3]).text().trim(),
        size: $(columns[5]).text().trim(),
        lot: $(columns[6]).text().trim(),
        openDate: openDate.format('YYYY-MM-DD'),
        closeDate: closeDate.format('YYYY-MM-DD'),
        status: statusText,
      };


      // Determine IPO status
      if (statusText.toLowerCase().includes('open') || statusText.toLowerCase().includes('sub:')) {
        // Ongoing IPOs: Open status or subscription status
        if (moment(today).isBetween(openDate, closeDate, 'day', '[]')) {
          ipo.status = 'Ongoing';
          ipoData.ongoing.push(ipo);
        }
      } else if (statusText.toLowerCase().includes('upcoming')) {
        // Upcoming IPOs: Status includes "Upcoming"
        ipo.status = 'Upcoming';
        ipoData.upcoming.push(ipo);
      } else if (statusText.toLowerCase().includes('close')) {
        // Closed IPOs: Check if closeDate matches today's date
        if (moment(today).isSame(closeDate, 'day')) {
          ipo.status = 'Closed';
          ipoData.closed.push(ipo);
        }
      }
    });

    
    // Return the data without wrapping it again
    return ipoData;

  } catch (error) {
    console.error('Error scraping IPO status:', error);
    return { success: false, message: 'Failed to fetch IPO status' };
  }
};

  
  

module.exports = { scrapeIPOStatus };
