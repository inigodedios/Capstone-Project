import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

/**
 * Registers the required Chart.js components for a line chart.
 * This setup is necessary to use these chart types and elements in React.
 */
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

/**
 * Renders a line chart displaying stock price evolution using Chart.js.
 * 
 * @param {Object[]} details - Array of stock details, including date and price information.
 * @returns {JSX.Element} A container with a Line chart representing the stock's price evolution.
 * 
 * Each dataset represents a different aspect of stock prices (Open, High, Low, Close) over time.
 * Configures chart options like scales and aesthetics for readability and visual appeal.
 */
const StockChart = ({ details }) => {
  // Chart data preparation, mapping stock details to chart data format
  const chartData = {
    labels: details.map(detail => detail.date),
    datasets: [
      {
        label: 'Open',
        data: details.map(detail => detail.open),
        borderColor: 'rgb(38, 150, 228)',
        backgroundColor: 'rgba(38, 150, 228, 0.5)',
        borderWidth: 2,
      },
      {
        label: 'High',
        data: details.map(detail => detail.high),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 2,
      },
      {
        label: 'Low',
        data: details.map(detail => detail.low),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderWidth: 2,
      },
      {
        label: 'Close',
        data: details.map(detail => detail.close),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 2,
      }
    ]
  };

  // Configuration options for the chart, including axis scales and line tension
  const options = {
    scales: {
      y: {
        beginAtZero: false
      }
    },
    elements: {
      line: {
        tension: 0.1
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Stock Price Evolution'
      },
    }
  };

  // Returns the JSX for rendering the chart within a card component
  return (
    <div className="container mt-4" id="chart"> {/* Aquí se añade el ID */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Stock Price Evolution</h5>
          <Line data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};


export default StockChart;
