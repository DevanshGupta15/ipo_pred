const calculateProbability = (subscriptionRate, numberOfLots) => {
    if (!subscriptionRate || !numberOfLots || subscriptionRate <= 0) {
      return 0; // Return 0 probability for invalid data
    }
  
    let baseProbability = (1 / subscriptionRate) * 100;
  
    if (numberOfLots > 1) {
      baseProbability = baseProbability / (numberOfLots * 1.2);
    }
  
    return Math.min(100, baseProbability);
  };
  
  module.exports = { calculateProbability };
  