import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Registrando componentes de Chart.js necesarios para un gráfico de líneas
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StockChart = ({ details }) => {
  const chartData = {
    labels: details.map(detail => detail.date),
    datasets: [
      {
        label: 'Open',
        data: details.map(detail => detail.open),
        borderColor: 'rgb(38, 150, 228)', // Color azul para 'Open'
        backgroundColor: 'rgba(38, 150, 228, 0.5)',
        borderWidth: 2,
      },
      {
        label: 'High',
        data: details.map(detail => detail.high),
        borderColor: 'rgb(75, 192, 192)', // Color verde para 'High'
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 2,
      },
      {
        label: 'Low',
        data: details.map(detail => detail.low),
        borderColor: 'rgb(255, 159, 64)', // Color naranja para 'Low'
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderWidth: 2,
      },
      {
        label: 'Close',
        data: details.map(detail => detail.close),
        borderColor: 'rgb(255, 99, 132)', // Color rojo para 'Close'
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 2,
      }
    ]
  };

  const options = {
    scales: {
      y: {
        beginAtZero: false
      }
    },
    elements: {
      line: {
        tension: 0.1 // Hace que la línea sea ligeramente curvada
      }
    },
    plugins: {
      legend: {
        position: 'top', // Posiciona la leyenda en la parte superior
      },
      title: {
        display: true,
        text: 'Stock Price Evolution' // Título del gráfico
      },
    }
  };

    
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
