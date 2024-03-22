import React, { useState, useEffect } from 'react';
import StockChart from './StockChart';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components required for rendering the charts
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Renders detailed stock information for a given stock symbol.
 * Fetches stock data on component mount and displays it in a table and a chart.
 * 
 * @param {Object} props - Component props.
 * @param {string} props.symbol - The stock symbol to fetch details for.
 * @returns {JSX.Element} The component rendering stock details including a data table and a chart.
 */
const StockDetails = ({ symbol }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch stock details when the component mounts or the symbol changes
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
        const response = await fetch(`https://capstoneinifinal.lm.r.appspot.com/stockinfo/${symbol}`);
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

  // Conditional rendering based on loading state and presence of data
  if (loading) return <div>Loading stock details...</div>;
  if (error) return <div>Error fetching stock details: {error}</div>;
  if (!details) return <div>No details available for {symbol}.</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Stock Details for {symbol}</h2>
      <table className="table">
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
      <StockChart details={details} />
    </div>
  );
};

export default StockDetails;
