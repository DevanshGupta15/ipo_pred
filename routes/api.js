const express = require('express');
const { scrapeGMP } = require('../services/gmpScraper');
const { scrapeSubscription } = require('../services/subscriptionScraper');
const { calculateProbability } = require('../utils/calculateProbability');

const router = express.Router();


router.post('/check-ipo', async (req, res) => {
    const { ipoName, investment, category, numPANs } = req.body;
  
    if (!ipoName || !investment || !category || !numPANs) {
      return res.status(400).json({
        success: false,
        message: 'IPO name, investment amount, category, and number of PANs are required',
      });
    }
  
    try {
      // Scrape GMP and subscription data
      const gmpData = await scrapeGMP(ipoName);
      if (!gmpData) {
        return res.status(404).json({ success: false, message: 'IPO not found or inactive' });
      }
  
      const subscriptionData = await scrapeSubscription(ipoName);
      if (!subscriptionData) {
        return res.status(404).json({ success: false, message: 'Subscription data not found' });
      }
  
      // Validate category subscription exists
      const categorySubscription = subscriptionData[category];
      if (!categorySubscription || categorySubscription === '--') {
        return res.status(400).json({
          success: false,
          message: `Invalid category or no subscription data for category. Available categories: ${Object.keys(subscriptionData).join(', ')}`,
        });
      }
  
      // Extract IPO data for calculation
      const lotCost = parseFloat(gmpData.price) * parseInt(gmpData.lot, 10);
      if (isNaN(lotCost) || lotCost <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid IPO data for calculation' });
      }
  
      const subscriptionRate = parseFloat(categorySubscription.replace('x', ''));
      if (isNaN(subscriptionRate) || subscriptionRate <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid subscription rate' });
      }
  
      const numberOfLots = Math.floor(parseFloat(investment) / lotCost);
      const individualProbability = calculateProbability(subscriptionRate, numberOfLots);
  
      // Adjust probability for multiple PANs
      const totalProbability = Math.min(100, individualProbability * parseInt(numPANs, 10));
  
      // Send response
      res.json({
        success: true,
        data: {
          ipo: gmpData.name,
          gmp: gmpData.gmp,
          category,
          investment,
          lotsApplied: numberOfLots,
          subscriptionRate: `${subscriptionRate}x`,
          numPANs,
          probability: `${totalProbability.toFixed(2)}%`,
        },
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
  

module.exports = router;
