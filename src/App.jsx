import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';

export default function App() {
  const [globalPrice, setGlobalPrice] = useState(0);
  const [gasPrice, setGasPrice] = useState(0); 
  const [loading, setLoading] = useState(true);

  // Track the trend state and the previous price for context
  const [oilTrend, setOilTrend] = useState({ direction: 'stable', prevPrice: null });
  const [gasTrend, setGasTrend] = useState({ direction: 'stable', prevPrice: null });

  useEffect(() => {
    const CACHE_KEY = 'energy_dashboard_cache';
    const SIX_HOURS = 6 * 60 * 60 * 1000; 
    const now = Date.now();

    const savedCache = localStorage.getItem(CACHE_KEY);
    const cache = savedCache ? JSON.parse(savedCache) : null;

    if (cache && (now - cache.timestamp < SIX_HOURS)) {
      setGlobalPrice(cache.oil);
      setGasPrice(cache.gas);
      setOilTrend({ direction: cache.oilTrend || 'stable', prevPrice: cache.prevOil || null });
      setGasTrend({ direction: cache.gasTrend || 'stable', prevPrice: cache.prevGas || null });
      setLoading(false);
      console.log("Loading data from cache to save API credits...");
    } else {
      console.log("Cache expired or missing. Fetching new data...");
      
      fetch('/.netlify/functions/get-prices')
      .then(res => res.json())
      .then(data => {
        const oilP = data.oil || 0;
        const gasP = data.gas || 0;

        let newOilDirection = 'stable';
        let newGasDirection = 'stable';
        let prevOilVal = null;
        let prevGasVal = null;

        if (cache) {
          prevOilVal = cache.oil;
          prevGasVal = cache.gas;

          if (oilP > cache.oil) newOilDirection = 'up';
          if (oilP < cache.oil) newOilDirection = 'down';
          
          if (gasP > cache.gas) newGasDirection = 'up';
          if (gasP < cache.gas) newGasDirection = 'down';
        }

        setGlobalPrice(oilP);
        setGasPrice(gasP);
        setOilTrend({ direction: newOilDirection, prevPrice: prevOilVal });
        setGasTrend({ direction: newGasDirection, prevPrice: prevGasVal });

        localStorage.setItem(CACHE_KEY, JSON.stringify({
          oil: oilP,
          gas: gasP,
          oilTrend: newOilDirection,
          gasTrend: newGasDirection,
          prevOil: prevOilVal,
          prevGas: prevGasVal,
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

  // Helper component to render inline arrows next to pricing
  const InlineTrendArrow = ({ trend }) => {
    if (trend.direction === 'up') {
      return <Box component="span" sx={{ color: '#39FF14', ml: 1, fontSize: '0.8em' }}>▲</Box>;
    }
    if (trend.direction === 'down') {
      return <Box component="span" sx={{ color: '#FF3131', ml: 1, fontSize: '0.8em' }}>▼</Box>;
    }
    return <Box component="span" sx={{ color: 'rgba(255,255,255,0.3)', ml: 1, fontSize: '0.8em' }}>●</Box>;
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
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={neonText}>TT$ {ttdConversionOil}</Typography>
                <InlineTrendArrow trend={oilTrend} />
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block', mt: 0.5 }}>
                Per Barrel (USD ${globalPrice})
              </Typography>
              {oilTrend.prevPrice !== null && (
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.3)', display: 'block' }}>
                  Last recorded: USD ${oilTrend.prevPrice}
                </Typography>
              )}
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
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={neonText}>TT$ {ttdConversionGas}</Typography>
                <InlineTrendArrow trend={gasTrend} />
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block', mt: 0.5 }}>
                Per MMBtu (USD ${gasPrice})
              </Typography>
              {gasTrend.prevPrice !== null && (
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.3)', display: 'block' }}>
                  Last recorded: USD ${gasTrend.prevPrice}
                </Typography>
              )}
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