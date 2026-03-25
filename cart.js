// ===== CART — Nazmuş Ana Çiftliği =====
// Each user's cart is stored separately in localStorage under their own key: kl_cart_{userId}

const Cart = (() => {
  function cartKey() {
    const user = Auth.getCurrentUser();
    return user ? `kl_cart_${user.id}` : null;
  }

  function getItems() {
    const key = cartKey();
    if (!key) return [];
    return JSON.parse(localStorage.getItem(key) || "[]");
  }

  function saveItems(items) {
    const key = cartKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(items));
  }

  function add(product) {
    const items    = getItems();
    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      existing.qty++;
    } else {
      items.push({ ...product, qty: 1 });
    }
    saveItems(items);
  }

  function remove(productId) {
    saveItems(getItems().filter((i) => i.id !== productId));
  }

  function changeQty(productId, delta) {
    const items = getItems();
    const item  = items.find((i) => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      saveItems(items.filter((i) => i.id !== productId));
    } else {
      saveItems(items);
    }
  }

  function clear() {
    saveItems([]);
  }

  function getTotal() {
    return getItems().reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function getCount() {
    return getItems().reduce((sum, i) => sum + i.qty, 0);
  }

  return { getItems, add, remove, changeQty, clear, getTotal, getCount };
})();
