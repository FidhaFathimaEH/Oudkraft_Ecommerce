const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const BUSINESS_DETAILS = {
  name: 'OUD KRAFT',
  tagline: 'Luxury Perfumes · Curated in the Capital',
  location: 'Abu Dhabi, United Arab Emirates',
  phone: '+971 50 983 4317',
  whatsapp: '+971 50 983 4317',
  email: 'hello@oudkraft.ae',
  website: 'oudkraft.ae',
  currency: 'AED',
};

/**
 * Returns an existing invoice number or creates a deterministic, unique one.
 * Uses orderNumber or order ID to ensure collision-free generation.
 */
const getOrGenerateInvoiceNumber = (order) => {
  if (order.invoiceNumber && String(order.invoiceNumber).trim()) {
    return String(order.invoiceNumber).trim();
  }

  const year = new Date(order.createdAt || Date.now()).getFullYear();
  const rawId = order.orderNumber || order._id?.toString() || `${Date.now()}`;
  const cleanId = rawId.replace(/^OK-/, '').replace(/[^A-Za-z0-9]/g, '');

  return `INV-${year}-${cleanId}`;
};

/**
 * Formats a number as AED currency with 2 decimals.
 */
const formatMoney = (amount) => {
  const val = Number(amount) || 0;
  return `${BUSINESS_DETAILS.currency} ${val.toFixed(2)}`;
};

/**
 * Formats a Date object into 'DD Mon YYYY' format.
 */
