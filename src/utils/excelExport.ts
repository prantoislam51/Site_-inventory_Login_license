/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from 'xlsx';

export type SalesForExport = Array<any>;

export interface SalesExportOptions {
  fileName: string;
  reportTitle: string;
  periodLabel?: string;
  productsMaster?: Record<string, any>;
}

function normalizeSale(sale: any) {
  const saleDate: string = sale.timestamp || sale.dateOfSale || sale.saleDate || '';
  const productId: string = sale.productId || sale.productID || sale.uniqueId || sale.commonId || '';
  const quantity: number = sale.quantity ?? sale.quantitySold ?? 0;
  const unitPrice: number = sale.sellpricePerUnit ?? sale.soldPrice ?? 0;
  const totalPrice: number = sale.totalPrice ?? (unitPrice * quantity);
  const discount: number = sale.productDiscountAmount ?? sale.discountValue ?? 0;
  const serials: string[] = Array.isArray(sale.productSerialNumber)
    ? sale.productSerialNumber
    : Array.isArray(sale.serialNumbers)
    ? sale.serialNumbers
    : [];

  return {
    saleId: sale.saleId || sale.id || '',
    productId,
    productName: sale.productName || sale.product?.name || '',
    quantity,
    unitPrice,
    totalPrice,
    unit: sale.unit || sale.product?.unit || '',
    saleDate,
    customerName: sale.customerName || sale.customer?.name || '',
    customerMobile: sale.customerMobile || sale.customer?.mobile || '',
    customerEmail: sale.customerEmail || sale.customer?.email || '',
    discount,
    serialNumbers: serials,
    soldByEmail: sale.soldByEmail || sale.userEmail || '',
    warrantyEndDate: sale.warrantyEndDate || '',
  };
}

export function buildSalesAggregation(rows: ReturnType<typeof normalizeSale>[]) {
  const byProduct: Record<string, {
    productId: string;
    productName: string;
    quantity: number;
    totalSales: number;
    unitPrice: number;
    dates: string[];
    serialNumbers: string[];
    minUnitPrice: number;
    maxUnitPrice: number;
    customers: Set<string>;
  }> = {};

  for (const r of rows) {
    if (!byProduct[r.productId]) {
      byProduct[r.productId] = {
        productId: r.productId,
        productName: r.productName,
        quantity: 0,
        totalSales: 0,
        unitPrice: r.unitPrice,
        dates: [],
        serialNumbers: [],
        minUnitPrice: Number.isFinite(r.unitPrice) ? r.unitPrice : 0,
        maxUnitPrice: Number.isFinite(r.unitPrice) ? r.unitPrice : 0,
        customers: new Set<string>(),
      };
    }
    byProduct[r.productId].quantity += r.quantity;
    byProduct[r.productId].totalSales += r.totalPrice;
    const d = r.saleDate ? new Date(r.saleDate).toLocaleDateString() : '';
    if (d && !byProduct[r.productId].dates.includes(d)) byProduct[r.productId].dates.push(d);
    byProduct[r.productId].serialNumbers.push(...(r.serialNumbers || []));
    if (Number.isFinite(r.unitPrice)) {
      byProduct[r.productId].minUnitPrice = Math.min(byProduct[r.productId].minUnitPrice, r.unitPrice);
      byProduct[r.productId].maxUnitPrice = Math.max(byProduct[r.productId].maxUnitPrice, r.unitPrice);
    }
    const customerKey = (r.customerMobile || r.customerEmail || r.customerName || '').trim();
    if (customerKey) byProduct[r.productId].customers.add(customerKey);
  }

  const rowsOut = Object.values(byProduct).map(p => ({
    productId: p.productId,
    productName: p.productName,
    quantity: p.quantity,
    totalSales: p.totalSales,
    unitPrice: p.unitPrice,
    avgUnitPrice: p.quantity > 0 ? p.totalSales / p.quantity : 0,
    minUnitPrice: p.minUnitPrice,
    maxUnitPrice: p.maxUnitPrice,
    distinctCustomers: p.customers.size,
    serialNumbers: p.serialNumbers.join(', '),
    dates: p.dates.join(', '),
  }));

  const totals = rowsOut.reduce((acc, r) => {
    acc.totalQuantity += r.quantity;
    acc.totalRevenue += r.totalSales;
    return acc;
  }, { totalQuantity: 0, totalRevenue: 0 });

  return { rows: rowsOut, totals };
}

