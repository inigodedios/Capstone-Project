import React, { useState, useEffect } from 'react';
import StockItem from './components/StockItem'; // Asegúrate de que la ruta sea correcta
import StockDetails from './components/StockDetails'; // Asegúrate de que la ruta sea correcta
import StockModificationForm from './components/StockModificationForm';

const UserProfile = () => {
  const [portfolio, setPortfolio] = useState({ total_value: 0, stocks: [] });
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockDetails, setStockDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [stockSymbol, setStockSymbol] = useState('');
  const [quantity, setQuantity] = useState(0); // Siempre es bueno inicializar con el tipo correcto
  const [isAdding, setIsAdding] = useState(true);

  // Ahora fetchPortfolio está definida en el ámbito global del componente
  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5001/overview', {
      method: 'GET',
      credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPortfolio({
        total_value: data[0].total_value,
        stocks: data.slice(1).map(stock => ({
          symbol: Object.keys(stock)[0],
          ...Object.values(stock)[0],
        })),
      });
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);



// Asegúrate de que esta función use los estados adecuados y llame a fetchPortfolio correctamente
const handleModify = async (symbol, quantity, operation) => {
  setLoading(true);
  try {
    const response = await fetch('http://127.0.0.1:5001/modifyPortfolio/', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock_symbol: symbol, quantity, operation }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to modify portfolio");
    }

    fetchPortfolio(); // Esto llamará a fetchPortfolio para actualizar los datos
    console.log("Portfolio modified successfully");
  } catch (error) {
    console.error("Error modifying portfolio:", error);
    alert("Failed to modify portfolio: " + error.message);
  } finally {
    setLoading(false);
  }
};


  const fetchStockDetails = async (symbol) => {
    if (stockDetails[symbol]) {
      setSelectedStock(symbol);
      return;
    }

    setLoadingDetails(true);
    try {
      const response = await fetch(`http://127.0.0.1:5001/stockinfo/${symbol}`);
      if (!response.ok) {
        throw new Error(`Network response was not ok for symbol: ${symbol}`);
      }
      const data = await response.json();
      setStockDetails(prev => ({ ...prev, [symbol]: data }));
      setSelectedStock(symbol);
    } catch (error) {
      console.error(`Error fetching details for ${symbol}:`, error);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <>
      <div style={{ margin: '20px', fontFamily: 'Arial, sans-serif' }}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <h1>DEBUGGING DOLLARS</h1>
            <h2>PORTFOLIO OVERVIEW</h2>
            <p>Total portfolio value: ${portfolio.total_value.toFixed(2)}</p>
  
            {/* Lugar sugerido para el formulario de modificación del portafolio */}
            <StockModificationForm
              onModify={handleModify}
              stockSymbol={stockSymbol}
              setStockSymbol={setStockSymbol}
              quantity={quantity}
              setQuantity={setQuantity}
              isAdding={isAdding}
              setIsAdding={setIsAdding}
            />  
            {/* Aquí continúa la UI para listar los stocks y mostrar detalles */}
            <div>
              {portfolio.stocks.map(stock => (
                <StockItem
                  key={stock.symbol}
                  stock={stock}
                  onSelect={fetchStockDetails}
                />
              ))}
            </div>
            
            {selectedStock && stockDetails[selectedStock] && (
              <StockDetails symbol={selectedStock} details={stockDetails[selectedStock]} />
            )}
          </>
        )}
      </div>
    </>
  );  
};

export default UserProfile;
