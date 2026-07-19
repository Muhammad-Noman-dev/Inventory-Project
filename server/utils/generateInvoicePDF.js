const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoicePDF = (invoice, res) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const invoicesDir = path.join(__dirname, "../../../invoices");

  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const fileName = `${invoice.invoiceNumber}-${Date.now()}.pdf`;
  const filePath = path.join(invoicesDir, fileName);

  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);
  doc.pipe(res);

  // ==================== HEADER ====================
  doc.fontSize(24).font("Helvetica-Bold").text("INVOICE", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(20).font("Helvetica").text("ASHFLEA", { align: "center" });
  doc.fontSize(10).font("Helvetica").text("Phone: 0318-7020058 | Email: borrowvibes@gmail.com", { align: "center" });
  doc.fontSize(10).font("Helvetica").text("Shop G-31 , Kohinoor 1 Plaza Basement Opposite Executive Passport Office ", { align: "center" });
  doc.moveDown(2);

  // Invoice Info
  doc.fontSize(12).font("Helvetica-Bold");
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 150);
 doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 50, 170);

  doc.text(`Customer: ${invoice.customerName}`, 300, 150);
  if (invoice.customerPhone) doc.text(`Phone: ${invoice.customerPhone}`, 300, 170);

  doc.moveDown(2);

  // Table Header
  const tableTop = 220;
  doc.fontSize(11).font("Helvetica-Bold");
  doc.rect(50, tableTop, 500, 25).fill("#f0f0f0").stroke();
  doc.fillColor("#000");

  doc.text("Sr.", 60, tableTop + 8);
  doc.text("Product Name", 120, tableTop + 8);
  doc.text("Qty", 380, tableTop + 8);
  doc.text("Rate", 430, tableTop + 8);
  doc.text("Amount", 500, tableTop + 8);

  // Products
  let y = tableTop + 35;
  doc.font("Helvetica").fontSize(11);

  invoice.products.forEach((item, index) => {
    doc.text((index + 1).toString(), 60, y);
    doc.text(item.name || "Product", 120, y);
    doc.text(item.quantity.toString(), 380, y);
    doc.text(`${item.price}`, 430, y);
    doc.text(`${item.total}`, 500, y);

    y += 25;
  });

  // Totals
  const totalY = y + 20;
  doc.font("Helvetica-Bold");

  doc.text("Subtotal", 380, totalY);
  doc.text(`${invoice.subTotal}`, 500, totalY);

  if (invoice.discount > 0) {
    doc.text("Discount", 380, totalY + 25);
    doc.text(`- ${invoice.discount}`, 500, totalY + 25);
  }

  doc.fontSize(14).text("Grand Total", 380, totalY + 55);
  doc.text(`${invoice.grandTotal}`, 500, totalY + 55);

  // Thank You
  doc.fontSize(12).font("Helvetica").text("Thank you for Visit Here!", 50, totalY + 100, { align: "center" });
  doc.text("", 50, totalY + 120, { align: "center" });

  doc.end();

  console.log(`✅ Professional Invoice Saved: ${filePath}`);
};

module.exports = generateInvoicePDF;