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
  const handleSubmit = (e) => {
    e.preventDefault();
    const quantityNum = parseInt(quantity, 10);
    if (!stockSymbol || isNaN(quantityNum) || quantityNum <= 0) {
      alert("Please enter a valid stock symbol and quantity.");
      return;
    }

    onModify(stockSymbol, quantityNum, isAdding ? "ADD" : "REMOVE");
    setStockSymbol('');
    setQuantity('');
  };

  return (
    <div className="container mt-4">
      <form onSubmit={handleSubmit}>
        <div className="row gx-3 align-items-start">
          <div className="col">
            <label htmlFor="stockSymbol" className="form-label">Stock Symbol:</label>
            <input
              id="stockSymbol"
              type="text"
              className="form-control mb-3"
              value={stockSymbol}
              onChange={(e) => setStockSymbol(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="row gx-3 align-items-start">
          <div className="col">
            <label htmlFor="quantity" className="form-label">Quantity:</label>
            <input
              id="quantity"
              type="number"
              className="form-control mb-3"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="row gx-3 align-items-start">
          <div className="col">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="isAdding"
                checked={isAdding}
                onChange={() => setIsAdding(!isAdding)}
              />
              <label className="form-check-label" htmlFor="isAdding">Add</label>
            </div>
          </div>
        </div>
        <div className="row gx-3 align-items-start">
          <div className="col">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="isRemoving"
                checked={!isAdding}
                onChange={() => setIsAdding(!isAdding)}
              />
              <label className="form-check-label" htmlFor="isRemoving">Remove</label>
            </div>
          </div>
        </div>
        <div className="row gx-3 align-items-start">
          <div className="col">
            <div className="my-3">
              <button type="submit" className="btn btn-primary">Modify Portfolio</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StockModificationForm;
