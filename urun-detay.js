// ===== ÜRÜN DETAY SAYFASI =====

let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

function updateCartCount() {
  document.getElementById("cartCount").textContent = Cart.getCount();
}

document.addEventListener("DOMContentLoaded", () => {
  Auth.onReady(async () => {
    const params = new URLSearchParams(location.search);
    const id     = parseInt(params.get("id"));

    if (!id) { location.href = "index.html"; return; }

    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) { location.href = "index.html"; return; }

    const p = await res.json();

    document.title = `${p.name} — Nazmuş Ana Çiftliği`;
    document.getElementById("detayTitle").textContent = p.name;

    const imgHtml = p.image
      ? `<img src="${p.image}" alt="${p.name}" onerror="this.outerHTML='<div style=\\'font-size:120px;text-align:center;padding:60px\\'>${p.emoji}</div>'">`
      : `<div style="font-size:120px;text-align:center;padding:60px;background:#f0fdf4;border-radius:16px">${p.emoji}</div>`;

    document.getElementById("detayContent").innerHTML = `
      <div>${imgHtml}</div>
      <div class="detay-info">
        <span class="product-card__badge">${p.badge}</span>
        <h2>${p.name}</h2>
        <p class="desc">${p.desc}</p>
        <div class="price" id="detayPrice">${Currency.formatPrice(p.price)}</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <button class="btn btn--primary" onclick="handleAdd()">🛒 Sepete Ekle</button>
          <a href="index.html#products" class="btn btn--outline">← Ürünlere Dön</a>
        </div>
      </div>
    `;

    updateCartCount();

    window.handleAdd = () => {
      if (!Auth.getCurrentUser()) {
        showToast("Sepete eklemek için giriş yapın.");
        return;
      }
      Cart.add(p);
      updateCartCount();
      showToast(`${p.name} sepete eklendi!`);
    };

    document.getElementById("cartBtn").addEventListener("click", () => {
      location.href = "sepet.html";
    });
  });
});
