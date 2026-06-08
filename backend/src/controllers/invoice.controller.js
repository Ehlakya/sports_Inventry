const PDFDocument = require('pdfkit-table');
const { Order, OrderItem, Product, Category, User, Invoice } = require('../models');

const downloadInvoice = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Fetch order with all necessary relations
    const order = await Order.findByPk(orderId, {
      include: [
        { model: Invoice, as: 'invoice' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'address'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['productName', 'brand', 'customerPrice', 'supplierPrice']
          }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Role-based access control
    if (userRole !== 'ADMIN' && order.userId !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only download your own invoices.' });
    }

    // Backwards compatibility: If an older order doesn't have an invoice record, generate one on-the-fly.
    let currentInvoice = order.invoice;
    if (!currentInvoice) {
      currentInvoice = await Invoice.create({
        invoiceNumber: `INV-${order.orderNumber || order.id}`,
        orderId: order.id
      });
      order.invoice = currentInvoice;
    }

    // Prepare Document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set headers to trigger file download in browser
    const filename = userRole === 'SUPPLIER' || order.orderType === 'SUPPLIER_ORDER' 
      ? `Supplier_Invoice_${order.orderNumber}.pdf` 
      : `Invoice_${order.orderNumber}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // --- Header Section ---
    doc.fontSize(20).font('Helvetica-Bold').text('SPORTS INVENTORY', 50, 45);
    doc.fontSize(10).font('Helvetica').text('123 Sports Avenue, Fitness City, 560001', 50, 70);
    doc.text('Phone: +91-9876543210 | Email: billing@sportsinventory.com', 50, 85);
    
    doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', 400, 45, { align: 'right' });
    
    // --- Invoice Details ---
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica-Bold').text(`Invoice Number: `, 50, 130, { continued: true }).font('Helvetica').text(currentInvoice.invoiceNumber);
    doc.font('Helvetica-Bold').text(`Order Number: `, 50, 145, { continued: true }).font('Helvetica').text(order.orderNumber);
    doc.font('Helvetica-Bold').text(`Order Date: `, 50, 160, { continued: true }).font('Helvetica').text(new Date(order.createdAt).toLocaleDateString());
    doc.font('Helvetica-Bold').text(`Status: `, 50, 175, { continued: true }).font('Helvetica').text(order.orderStatus);

    // --- Customer/Supplier Details ---
    const isSupplier = order.orderType === 'SUPPLIER_ORDER';
    doc.font('Helvetica-Bold').text(isSupplier ? 'Supplier Details:' : 'Customer Details:', 350, 130);
    doc.font('Helvetica').text(order.user.name, 350, 145);
    doc.text(order.user.email, 350, 160);
    doc.text(order.user.phone || 'N/A', 350, 175);
    doc.text(order.user.address || 'N/A', 350, 190, { width: 200 });

    doc.moveDown(4);

    // --- Table of Items ---
    const table = {
      title: "Order Items",
      headers: [
        { label: "Product", property: 'product', width: 150 },
        { label: "Size", property: 'size', width: 60 },
        { label: "Price", property: 'price', width: 80 },
        { label: "Qty", property: 'qty', width: 60 },
        { label: "Total", property: 'total', width: 80 }
      ],
      rows: order.items.map(item => {
        const itemPrice = parseFloat(item.price);
        return [
          `${item.product.brand} ${item.product.productName}`,
          item.size !== 'N/A' ? item.size : '-',
          `Rs. ${itemPrice.toLocaleString('en-IN')}`,
          item.quantity.toString(),
          `Rs. ${(itemPrice * item.quantity).toLocaleString('en-IN')}`
        ];
      })
    };

    await doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
      prepareRow: (row, i) => doc.font("Helvetica").fontSize(10),
      x: 50,
      y: doc.y + 10
    });

    // --- Totals Section ---
    doc.moveDown(2);
    const subtotal = parseFloat(order.subtotal);
    const gst = parseFloat(order.gstAmount);
    const total = parseFloat(order.totalAmount);
    
    // Draw total box
    const startX = 350;
    const currentY = doc.y;
    
    doc.font('Helvetica-Bold').text('Subtotal:', startX, currentY);
    doc.font('Helvetica').text(`Rs. ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, startX + 100, currentY, { align: 'right' });
    
    doc.font('Helvetica-Bold').text('GST:', startX, currentY + 20);
    doc.font('Helvetica').text(`Rs. ${gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, startX + 100, currentY + 20, { align: 'right' });
    
    doc.rect(startX, currentY + 40, 200, 0).stroke();
    
    doc.fontSize(12).font('Helvetica-Bold').text('Total Amount:', startX, currentY + 50);
    doc.fontSize(12).font('Helvetica-Bold').text(`Rs. ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, startX + 80, currentY + 50, { align: 'right' });

    doc.moveDown(4);

    // --- Footer Section ---
    doc.fontSize(10).font('Helvetica-Bold').text('Expected Delivery Date:', 50, doc.y);
    doc.font('Helvetica').text(new Date(order.estimatedDeliveryDate).toLocaleDateString(), 50, doc.y);
    
    doc.moveDown(2);
    doc.fontSize(9).font('Helvetica-Oblique').text('Thank you for your business. This is a computer-generated invoice and requires no signature.', 50, doc.y, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Invoice Generation Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate invoice.' });
    }
  }
};

module.exports = {
  downloadInvoice
};
