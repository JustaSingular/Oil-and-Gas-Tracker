import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Divider, CircularProgress } from '@mui/material';

export default function App() {
  const [globalPrice, setGlobalPrice] = useState(0);
  const [gasPrice, setGasPrice] = useState(0); 
  const [loading, setLoading] = useState(true);

  // New state tracking the direction of the price movement ('up', 'down', or 'stable')
  const [oilTrend, setOilTrend] = useState('stable');
  const [gasTrend, setGasTrend] = useState('stable');

  useEffect(() => {
    const CACHE_KEY = 'energy_dashboard_cache';
    const SIX_HOURS = 6 * 60 * 60 * 1000; 
    const now = Date.now();

    const savedCache = localStorage.getItem(CACHE_KEY);
    const cache = savedCache ? JSON.parse(savedCache) : null;

    if (cache && (now - cache.timestamp < SIX_HOURS)) {
      setGlobalPrice(cache.oil);
      setGasPrice(cache.gas);
      setOilTrend(cache.oilTrend || 'stable');
      setGasTrend(cache.gasTrend || 'stable');
      setLoading(false);
      console.log("Loading data from cache to save API credits...");
    } else {
      console.log("Cache expired or missing. Fetching new data...");
      
      fetch('/.netlify/functions/get-prices')
      .then(res => res.json())
      .then(data => {
        const oilP = data.oil || 0;
        const gasP = data.gas || 0;

        // Calculate trends based on what was *previously* in the cache
        let newOilTrend = 'stable';
        let newGasTrend = 'stable';

        if (cache) {
          if (oilP > cache.oil) newOilTrend = 'up';
          if (oilP < cache.oil) newOilTrend = 'down';
          
          if (gasP > cache.gas) newGasTrend = 'up';
          if (gasP < cache.gas) newGasTrend = 'down';
        }

        setGlobalPrice(oilP);
        setGasPrice(gasP);
        setOilTrend(newOilTrend);
        setGasTrend(newGasTrend);

        // Save everything, including trends, to localStorage
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          oil: oilP,
          gas: gasP,
          oilTrend: newOilTrend,
          gasTrend: newGasTrend,
          timestamp: now
        }));

        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
    }
  }, []);

  // Conversions
  const ttdConversionOil = (globalPrice * 6.80).toFixed(2);
  const ttdConversionGas = (gasPrice * 6.80).toFixed(2);
  const dailyProfitOil = (globalPrice * 50000).toLocaleString();
  const dailyProfitOilTTD = (globalPrice * 50000 * 6.8).toLocaleString();
  const dailyProfitGas = (gasPrice * 2537300).toLocaleString();
  const dailyProfitGasTTD = (gasPrice * 2537300 * 6.8).toLocaleString();

  const cardStyle = {
    minWidth: 320,
    bgcolor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    color: '#ffffff',
    backdropFilter: 'blur(10px)',
    mb: 4
  };

  const neonText = {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#39FF14',
    textShadow: '0 0 10px rgba(57, 255, 20, 0.5)'
  };

  // Helper component to render the arrows & labels dynamically
  const TrendIndicator = ({ trend }) => {
    if (trend === 'up') {
      return (
        <Typography variant="body2" sx={{ color: '#39FF14', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          ▲ Up from last check
        </Typography>
      );
    }
    if (trend === 'down') {
      return (
        <Typography variant="body2" sx={{ color: '#FF3131', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          ▼ Down from last check
        </Typography>
      );
    }
    return (
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
        ● Stable
      </Typography>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, pt: 5, px: 2, bgcolor: '#000', minHeight: '100vh' }}>
      
      {/* CARD 1: GLOBAL OIL PRICE */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="overline" sx={{ color: 'rgba(255, 255, 255, 0.6)', letterSpacing: 2 }}>
            Global Market (WTI)
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>Crude Oil Price</Typography>
          {loading ? <CircularProgress size={24} sx={{ color: '#39FF14' }} /> : (
            <Box>
              <Typography variant="h4" sx={neonText}>TT$ {ttdConversionOil}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block' }}>
                Per Barrel (USD ${globalPrice})
              </Typography>
              <TrendIndicator trend={oilTrend} />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* CARD 2: LOCAL PUMP RATES */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="overline" sx={{ color: 'rgba(255, 255, 255, 0.6)', letterSpacing: 2 }}>
            Trinidad & Tobago
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>Local Pump Rates</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Premium</Typography>
            <Typography sx={neonText}>TT$ 7.75</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Super</Typography>
            <Typography sx={neonText}>TT$ 6.97</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Diesel</Typography>
            <Typography sx={neonText}>TT$ 4.41</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* CARD 3: Barrels produced per day */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="overline" sx={{ color: 'rgba(255, 255, 255, 0.6)', letterSpacing: 2 }}>
            Trinidad & Tobago
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>Barrels Per Day</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>2005</Typography>
            <Typography sx={neonText}>~155,000</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>2024</Typography>
            <Typography sx={neonText}>~50,000</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* CARD 4: Estimated $ from barrels */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="overline" sx={{ color: 'rgba(255, 255, 255, 0.6)', letterSpacing: 2 }}>
            Trinidad & Tobago
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>Profit Per Day</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Profit</Typography>
            <Typography sx={neonText}>~${dailyProfitOil} USD</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Profit</Typography>
            <Typography sx={neonText}>~${dailyProfitOilTTD} TTD</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* CARD 5: Natural Gas Price */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="overline" sx={{ color: 'rgba(255, 255, 255, 0.6)', letterSpacing: 2 }}>
            Global Market
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>Natural Gas Price</Typography>
          {loading ? <CircularProgress size={24} sx={{ color: '#39FF14' }} /> : (
            <Box>
              <Typography variant="h4" sx={neonText}>TT$ {ttdConversionGas}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block' }}>
                Per MMBtu (USD ${gasPrice})
              </Typography>
              <TrendIndicator trend={gasTrend} />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* CARD 6: Daily Natural Gas Production */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="overline" sx={{ color: 'rgba(255, 255, 255, 0.6)', letterSpacing: 2 }}>
            Trinidad & Tobago
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>Natural Gas Extracted Per Day</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>2025</Typography>
            <Typography sx={neonText}>~2,537,300,000 cf/d</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>2005</Typography>
            <Typography sx={neonText}>~3,197,400,000 cf/d</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* CARD 7: Daily Natural Gas Profit */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="overline" sx={{ color: 'rgba(255, 255, 255, 0.6)', letterSpacing: 2 }}>
            Trinidad & Tobago
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>Natural Gas Profit</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Profit</Typography>
            <Typography sx={neonText}>~${dailyProfitGasTTD} TTD</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>profit</Typography>
            <Typography sx={neonText}>~${dailyProfitGas} USD</Typography>
          </Box>
        </CardContent>
      </Card>

    </Box>
  );
}