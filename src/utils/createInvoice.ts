import { join } from 'path';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import appRootPath from 'app-root-path';

import { OrderDocument } from '../models/order.js';

const rootDir = appRootPath.toString();

/**
 * Generates the header section of the invoice document.
 * @param document - PDFDocument instance
 */
const generateHeader = (document: PDFKit.PDFDocument): void => {
  document
    .image(join(rootDir, 'public', 'img', 'logo.jpg'), 50, 45, {
      width: 100,
    })
    .font('Helvetica')
    .fillColor('#444444')
    .fontSize(10)
    .text('UrbanStride', 200, 50, { align: 'right' })
    .text('© Shashank Singh', 200, 65, {
      align: 'right',
    })
    .moveDown();
};

/**
 * Generates a horizontal line in the document.
 * @param document - PDFDocument instance
 * @param yPos - Y position for the line
 */
const generateHr = (document: PDFKit.PDFDocument, yPos: number): void => {
  document
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(50, yPos)
    .lineTo(550, yPos)
    .stroke();
};

/**
 * Formats the given date to a string.
 * @param date - Date object
 * @returns - Formatted date string
 */
const formatDate = (date: Date): string =>
  `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;

/**
 * Calculates the subtotal of the order.
 * @param order - OrderDocument instance
 * @returns - Subtotal as a string
 */
const getSubtotal = (order: OrderDocument): string => {
  let totalOrderPrice = 0;
  order.products.forEach(({ product }, quantity) => {
    totalOrderPrice += product.price * quantity;
  });
  return totalOrderPrice.toFixed(2);
};

/**
 * Truncates the given text if its length exceeds 30 characters.
 * @param text - Input text
 * @returns - Truncated text
 */
const truncateText = (text: string): string =>
  text.length <= 30 ? text : `${text.slice(0, 30)}...`;

/**
 * Generates the order information section of the invoice.
 * @param document - PDFDocument instance
 * @param order - OrderDocument instance
 */
const generateOrderInfo = (
  document: PDFKit.PDFDocument,
  order: OrderDocument,
): void => {
  document.fillColor('#444444').fontSize(20).text('Order Invoice', 50, 160);

  generateHr(document, 185);

  const orderInfoTop = 200;

  document
    .fontSize(10)
    .text('Order ID:', 50, orderInfoTop)
    .font('Helvetica-Bold')
    .text(order._id, 150, orderInfoTop)
    .font('Helvetica')
    .text('Order Date:', 50, orderInfoTop + 15)
    .text(formatDate(new Date()), 150, orderInfoTop + 15)
    .text('Subtotal:', 50, orderInfoTop + 30)
    .text(`$${getSubtotal(order)}`, 150, orderInfoTop + 30)
    .text('Contact:', 50, orderInfoTop + 45)
    .text(`${order.user.name}`, 150, orderInfoTop + 45)
    .moveDown();

  generateHr(document, 267);
};

/**
 * Generates a table row in the invoice document.
 * @param document - PDFDocument instance
 * @param yPos - Y position for the row
 * @param item - Item name
 * @param description - Item description
 * @param price - Item price
 * @param quantity - Item quantity
 * @param lineTotal - Total price for the item
 */
const generateTableRow = (
  document: PDFKit.PDFDocument,
  yPos: number,
  item: string,
  description: string,
  price: string,
  quantity: string,
  lineTotal: string,
): void => {
  document
    .fontSize(10)
    .text(item, 50, yPos)
    .text(truncateText(description), 150, yPos)
    .text(price, 280, yPos, { width: 90, align: 'right' })
    .text(quantity, 370, yPos, { width: 90, align: 'right' })
    .text(lineTotal, 0, yPos, { align: 'right' });
};

/**
 * Generates the invoice table section.
 * @param document - PDFDocument instance
 * @param order - OrderDocument instance
 */
const generateInvoiceTable = (
  document: PDFKit.PDFDocument,
  order: OrderDocument,
): void => {
  let i;
  const invoiceTableTop = 330;

  document.font('Helvetica-Bold');
  generateTableRow(
    document,
    invoiceTableTop,
    'Item',
    'Description',
    'Price ($)',
    'Quantity',
    'Line Total ($)',
  );
  generateHr(document, invoiceTableTop + 20);
  document.font('Helvetica');

  for (i = 0; i < order.products.length; i++) {
    const orderItem = order.products[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      document,
      position,
      orderItem.product.title,
      orderItem.product.description,
      `${orderItem.product.price}`,
      orderItem.quantity.toString(),
      `${(orderItem.product.price * orderItem.quantity).toFixed(2)}`,
    );
    generateHr(document, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  document.font('Helvetica-Bold');
  generateTableRow(
    document,
    subtotalPosition,
    '',
    '',
    'Subtotal ($)',
    '',
    `${getSubtotal(order)}`,
  );
  document.font('Helvetica');
};

/**
 * Generates the footer section of the invoice.
 * @param document - PDFDocument instance
 */
const generateFooter = (document: PDFKit.PDFDocument): void => {
  document
    .fontSize(10)
    .text(
      `© Shashank Singh (@honeybearcozy) ${new Date().getFullYear()}`,
      50,
      780,
      {
        align: 'center',
        width: 500,
      },
    );
};

/**
 * Creates and sends the invoice as a PDF.
 * @param order - OrderDocument instance
 * @param response - Express Response object
 */
const createInvoice = (order: OrderDocument, response: Response): void => {
  const invoiceName = `invoice-${order._id}.pdf`;

  const document = new PDFDocument({ size: 'A4', margin: 50 });

  generateHeader(document);
  generateOrderInfo(document, order);
  generateInvoiceTable(document, order);
  generateFooter(document);

  document.end();

  response.setHeader('Content-Type', 'application/pdf');
  response.setHeader(
    'Content-Disposition',
    `inline; filename="${invoiceName}"`,
  );
  document.pipe(response);
};

export default createInvoice;
