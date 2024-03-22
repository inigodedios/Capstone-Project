import React from 'react';

/**
 * Represents a single stock item in the user's portfolio.
 * @param {Object} props - The component props.
 * @param {Object} props.stock - The stock object containing its symbol, quantity, and value.
 * @param {Function} props.onSelect - The function to call when the stock item is clicked.
 * @returns A clickable div representing a stock item that triggers the onSelect function on click.
 */
const StockItem = ({ stock, onSelect }) => {
  const { symbol, quantity, value } = stock;

  /**
   * Handles click events on the stock item.
   * Calls the onSelect function passed via props with the stock's symbol.
   */
  const handleClick = () => {
    onSelect(symbol);
  };

  return (
    <div
      // The container div for the stock item. It's clickable and styled accordingly.
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