const formatDate = (date) => {
  if (!date) return '—';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

/**
 * Generates a branded, print-ready PDF invoice buffer for an order.
 *
 * @param {object} order - Mongoose Order document or plain order object
 * @returns {Promise<{ buffer: Buffer, invoiceNumber: string, invoiceIssuedAt: Date }>}
 */
const generateInvoicePdf = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const invoiceNumber = getOrGenerateInvoiceNumber(order);
      const invoiceIssuedAt = order.invoiceIssuedAt || new Date();

      const doc = new PDFDocument({
        size: 'A4', // 595.28 x 841.89 points
        margin: 40,
        bufferPages: true,
        info: {
          Title: `Oud Kraft Invoice - ${invoiceNumber}`,
          Author: 'Oud Kraft Perfumes LLC',
          Subject: `Commercial Invoice for Order ${order.orderNumber || order._id}`,
          Keywords: 'Oud Kraft, Invoice, Perfume, Cash on Delivery',
        },
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({ buffer, invoiceNumber, invoiceIssuedAt });
      });
      doc.on('error', (err) => reject(err));

      const logoPath = path.join(__dirname, '../assets/logo.png');
      const hasLogo = fs.existsSync(logoPath);

      // --- HEADER SECTION ---
      const headerStartY = 40;

      if (hasLogo) {
        try {
          doc.image(logoPath, 40, headerStartY, { width: 100 });
        } catch {
          // If image decoding fails gracefully fall back to text
          doc
            .font('Helvetica-Bold')
            .fontSize(22)
            .fillColor('#0D3B2E')
            .text(BUSINESS_DETAILS.name, 40, headerStartY);
        }
      } else {
        doc
          .font('Helvetica-Bold')
          .fontSize(22)
          .fillColor('#0D3B2E')
          .text(BUSINESS_DETAILS.name, 40, headerStartY);
      }

      // Business Contact Info (Left Column below logo)
      const businessInfoY = hasLogo ? headerStartY + 50 : headerStartY + 28;
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('#5B5B5B')
        .text(BUSINESS_DETAILS.tagline, 40, businessInfoY)
        .text(BUSINESS_DETAILS.location, 40, businessInfoY + 12)
        .text(`Phone / WhatsApp: ${BUSINESS_DETAILS.phone}`, 40, businessInfoY + 23)
        .text(`Email: ${BUSINESS_DETAILS.email}  ·  Web: ${BUSINESS_DETAILS.website}`, 40, businessInfoY + 34);

      // Invoice Title & Meta Box (Top Right Column)
      const metaBoxX = 350;
      doc
        .font('Helvetica-Bold')
        .fontSize(24)
        .fillColor('#0D3B2E')
        .text('INVOICE', metaBoxX, headerStartY, { align: 'right', width: 205 });

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#C6A15B')
        .text(invoiceNumber, metaBoxX, headerStartY + 28, { align: 'right', width: 205 });

      const metaDetailsY = headerStartY + 45;
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('#5B5B5B')
        .text(`Invoice Date: ${formatDate(invoiceIssuedAt)}`, metaBoxX, metaDetailsY, { align: 'right', width: 205 })
        .text(`Order Ref: ${order.orderNumber || order._id || '—'}`, metaBoxX, metaDetailsY + 12, { align: 'right', width: 205 })
        .text(`Order Date: ${formatDate(order.createdAt)}`, metaBoxX, metaDetailsY + 24, { align: 'right', width: 205 })
        .text(`Channel: WhatsApp Concierge (COD)`, metaBoxX, metaDetailsY + 36, { align: 'right', width: 205 });

      // Gold Accent Horizontal Rule
      const dividerY = Math.max(businessInfoY + 52, metaDetailsY + 54);
      doc
        .strokeColor('#C6A15B')
        .lineWidth(1.5)
        .moveTo(40, dividerY)
        .lineTo(555, dividerY)
        .stroke();

      // --- CUSTOMER & DELIVERY ADDRESS SECTION ---
      const customer = order.customer || {};
      const addr = order.deliveryAddress || {};
      const customerSectionY = dividerY + 14;

      // Left Column: Customer & Delivery Details
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#C6A15B')
        .text('BILLED & DELIVERED TO:', 40, customerSectionY);

      let currentAddrY = customerSectionY + 13;
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#0D3B2E')
        .text(customer.name || 'Valued Client', 40, currentAddrY);

      currentAddrY += 14;
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('#171311');

      if (customer.phone) {
        doc.text(`Contact: ${customer.phone}`, 40, currentAddrY);
        currentAddrY += 12;
      }
      if (customer.email) {
        doc.text(`Email: ${customer.email}`, 40, currentAddrY);
        currentAddrY += 12;
      }

      // Address lines
      const addrParts = [];
      if (addr.building) addrParts.push(`Building / Villa: ${addr.building}`);
      if (addr.apartment) addrParts.push(`Apt / Suite: ${addr.apartment}`);
      if (addr.street) addrParts.push(`Street: ${addr.street}`);
      if (addr.area) addrParts.push(`Area: ${addr.area}`);
      if (addr.emirate) addrParts.push(`Emirate: ${addr.emirate}, UAE`);

      if (addrParts.length > 0) {
        addrParts.forEach((part) => {
          doc.text(part, 40, currentAddrY);
          currentAddrY += 12;
        });
      }

      if (addr.instructions) {
        doc.text(`Delivery Note: ${addr.instructions}`, 40, currentAddrY, { width: 250 });
        currentAddrY += doc.heightOfString(`Delivery Note: ${addr.instructions}`, { width: 250 }) + 2;
      }

      // Right Column: Payment & Order Terms Summary Box
      const rightColX = 330;
      const rightColWidth = 225;
      const termsBoxHeight = 84;

      doc
        .roundedRect(rightColX, customerSectionY, rightColWidth, termsBoxHeight, 6)
        .fillColor('#FAF7F2')
        .fill()
        .strokeColor('#E3D9C4')
        .lineWidth(1)
        .stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#C6A15B')
        .text('ORDER & PAYMENT TERMS', rightColX + 12, customerSectionY + 10);

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('#171311')
        .text('Payment Method:', rightColX + 12, customerSectionY + 25)
        .font('Helvetica-Bold')
        .text('Cash on Delivery (COD)', rightColX + 100, customerSectionY + 25)
        .font('Helvetica')
        .text('Payment Status:', rightColX + 12, customerSectionY + 39)
        .font('Helvetica-Bold')
        .fillColor('#B45309') // Amber
        .text('Pending (Pay upon delivery)', rightColX + 100, customerSectionY + 39)
        .font('Helvetica')
        .fillColor('#171311')
        .text('Fulfillment:', rightColX + 12, customerSectionY + 53)
        .font('Helvetica-Bold')
        .fillColor('#0D3B2E')
        .text(order.status || 'Confirmed', rightColX + 100, customerSectionY + 53)
        .font('Helvetica')
        .fillColor('#5B5B5B')
        .text('Terms: Payment strictly due upon receipt.', rightColX + 12, customerSectionY + 68);

      // --- ITEMS TABLE SECTION ---
      const tableStartY = Math.max(currentAddrY + 10, customerSectionY + termsBoxHeight + 14);

      const drawTableHeader = (y) => {
        doc
          .rect(40, y, 515, 22)
          .fillColor('#0D3B2E')
          .fill();

        doc
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .fillColor('#FFFFFF')
          .text('#', 45, y + 6, { width: 20 })
          .text('ITEM & DESCRIPTION', 70, y + 6, { width: 235 })
          .text('SIZE / VARIANT', 310, y + 6, { width: 70 })
          .text('QTY', 385, y + 6, { width: 35, align: 'center' })
          .text('UNIT PRICE', 425, y + 6, { width: 60, align: 'right' })
          .text('SUBTOTAL', 490, y + 6, { width: 60, align: 'right' });

        return y + 22;
      };

      let tableY = drawTableHeader(tableStartY);

      const items = Array.isArray(order.items) && order.items.length > 0
        ? order.items
        : [
            {
              name: 'Oud Kraft Luxury Fragrance',
              size: '100 ml',
              quantity: 1,
              price: order.subtotal || order.total || 0,
              subtotal: order.subtotal || order.total || 0,
            },
          ];

      items.forEach((item, index) => {
        const itemPrice = Number(item.price || 0);
        const itemQty = Number(item.quantity || 1);
        const itemSubtotal = item.subtotal != null ? Number(item.subtotal) : itemPrice * itemQty;
        const itemName = item.name || 'Luxury Fragrance';
        const itemSize = item.size || '100 ml';
        const sku = item.sku || (item.product && item.product._id ? `Ref: ${item.product._id}` : '');

        const textHeight = doc.heightOfString(itemName, { width: 235, font: 'Helvetica-Bold', size: 9 });
        const rowHeight = Math.max(26, textHeight + (sku ? 14 : 6) + 8);

        // Check for page break
        if (tableY + rowHeight > 700) {
          doc.addPage();
          tableY = drawTableHeader(40);
        }

        // Alternating row background
        if (index % 2 === 1) {
          doc
            .rect(40, tableY, 515, rowHeight)
            .fillColor('#FAF7F2')
            .fill();
        }

        // Row content
        doc
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor('#5B5B5B')
          .text(String(index + 1), 45, tableY + 6, { width: 20 });

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#0D3B2E')
          .text(itemName, 70, tableY + 6, { width: 235 });

        if (sku) {
          doc
            .font('Helvetica')
            .fontSize(7.5)
            .fillColor('#8A8A8A')
            .text(sku, 70, tableY + 6 + textHeight + 2, { width: 235 });
        }

        doc
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor('#171311')
          .text(itemSize, 310, tableY + 6, { width: 70 })
          .text(String(itemQty), 385, tableY + 6, { width: 35, align: 'center' })
          .text(formatMoney(itemPrice), 425, tableY + 6, { width: 60, align: 'right' })
          .font('Helvetica-Bold')
          .text(formatMoney(itemSubtotal), 490, tableY + 6, { width: 60, align: 'right' });

        // Bottom border
        doc
          .strokeColor('#E3D9C4')
          .lineWidth(0.5)
          .moveTo(40, tableY + rowHeight)
          .lineTo(555, tableY + rowHeight)
          .stroke();

        tableY += rowHeight;
      });

      // --- FINANCIAL TOTALS BLOCK ---
      // Check if totals block fits on current page
      if (tableY + 160 > 720) {
        doc.addPage();
        tableY = 40;
      }

      const totalsBoxY = tableY + 14;
      const totalsLabelX = 350;
      const totalsValueX = 460;
      const totalsValWidth = 95;

      const subtotal = Number(order.subtotal || items.reduce((acc, it) => acc + (it.price * it.quantity), 0));
      const deliveryFee = Number(order.deliveryFee || 0);
      const discount = Number(order.discount || 0);
      const totalAmount = Number(order.total || subtotal + deliveryFee - discount);

      let totalsCursorY = totalsBoxY;

      // Subtotal line
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#5B5B5B')
        .text('Subtotal:', totalsLabelX, totalsCursorY, { width: 100, align: 'left' })
        .font('Helvetica')
        .fillColor('#171311')
        .text(formatMoney(subtotal), totalsValueX, totalsCursorY, { width: totalsValWidth, align: 'right' });

      totalsCursorY += 15;

      // Delivery Fee line
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#5B5B5B')
        .text(`Delivery Fee (${addr.emirate || 'UAE'}):`, totalsLabelX, totalsCursorY, { width: 100, align: 'left' })
        .font('Helvetica')
        .fillColor('#171311')
        .text(deliveryFee === 0 ? 'Complimentary' : formatMoney(deliveryFee), totalsValueX, totalsCursorY, {
          width: totalsValWidth,
          align: 'right',
        });

      totalsCursorY += 15;

      // Discount line (if applicable)
      if (discount > 0) {
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#059669')
          .text('Promotional Discount:', totalsLabelX, totalsCursorY, { width: 100, align: 'left' })
          .text(`- ${formatMoney(discount)}`, totalsValueX, totalsCursorY, { width: totalsValWidth, align: 'right' });
        totalsCursorY += 15;
      }

      // Separator rule before Grand Total
      doc
        .strokeColor('#0D3B2E')
        .lineWidth(1)
        .moveTo(totalsLabelX, totalsCursorY + 3)
        .lineTo(555, totalsCursorY + 3)
        .stroke();

      totalsCursorY += 8;

      // Grand Total Box / Highlight
      doc
        .rect(totalsLabelX - 6, totalsCursorY - 2, 211, 26)
        .fillColor('#0D3B2E')
        .fill();

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#C6A15B')
        .text('TOTAL AMOUNT DUE:', totalsLabelX, totalsCursorY + 6, { width: 110 })
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#FFFFFF')
        .text(formatMoney(totalAmount), totalsValueX, totalsCursorY + 5, { width: totalsValWidth, align: 'right' });

      // --- PAYMENT TERMS & DELIVERY NOTE (Left of totals or full width below) ---
      const paymentNoticeY = Math.max(totalsCursorY + 38, tableY + 14);

      doc
        .roundedRect(40, paymentNoticeY, 515, 48, 6)
        .fillColor('#FAF7F2')
        .fill()
        .strokeColor('#C6A15B')
        .lineWidth(0.8)
        .stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#0D3B2E')
        .text('CASH ON DELIVERY NOTICE & INSTRUCTIONS:', 52, paymentNoticeY + 8)
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#171311')
        .text(
          `• Total payable upon courier delivery is ${formatMoney(totalAmount)}. Please prepare the exact cash amount.\n• Your fragrance order was confirmed directly via Oud Kraft WhatsApp Concierge (+971 50 983 4317).`,
          52,
          paymentNoticeY + 22,
          { width: 490, lineGap: 2 }
        );

      // Thank you message
      const thankYouY = paymentNoticeY + 56;
      doc
        .font('Helvetica-Oblique')
        .fontSize(9)
        .fillColor('#0D3B2E')
        .text('Thank you for choosing Oud Kraft. May your fragrance bring joy and elegance.', 40, thankYouY, {
          align: 'center',
          width: 515,
        });

      // Statutory & Tax Transparency Notice
      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#8A8A8A')
        .text(
          'This commercial invoice and delivery voucher is issued for confirmed WhatsApp orders. Official statutory VAT and tax registration credentials will be reflected upon formal registration.',
          40,
          thankYouY + 15,
          { align: 'center', width: 515 }
        );

      // --- PAGE FOOTERS ---
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);

        // Thin divider above footer
        doc
          .strokeColor('#E3D9C4')
          .lineWidth(0.5)
          .moveTo(40, 795)
          .lineTo(555, 795)
          .stroke();

        doc
          .font('Helvetica')
          .fontSize(7.5)
          .fillColor('#8A8A8A')
          .text(
            `${BUSINESS_DETAILS.name} · ${BUSINESS_DETAILS.location} · Concierge: ${BUSINESS_DETAILS.phone} · ${BUSINESS_DETAILS.email}`,
            40,
            803,
            { align: 'left', width: 400 }
          )
          .text(`Page ${i + 1} of ${range.count}`, 440, 803, { align: 'right', width: 115 });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateInvoicePdf,
  getOrGenerateInvoiceNumber,
  BUSINESS_DETAILS,
  formatMoney,
  formatDate,
};