export function exportSalesToExcel(sales: SalesForExport, options: SalesExportOptions) {
  const normalized = sales.map(normalizeSale);
  const { rows, totals } = buildSalesAggregation(normalized);

  const summaryData = [
    { Report: options.reportTitle },
    { Period: options.periodLabel || '' },
    { GeneratedAt: new Date().toLocaleString() },
    {},
    { Metric: 'Total Products (rows)', Value: rows.length },
    { Metric: 'Total Quantity', Value: totals.totalQuantity },
    { Metric: 'Total Revenue', Value: totals.totalRevenue },
  ];
  const summaryWs = XLSX.utils.json_to_sheet(summaryData, { skipHeader: true });

  const master = options.productsMaster || {};

  const perProductWs = XLSX.utils.json_to_sheet(rows.map(r => {
    const prod = master[r.productId] || {};
    return {
      'Product ID': r.productId,
      'Product Name': r.productName,
      'Brand': prod.brand || prod.brandName || '',
      'Category': prod.category || '',
      'Unit': prod.unit || '',
      'Current Sell Price': prod.sellpricePerUnit ?? '',
      'Current Buy Price': prod.buypricePerUnit ?? '',
      'Quantity Sold': r.quantity,
      'Avg Unit Price (Period)': r.avgUnitPrice,
      'Min Unit Price (Period)': r.minUnitPrice,
      'Max Unit Price (Period)': r.maxUnitPrice,
      'Total Sales': r.totalSales,
      'Distinct Customers': r.distinctCustomers,
      'Serial Numbers': r.serialNumbers,
      'Dates': r.dates,
    };
  }));

  const detailedWs = XLSX.utils.json_to_sheet(normalized.map(r => ({
    'Sale ID': r.saleId,
    'Product ID': r.productId,
    'Product Name': r.productName,
    'Quantity': r.quantity,
    'Unit Price': r.unitPrice,
    'Total Price': r.totalPrice,
    'Unit': r.unit,
    'Sale Date': r.saleDate ? new Date(r.saleDate).toLocaleString() : '',
    'Customer Name': r.customerName,
    'Customer Mobile': r.customerMobile,
    'Customer Email': r.customerEmail,
    'Discount': r.discount,
    'Serial Numbers': (r.serialNumbers || []).join(', '),
    'Sold By Email': r.soldByEmail,
    'Warranty End Date': r.warrantyEndDate || '',
  })));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  XLSX.utils.book_append_sheet(wb, perProductWs, 'Per Product');
  XLSX.utils.book_append_sheet(wb, detailedWs, 'Details');

  const sanitizeSheetName = (name: string) =>
    name.replace(/[\\/?*\[\]:]/g, '').slice(0, 31) || 'Product';

  const byProductId: Record<string, ReturnType<typeof normalizeSale>[]> = {};
  for (const r of normalized) {
    if (!byProductId[r.productId]) byProductId[r.productId] = [];
    byProductId[r.productId].push(r);
  }

  for (const productId of Object.keys(byProductId)) {
    const prodRows = byProductId[productId];
    const { rows: aggRows } = buildSalesAggregation(prodRows);
    const agg = aggRows[0];
    const prod = master[productId] || {};

    const header = [
      { Field: 'Product ID', Value: productId },
      { Field: 'Product Name', Value: agg?.productName || prod.name || '' },
      { Field: 'Brand', Value: prod.brand || '' },
      { Field: 'Category', Value: prod.category || '' },
      { Field: 'Unit', Value: prod.unit || '' },
      { Field: 'Current Sell Price', Value: prod.sellpricePerUnit ?? '' },
      { Field: 'Current Buy Price', Value: prod.buypricePerUnit ?? '' },
      { Field: 'Quantity Sold (Period)', Value: agg?.quantity ?? 0 },
      { Field: 'Total Sales (Period)', Value: agg?.totalSales ?? 0 },
      { Field: 'Avg Unit Price (Period)', Value: agg?.avgUnitPrice ?? 0 },
      { Field: 'Min/Max Unit Price', Value: `${agg?.minUnitPrice ?? ''} / ${agg?.maxUnitPrice ?? ''}` },
      { Field: 'Distinct Customers', Value: agg?.distinctCustomers ?? 0 },
    ];
    const headerWs = XLSX.utils.json_to_sheet(header);
    XLSX.utils.sheet_add_aoa(headerWs, [['']], { origin: -1 });
    XLSX.utils.sheet_add_json(headerWs, prodRows.map(r => ({
      'Sale ID': r.saleId,
      'Sale Date': r.saleDate ? new Date(r.saleDate).toLocaleString() : '',
      'Quantity': r.quantity,
      'Unit Price': r.unitPrice,
      'Total Price': r.totalPrice,
      'Customer Name': r.customerName,
      'Customer Mobile': r.customerMobile,
      'Discount': r.discount,
      'Serial Numbers': (r.serialNumbers || []).join(', '),
      'Sold By Email': r.soldByEmail,
    })), { origin: -1 });

    const sheetNameBase = (agg?.productName || prod.name || productId) as string;
    const sheetName = sanitizeSheetName(sheetNameBase);
    let finalName = sheetName;
    let attempt = 1;
    while ((wb.SheetNames || []).includes(finalName)) {
      const suffix = `_${attempt++}`;
      finalName = sanitizeSheetName(sheetName.slice(0, 31 - suffix.length) + suffix);
    }
    XLSX.utils.book_append_sheet(wb, headerWs, finalName);
  }

  const safeName = options.fileName.endsWith('.xlsx') ? options.fileName : `${options.fileName}.xlsx`;
  XLSX.writeFile(wb, safeName);
}
