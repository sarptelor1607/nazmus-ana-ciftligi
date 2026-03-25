// ===== PRODUCT DATA — loaded from the API =====
let PRODUCTS = [];

async function loadProducts(params = {}) {
  const qs  = new URLSearchParams(params).toString();
  const url = qs ? `/api/products?${qs}` : '/api/products';
  const res = await fetch(url);
  PRODUCTS  = await res.json();
  return PRODUCTS;
}
