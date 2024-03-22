import React, { useState, useEffect } from 'react';
import StockItem from './components/StockItem'; // Asegúrate de que la ruta sea correcta
import StockDetails from './components/StockDetails'; // Asegúrate de que la ruta sea correcta
import StockModificationForm from './components/StockModificationForm';
import LogoutButton from './components/Logout';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import DownloadPdf from './components/DownloadPdf'; // Asegúrate de que la ruta sea correcta

/**
 * The UserProfile component renders the user profile page, including
 * the portfolio overview, stock modification form, stock list, and
 * stock details. It also provides functionality for generating PDF
 * summaries of the portfolio.
 * 
 * @returns The UserProfile component containing the user profile layout.
 */
const UserProfile = () => {
  const [portfolio, setPortfolio] = useState({ total_value: 0, stocks: [] });
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockDetails, setStockDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [stockSymbol, setStockSymbol] = useState('');
  const [quantity, setQuantity] = useState(0); // Siempre es bueno inicializar con el tipo correcto
  const [isAdding, setIsAdding] = useState(true);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://capstoneinifinal.lm.r.appspot.com/overview', {
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

  const handleModify = async (symbol, quantity, operation) => {
    setLoading(true);
    try {
      const response = await fetch('https://capstoneinifinal.lm.r.appspot.com/modifyPortfolio/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_symbol: symbol, quantity, operation }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to modify portfolio");
      }

      fetchPortfolio();
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
      const response = await fetch(`https://capstoneinifinal.lm.r.appspot.com/stockinfo/${symbol}`);
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

  const selectStock = (symbol) => {
    fetchStockDetails(symbol);
    setIsDetailsVisible(true);
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    if (!isDetailsVisible) {
      const tableData = portfolio.stocks.map(stock => [stock.symbol, stock.quantity, `$${stock.value.toFixed(2)}`]);
      doc.autoTable({
        head: [['Symbol', 'Quantity', 'Value']],
        body: tableData,
      });
      doc.save('portfolio.pdf');
    } else {
      if (selectedStock && stockDetails[selectedStock]) {
        const symbol = selectedStock;
        const details = stockDetails[symbol];
        doc.text(`Stock: ${symbol}`, 10, 10);
        doc.text(`Quantity: ${details.quantity}`, 10, 20);
        doc.text(`Value: ${details.value}`, 10, 30);
        doc.save(`${symbol}_details.pdf`);
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        generatePDF();
      }
    }
  };



  const gridLayoutStyle = {
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    gridTemplateColumns: isDetailsVisible ? '1fr 2fr' : '1fr',
    gridTemplateAreas: `
      'header header'
      'main details'
    `,
    gap: '20px',
    margin: '20px',
    height: '100vh',
  };

  const headerStyle = {
    gridArea: 'header',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const mainStyle = {
    gridArea: 'main',
    overflowY: 'auto', // Permite el desplazamiento si la lista es muy larga
  };

  const detailsStyle = {
    gridArea: 'details',
  };

  return (
    <div style={gridLayoutStyle}>
      <div style={headerStyle} className="bg-primary text-white p-3">
        <div>
          <h1 className="mb-0">DEBUGGING DOLLARS</h1>
          <h2 className="mb-0">PORTFOLIO OVERVIEW</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}> {/* Ajuste para los botones */}
          {/* Los botones ahora están dentro de un div con display flex y un gap */}
          <DownloadPdf
            portfolio={portfolio}
            stockDetails={stockDetails}
            selectedStock={selectedStock}
          />
          <LogoutButton />
        </div>
      </div>
      <div style={mainStyle}>
        {loading ? null : (
          <p className="mb-0">
            <strong>Total portfolio value: ${portfolio.total_value.toFixed(2)}</strong>
          </p>
        )}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <StockModificationForm
              onModify={handleModify}
              stockSymbol={stockSymbol}
              setStockSymbol={setStockSymbol}
              quantity={quantity}
              setQuantity={setQuantity}
              isAdding={isAdding}
              setIsAdding={setIsAdding}
            />
            {/* Lista de stocks */}
            {portfolio.stocks.map(stock => (
              <StockItem
                key={stock.symbol}
                stock={stock}
                onSelect={selectStock}
              />
            ))}
          </>
        )}
      </div>

      {isDetailsVisible && selectedStock && stockDetails[selectedStock] && (
        <div style={detailsStyle}>
          <StockDetails symbol={selectedStock} details={stockDetails[selectedStock]} />
        </div>
      )}
    </div>
  );


}

export default UserProfile;