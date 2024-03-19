import React from 'react';

// Componente StockItem que acepta props del stock y una función onSelect para manejar el clic
const StockItem = ({ stock, onSelect }) => {
  const { symbol, quantity, value } = stock;

  // Manejador de eventos para cuando se haga clic en un item
  const handleClick = () => {
    onSelect(symbol);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
        margin: '10px 0',
        backgroundColor: '#f8f8f8',
        cursor: 'pointer',
        border: '1px solid #ddd',
        borderRadius: '4px',
      }}
    >
      <div style={{ fontWeight: 'bold' }}>{symbol}</div>
      <div>{quantity} stocks</div>
      <div>${value.toFixed(2)}</div>
    </div>
  );
};

export default StockItem;
