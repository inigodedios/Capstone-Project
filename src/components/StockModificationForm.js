import React, { useState } from 'react';

const StockModificationForm = ({
    onModify,
    stockSymbol,
    setStockSymbol,
    quantity,
    setQuantity,
    isAdding,
    setIsAdding,
  }) => {
    // Formulario usa directamente props para el estado y actualización
    const handleSubmit = (e) => {
      e.preventDefault();
      const quantityNum = parseInt(quantity, 10);
      if (!stockSymbol || isNaN(quantityNum) || quantityNum <= 0) {
        alert("Please enter valid stock symbol and quantity.");
        return;
      }
  
      onModify(stockSymbol, quantityNum, isAdding ? "ADD" : "REMOVE");
      setStockSymbol('');
      setQuantity('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="stockSymbol">Stock Symbol:</label>
        <input
          id="stockSymbol"
          value={stockSymbol}
          onChange={(e) => setStockSymbol(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="quantity">Quantity:</label>
        <input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>
      <div>
        <label>
          <input
            type="radio"
            name="operation"
            checked={isAdding}
            onChange={() => setIsAdding(true)}
          />
          Add
        </label>
        <label>
          <input
            type="radio"
            name="operation"
            checked={!isAdding}
            onChange={() => setIsAdding(false)}
          />
          Remove
        </label>
      </div>
      <button type="submit">Modify Portfolio</button>
    </form>
  );
};

export default StockModificationForm;
