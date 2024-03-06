import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
  const { userId } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [stockDetails, setStockDetails] = useState({});
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://concise-honor-416313.ew.r.appspot.com/portfolio/user1`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setPortfolio(data);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [userId]);

  const fetchStockDetails = async (symbol) => {
    setLoadingDetails(true);
    if (stockDetails[symbol]) {
      setSelectedStock(symbol);
      setLoadingDetails(false);
    } else {
      try {
        const response = await fetch(`https://concise-honor-416313.ew.r.appspot.com/stockinfo/${symbol}`);
        if (!response.ok) {
          throw new Error(`Network response was not ok for symbol: ${symbol}`);
        }
        const data = await response.json();
        setStockDetails(prevDetails => ({
          ...prevDetails,
          [symbol]: data
        }));
        setSelectedStock(symbol);
      } catch (error) {
        console.error(`Error fetching details for ${symbol}:`, error);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  return (
    <>
      <div className="portfolio-container" style={{ margin: '20px' }}> 
        {loading ? (
          <p>Loading...</p>
        ) : portfolio ? (
          <>
            <p className="text-lg mb-6">Total Portfolio Value: ${portfolio.total_value.toFixed(2)}</p>
            <div>
              {Object.entries(portfolio.symbols).map(([symbol, details]) => (
                <div
                  key={symbol}
                  className="stock-item"
                  style={{
                    display: 'flex',
                    justifyContent: 'left',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: 'white',
                    // boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                    marginBottom: '16px',
                    border: '1px solid black',
                    cursor: 'pointer',
                  }}
                  onClick={() => fetchStockDetails(symbol)}
                >
                  <span className="font-medium text-lg">{symbol}</span>
                  <span style={{ marginLeft: '3em' }}>{details.quantity} stocks</span>
                </div>
              ))}
            </div>
            {selectedStock && stockDetails[selectedStock] && (
              <div className="stock-details" style={{ marginTop: '32px' }}>
                <h3 className="text-xl font-bold mb-4">Stock Details for {selectedStock}</h3>
                {loadingDetails ? (
                  <p>Loading details...</p>
                ) : (
                  <table className="details-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Date', 'Open', 'High', 'Low', 'Close', 'Volume'].map((header) => (
                          <th key={header} style={{ border: '1px solid black', padding: '8px', textAlign: 'left', backgroundColor: 'white', color: 'black' }}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stockDetails[selectedStock].map(([date, data], index) => (
                        <tr key={index} style={{ backgroundColor:'white'}}>
                          <td style={{ border: '1px solid black', padding: '8px' }}>{date}</td>
                          <td style={{ border: '1px solid black', padding: '8px' }}>{data['1. open']}</td>
                          <td style={{ border: '1px solid black', padding: '8px' }}>{data['2. high']}</td>
                          <td style={{ border: '1px solid black', padding: '8px' }}>{data['3. low']}</td>
                          <td style={{ border: '1px solid black', padding: '8px' }}>{data['4. close']}</td>
                          <td style={{ border: '1px solid black', padding: '8px' }}>{data['5. volume']}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        ) : (
          <p>No portfolio data available.</p>
        )}
      </div>
    </>
  );
};

export default UserProfile;
