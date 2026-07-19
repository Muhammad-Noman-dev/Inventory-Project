export const toNumber = (value) => Number(value) || 0;

export const getProductId = (product) => {
  if (!product) return "";
  if (typeof product === "object") return String(product._id || product.id || "");
  return String(product);
};

export const findProductById = (products, productId) => {
  const id = String(productId || "");

  return products.find(
    (product) => String(product._id || product.id || "") === id
  );
};

export const getInvoiceItems = (invoice) => {
  return invoice.products || invoice.items || [];
};

export const getItemCostPrice = (item, products = []) => {
  if (item.costPrice !== undefined && item.costPrice !== null) {
    return toNumber(item.costPrice);
  }

  const productId = getProductId(item.product);

  const product =
    typeof item.product === "object"
      ? item.product
      : findProductById(products, productId);

  return toNumber(product?.costPrice);
};

export const getInvoiceCost = (invoice, products = []) => {
  return getInvoiceItems(invoice).reduce((total, item) => {
    const quantity = toNumber(item.quantity);
    const costPrice = getItemCostPrice(item, products);

    return total + costPrice * quantity;
  }, 0);
};

export const getInvoiceRevenue = (invoice) => {
  return toNumber(invoice.grandTotal || invoice.total || invoice.totalAmount);
};

export const getInvoiceProfit = (invoice, products = []) => {
  return getInvoiceRevenue(invoice) - getInvoiceCost(invoice, products);
};

export const summarizeInvoices = (invoices = [], products = []) => {
  return invoices.reduce(
    (summary, invoice) => {
      const revenue = getInvoiceRevenue(invoice);
      const cost = getInvoiceCost(invoice, products);
      const profit = revenue - cost;

      summary.totalInvoices += 1;
      summary.totalRevenue += revenue;
      summary.totalCost += cost;
      summary.totalProfit += profit;

      return summary;
    },
    {
      totalInvoices: 0,
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
    }
  );
};