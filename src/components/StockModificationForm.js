import React, { useState } from 'react';

/**
 * Displays a form for modifying the user's stock portfolio, allowing them to add or remove stocks.
 * 
 * @param {Object} props The component props.
 * @param {Function} props.onModify Function to call when the form is submitted to modify the portfolio.
 * @param {string} props.stockSymbol The current value of the stock symbol input.
 * @param {Function} props.setStockSymbol Function to update the stock symbol state.
 * @param {number} props.quantity The current value of the quantity input.
 * @param {Function} props.setQuantity Function to update the quantity state.
 * @param {boolean} props.isAdding Boolean indicating if the operation is to add (true) or remove (false) stocks.
 * @param {Function} props.setIsAdding Function to toggle the isAdding state.
 * @returns The StockModificationForm component.
 */
const StockModificationForm = ({
  onModify,
  stockSymbol,
  setStockSymbol,
  quantity,
  setQuantity,
  isAdding,
  setIsAdding,
}) => {
  /**
   * Handles the form submission, validating the input and calling the onModify function with the form values.
   * @param {Event} e The form submission event.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    const quantityNum = parseInt(quantity, 10);
    // Validates the inputs: checks if stockSymbol is filled and quantity is a positive number.
    if (!stockSymbol || isNaN(quantityNum) || quantityNum <= 0) {
      alert("Please enter a valid stock symbol and quantity.");
      return;
    }
    // Calls the onModify function passed from the parent component with the form values.
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
