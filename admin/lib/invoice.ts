export interface InvoiceOrderData {
  orderNumber: string;
  createdAt?: string | Date;
  customerDetails?: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    fullName?: string;
    phone?: string;
    houseNumber?: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  gstDetails?: {
    hasGst?: boolean;
    gstin?: string;
    businessName?: string;
    businessAddress?: string;
  };
  items: Array<{
    name: string;
    sku?: string;
    quantity: number;
    unitPrice?: number;
    subtotal: number;
  }>;
  pricing: {
    subtotal: number;
    chairDiscountAmount?: number;
    chairDiscountPercentage?: number;
    discount?: number;
    shippingCharges?: number;
    tax?: number;
    total: number;
  };
  paymentStatus: string;
  paymentDetails?: {
    provider?: string;
    paymentId?: string;
  };
}

export function generateInvoiceHtml(order: InvoiceOrderData): string {
  const money = (num: number) => `₹${Number(num || 0).toLocaleString('en-IN')}`;
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const isIntraState =
    order.shippingAddress.state?.trim().toLowerCase() === 'maharashtra';
  
  const total = order.pricing.total;
  const taxableBase = Math.round(total / 1.18);
  const totalTax = total - taxableBase;
  const halfTax = Math.round(totalTax / 2);

  const billedName =
    order.gstDetails?.businessName ||
    order.customerDetails?.name ||
    order.shippingAddress.fullName ||
    'Customer';

  const rows = order.items
    .map((item, idx) => {
      const unit =
        item.unitPrice ||
        (item.quantity ? Math.round(item.subtotal / item.quantity) : item.subtotal);
      return `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB;">
          <strong style="color: #111827;">${item.name}</strong>
          ${item.sku ? `<div style="font-size: 11px; color: #6B7280; font-family: monospace;">SKU: ${item.sku}</div>` : ''}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB; text-align: center; font-family: monospace;">9401</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB; text-align: right;">${money(unit)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB; text-align: right; font-weight: 600;">${money(item.subtotal)}</td>
      </tr>
    `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tax Invoice - ${order.orderNumber}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      margin: 0;
      padding: 32px;
      color: #1F2937;
      background: #FFFFFF;
      font-size: 13px;
      line-height: 1.5;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 36px;
    }
    @media print {
      body { padding: 0; background: none; }
      .invoice-card { border: none; padding: 0; max-width: 100%; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 800px; margin: 0 auto 20px auto; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-size: 13px; color: #6B7280;">ErgoCraft Official Tax Bill / Invoice (Admin Copy)</span>
    <button onclick="window.print()" style="background: #13231D; color: #FFFFFF; border: none; padding: 8px 18px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;">
      Print / Save as PDF
    </button>
  </div>

  <div class="invoice-card">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #78836A; padding-bottom: 20px; margin-bottom: 24px;">
      <div>
        <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #13231D; letter-spacing: 1px; font-family: Georgia, serif;">
          ERGOCRAFT
        </h1>
        <div style="font-size: 10px; font-weight: 700; color: #78836A; letter-spacing: 2.5px; text-transform: uppercase; margin-top: 2px;">
          SEATING PVT. LTD.
        </div>
        <p style="margin: 8px 0 0; font-size: 11px; color: #4B5563; line-height: 1.4;">
          Direct Bhiwandi Central Facility, Thane, Maharashtra - 421302<br />
          <strong>GSTIN:</strong> 27AABCE9876K1Z2 | <strong>State:</strong> Maharashtra (Code: 27)<br />
          Email: contact@ergocraft.in | Phone: +91 97680 01999
        </p>
      </div>
      <div style="text-align: right;">
        <div style="background: #F3F4F6; color: #13231D; font-weight: 800; font-size: 13px; padding: 6px 14px; border-radius: 4px; display: inline-block; letter-spacing: 1px; text-transform: uppercase;">
          ${order.gstDetails?.gstin ? 'TAX INVOICE (B2B)' : 'RETAIL INVOICE (B2C)'}
        </div>
        <div style="margin-top: 10px; font-size: 12px;">
          <div><strong>Invoice / Order No:</strong> <span style="font-family: monospace;">${order.orderNumber}</span></div>
          <div><strong>Date:</strong> ${dateStr}</div>
          <div><strong>Payment Mode:</strong> ${order.paymentDetails?.provider === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)'}</div>
          <div><strong>Status:</strong> <span style="text-transform: capitalize; font-weight: bold; color: ${order.paymentStatus === 'paid' ? '#047857' : '#B45309'};">${order.paymentStatus}</span></div>
        </div>
      </div>
    </div>

    <!-- Billed To & Shipped To Grid -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; background: #FAF9F6; padding: 16px; border-radius: 6px; border: 1px solid #E8E5DE;">
      <div>
        <div style="font-size: 11px; font-weight: 700; color: #78836A; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
          Billed To:
        </div>
        <div style="font-weight: 700; font-size: 14px; color: #111827;">${billedName}</div>
        ${
          order.gstDetails?.gstin
            ? `<div style="margin: 4px 0; background: #FEF3C7; padding: 3px 8px; border-radius: 4px; border: 1px solid #F59E0B; display: inline-block; font-size: 12px; color: #92400E;">
                <strong>GSTIN:</strong> <span style="font-family: monospace; font-weight: bold;">${order.gstDetails.gstin}</span>
              </div><br />`
            : '<div style="font-size: 11px; color: #6B7280;">GST: Unregistered Retail Consumer</div>'
        }
        ${order.customerDetails?.phone ? `<div>Phone: ${order.customerDetails.phone}</div>` : ''}
        ${order.customerDetails?.email ? `<div>Email: ${order.customerDetails.email}</div>` : ''}
        ${order.gstDetails?.businessAddress ? `<div style="font-size: 11px; color: #4B5563; margin-top: 4px;">${order.gstDetails.businessAddress}</div>` : ''}
      </div>

      <div>
        <div style="font-size: 11px; font-weight: 700; color: #78836A; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
          Shipped / Delivered To:
        </div>
        <div style="font-weight: 600; color: #111827;">${order.shippingAddress.fullName || billedName}</div>
        <div style="color: #4B5563; line-height: 1.4;">
          ${order.shippingAddress.houseNumber ? `${order.shippingAddress.houseNumber}, ` : ''}
          ${order.shippingAddress.street}<br />
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}<br />
          India
        </div>
        <div style="margin-top: 4px; font-size: 11px; color: #6B7280;">
          Place of Supply: <strong>${order.shippingAddress.state}</strong>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px;">
      <thead>
        <tr style="background: #13231D; color: #FFFFFF; font-weight: 600;">
          <th style="padding: 10px 12px; text-align: center; width: 40px;">#</th>
          <th style="padding: 10px 12px; text-align: left;">Item Description</th>
          <th style="padding: 10px 12px; text-align: center; width: 70px;">HSN</th>
          <th style="padding: 10px 12px; text-align: center; width: 50px;">Qty</th>
          <th style="padding: 10px 12px; text-align: right; width: 100px;">Rate</th>
          <th style="padding: 10px 12px; text-align: right; width: 110px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <!-- Totals and Tax Breakdown -->
    <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
      <div style="width: 320px; font-size: 12px;">
        <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #4B5563;">
          <span>Subtotal:</span>
          <span style="font-weight: 600; color: #111827;">${money(order.pricing.subtotal)}</span>
        </div>
        ${
          order.pricing.chairDiscountAmount
            ? `<div style="display: flex; justify-content: space-between; padding: 4px 0; color: #047857;">
                <span>Chair Discount (${order.pricing.chairDiscountPercentage}%):</span>
                <span>-${money(order.pricing.chairDiscountAmount)}</span>
              </div>`
            : ''
        }
        <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #4B5563;">
          <span>Shipping & Delivery:</span>
          <span style="font-weight: 600; color: #047857;">${!order.pricing.shippingCharges ? 'FREE' : money(order.pricing.shippingCharges)}</span>
        </div>
        <div style="border-top: 1px dashed #D1D5DB; margin: 6px 0;"></div>
        
        <!-- Tax breakup (18% inclusive) -->
        <div style="font-size: 11px; color: #6B7280; padding: 2px 0;">
          <span>Taxable Value:</span>
          <span style="float: right;">${money(taxableBase)}</span>
        </div>
        ${
          isIntraState
            ? `<div style="font-size: 11px; color: #6B7280; padding: 2px 0;">
                <span>CGST (9%):</span>
                <span style="float: right;">${money(halfTax)}</span>
              </div>
              <div style="font-size: 11px; color: #6B7280; padding: 2px 0;">
                <span>SGST (9%):</span>
                <span style="float: right;">${money(halfTax)}</span>
              </div>`
            : `<div style="font-size: 11px; color: #6B7280; padding: 2px 0;">
                <span>IGST (18%):</span>
                <span style="float: right;">${money(totalTax)}</span>
              </div>`
        }
        
        <div style="border-top: 2px solid #13231D; margin: 8px 0;"></div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 15px; font-weight: 800; color: #13231D;">
          <span>Grand Total:</span>
          <span style="color: #78836A;">${money(order.pricing.total)}</span>
        </div>
        <div style="font-size: 10px; color: #9CA3AF; text-align: right;">(Inclusive of all taxes)</div>
      </div>
    </div>

    <!-- Footer Notes -->
    <div style="border-top: 1px solid #E5E7EB; padding-top: 16px; font-size: 11px; color: #6B7280; display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <div style="font-weight: 600; color: #374151; margin-bottom: 2px;">Terms & Conditions:</div>
        <div>1. Goods once sold are covered under ErgoCraft 10-Year Structural Warranty.</div>
        <div>2. All disputes subject to Thane / Mumbai jurisdiction.</div>
        <div style="margin-top: 4px; font-style: italic;">This is a computer-generated tax invoice. No signature is required.</div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 700; color: #13231D;">For ERGOCRAFT SEATING PVT. LTD.</div>
        <div style="height: 36px;"></div>
        <div style="font-size: 10px; color: #9CA3AF;">Authorized Signatory</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function printInvoice(order: InvoiceOrderData): void {
  if (typeof window === 'undefined') return;

  const html = generateInvoiceHtml(order);
  const printWindow = window.open('', '_blank', 'width=850,height=950');

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      try {
        printWindow.print();
      } catch (e) {
        console.error('Print window error:', e);
      }
    }, 400);
  } else {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 400);
    }
  }
}
