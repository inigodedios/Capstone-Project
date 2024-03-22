import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

const DownloadPdf = ({ portfolio, stockDetails, selectedStock }) => {
  const generatePDF = async () => {
    const doc = new jsPDF();

    // Configuraciones iniciales para el estilo del PDF
    doc.setFont("helvetica"); // Fuente elegante y profesional
    doc.setFontSize(10); // Tamaño de letra apropiado

    // Fecha actual para el documento
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    doc.text(`Date: ${currentDate}`, 150, 10); // Alineación a la derecha

    // Título del PDF
    doc.setFontSize(16); // Tamaño de letra más grande para el título
    doc.text("Portfolio Summary", 105, 20, null, null, "center"); // Centrado

    // Subtítulo con información del stock seleccionado (si aplica)
    if (selectedStock) {
      const stock = portfolio.stocks.find(s => s.symbol === selectedStock);
      if (stock) {
        doc.setFontSize(12); // Ligeramente más grande para subtítulos
        doc.text(`Stock: ${selectedStock}`, 20, 30);
        doc.text(`Quantity: ${stock.quantity}`, 20, 35);
        doc.text(`Total value: $${stock.value.toFixed(2)}`, 20, 40);
      }

      // Datos del stock seleccionado
      if (stockDetails[selectedStock]) {
        const details = stockDetails[selectedStock];
        const tableData = details.map(([date, detail]) => [
          date,
          detail['1. open'],
          detail['2. high'],
          detail['3. low'],
          detail['4. close'],
          detail['5. volume'],
        ]);

        // Tabla con los detalles del stock
        doc.autoTable({
          startY: 45,
          theme: 'grid',
          head: [['Date', 'Open', 'High', 'Low', 'Close', 'Volume']],
          body: tableData,
          styles: { fontSize: 8 }, // Tamaño de letra más pequeño para la tabla
          headStyles: { fillColor: [22, 160, 133] }, // Color de encabezado
        });
      }
    }

    // Espera a capturar el gráfico
    try {
      const canvas = await html2canvas(document.querySelector("#chart"));
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 15, doc.lastAutoTable.finalY + 10, 180, 60);
    } catch (error) {
      console.error("Error capturing the chart with html2canvas:", error);
    }

    // Guarda el documento
    doc.save(`${selectedStock ? selectedStock : 'portfolio'}-summary.pdf`);
  };

  return (
    <button onClick={generatePDF} style={{ marginTop: '20px', fontSize: '16px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#3498db', color: '#ffffff', border: 'none', borderRadius: '5px' }}>
     Download item in PDF
    </button>
  );
};

export default DownloadPdf;
