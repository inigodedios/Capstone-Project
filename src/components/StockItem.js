import React from 'react';

const StockItem = ({ stock, onSelect }) => {
  const { symbol, quantity, value } = stock;

  const handleClick = () => {
    onSelect(symbol);
  };

  return (
    <div
      onClick={handleClick}
      className="p-3 mb-3 bg-light rounded shadow-sm"
      style={{ cursor: 'pointer' }}
    >
      <div className="fw-bold">{symbol}</div>
      <div>{quantity} stocks</div>
      <div className="fw-bold">${value.toFixed(2)}</div>
    </div>
  );
};

export default StockItem;
