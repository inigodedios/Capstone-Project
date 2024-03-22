import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

/**
 * Generates and downloads a PDF summary of a selected stock from the user's portfolio.
 * If no stock is selected, an alert prompts the user to select a stock.
 * 
 * @param {Object} props Contains the user's portfolio, details of the selected stock, and the symbol of the selected stock.
 * @param {Object} props.portfolio The user's entire stock portfolio.
 * @param {Object} props.stockDetails Detailed information about the user's stocks.
 * @param {string} props.selectedStock The symbol of the stock selected by the user for the PDF summary.
 * @returns A button that, when clicked, generates and downloads the PDF summary.
 */
const DownloadPdf = ({ portfolio, stockDetails, selectedStock }) => {
  const generatePDF = async () => {
    if (!selectedStock) {
      alert("Please select a stock to download its PDF summary.");
      return; // Stop the function execution if no stock is selected
    }
    const doc = new jsPDF();
    
    // Set the font and size for the PDF to ensure a professional appearance
    doc.setFont("helvetica");
    doc.setFontSize(10);

    // Add the current date to the PDF for reference
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    doc.text(`Date: ${currentDate}`, 150, 10); 

    // Add a title to the PDF, centered on the page.
    doc.setFontSize(16);
    doc.text("Portfolio Summary", 105, 20, null, null, "center");

     // If a stock is selected, include its name, quantity, and total value in the PDF
    if (selectedStock) {
      const stock = portfolio.stocks.find(s => s.symbol === selectedStock);
      if (stock) {
        doc.setFontSize(12); // Ligeramente más grande para subtítulos
        doc.text(`Stock: ${selectedStock}`, 20, 30);
        doc.text(`Quantity: ${stock.quantity}`, 20, 35);
        doc.text(`Total value: $${stock.value.toFixed(2)}`, 20, 40);
      }

      // If detailed stock data is available, format it into a table and add to the PDF.
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

    // Attempt to capture and add the stock chart as an image in the PDF.
    try {
      const canvas = await html2canvas(document.querySelector("#chart"));
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 15, doc.lastAutoTable.finalY + 10, 180, 100);
    } catch (error) {
      console.error("Error capturing the chart with html2canvas:", error);
    }

    // Save the PDF document, naming it based on whether a specific stock or the entire portfolio is summarized.
    doc.save(`${selectedStock ? selectedStock : 'portfolio'}-summary.pdf`);
  };

  // Render a button that triggers the PDF generation when clicked.
  return (
    <button onClick={generatePDF} style={{ marginTop: '20px', fontSize: '16px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#3498db', color: '#ffffff', border: 'none', borderRadius: '5px' }}>
     Download item in PDF
    </button>
  );
};

export default DownloadPdf;
