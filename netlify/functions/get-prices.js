const axios = require('axios');

// This variable stays "warm" in Netlify's memory for a short time
let cachedData = null;
let lastFetch = 0;
const SIX_HOURS = 6 * 60 * 60 * 1000;

exports.handler = async () => {
  const now = Date.now();

  // 1. Check if we have data and it's less than 6 hours old
  if (cachedData && (now - lastFetch < SIX_HOURS)) {
    console.log("Serving from Server Cache");
    return { statusCode: 200, body: JSON.stringify(cachedData) };
  }

  // 2. Otherwise, fetch fresh data
  try {
    const alphaKey = process.env.VITE_ALPHA_KEY;
    const oilToken = process.env.VITE_OIL_TOKEN;

    const [oilRes, gasRes] = await Promise.all([
      axios.get('https://api.oilpriceapi.com/v1/prices/latest', {
        headers: { 'Authorization': `Token ${oilToken}` }
      }),
      axios.get(`https://www.alphavantage.co/query?function=NATURAL_GAS&interval=daily&apikey=${alphaKey}`)
    ]);

    cachedData = {
      oil: oilRes.data.data.price,
      gas: parseFloat(gasRes.data.data[0].value)
    };
    lastFetch = now;

    return { statusCode: 200, body: JSON.stringify(cachedData) };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};