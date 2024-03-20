import React, { useState, useEffect } from 'react';

const StockDetails = ({ symbol }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStockDetails = async () => {
      if (!symbol) {
        setLoading(false);
        setError('No stock symbol provided');
        return;
      }
  
      try {
        setLoading(true);
        setError('');
        const response = await fetch(`http://127.0.0.1:5001/stockinfo/${symbol}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch details for symbol: ${symbol}`);
        }
        const data = await response.json();
  
        const stockDetails = data
          .map(([date, details]) => ({
            date,
            open: details ? details["1. open"] : 0,
            high: details ? details["2. high"] : 0,
            low: details ? details["3. low"] : 0,
            close: details ? details["4. close"] : 0,
            volume: details ? details["5. volume"] : 0,
          }))
          .reverse();
        setDetails(stockDetails);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchStockDetails();
  }, [symbol]);
  

  if (loading) return <div>Loading stock details...</div>;
  if (error) return <div>Error fetching stock details: {error}</div>;
  if (!details) return <div>No details available for {symbol}.</div>;

  return (
    <div>
      <h2>Stock Details for {symbol}</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Open</th>
            <th>High</th>
            <th>Low</th>
            <th>Close</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>
          {details.map((detail, index) => (
            <tr key={index}>
              <td>{detail.date}</td>
              <td>${detail.open}</td>
              <td>${detail.high}</td>
              <td>${detail.low}</td>
              <td>${detail.close}</td>
              <td>{detail.volume.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockDetails;
