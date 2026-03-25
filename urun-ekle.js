// ===== ÜRÜN YÖNETİM SAYFASI =====

let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

async function loadAndRender() {
  await loadProducts();
  renderList();
}

function renderList() {
  const list = document.getElementById("productList");
  if (!PRODUCTS.length) {
    list.innerHTML = '<p style="color:var(--gray)">Henüz ürün yok.</p>';
    return;
  }
  list.innerHTML = PRODUCTS.map(p => `
    <div class="admin-row">
      ${p.image
        ? `<img src="${p.image}" alt="${p.name}" onerror="this.outerHTML='<span style=\\'font-size:36px\\'>${p.emoji}</span>'">`
        : `<span style="font-size:36px">${p.emoji}</span>`}
      <div class="admin-row__info">
        <div class="admin-row__name">${p.name}</div>
        <div class="admin-row__meta">${p.badge} · ${p.price} ₺</div>
      </div>
      <div class="admin-row__actions">
        <button class="btn btn--outline btn--sm" onclick="startEdit(${p.id})">Düzenle</button>
        <button class="btn btn--sm" style="background:#fee2e2;color:#ef4444;border:none"
          onclick="deleteProduct(${p.id})">Sil</button>
      </div>
    </div>
  `).join("");
}

function resetForm() {
  document.getElementById("productForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("formTitle").textContent = "Yeni Ürün Ekle";
  document.getElementById("submitBtn").textContent = "Kaydet";
  document.getElementById("cancelBtn").style.display = "none";
}

function startEdit(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  document.getElementById("editId").value   = p.id;
  document.getElementById("fName").value    = p.name    || "";
  document.getElementById("fNameEn").value  = p.nameEn  || "";
  document.getElementById("fDesc").value    = p.desc    || "";
  document.getElementById("fDescEn").value  = p.descEn  || "";
  document.getElementById("fPrice").value   = p.price   || "";
  document.getElementById("fEmoji").value   = p.emoji   || "";
  document.getElementById("fCategory").value= p.category|| "yag";
  document.getElementById("fBadge").value   = p.badge   || "";
  document.getElementById("fImage").value   = p.image   || "";
  document.getElementById("formTitle").textContent  = "Ürünü Düzenle";
  document.getElementById("submitBtn").textContent  = "Güncelle";
  document.getElementById("cancelBtn").style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteProduct(id) {
  if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
  const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
  if (res.ok) {
    showToast("Ürün silindi.");
    await loadAndRender();
  } else {
    showToast("Silme başarısız.");
  }
}

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const editId = document.getElementById("editId").value;
  const body   = {
    name:     document.getElementById("fName").value.trim(),
    nameEn:   document.getElementById("fNameEn").value.trim(),
    desc:     document.getElementById("fDesc").value.trim(),
    descEn:   document.getElementById("fDescEn").value.trim(),
    price:    parseFloat(document.getElementById("fPrice").value),
    emoji:    document.getElementById("fEmoji").value.trim() || "📦",
    category: document.getElementById("fCategory").value,
    badge:    document.getElementById("fBadge").value.trim(),
    image:    document.getElementById("fImage").value.trim(),
  };

  const url    = editId ? `/api/products/${editId}` : "/api/products";
  const method = editId ? "PUT" : "POST";
  const res    = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    showToast(editId ? "Ürün güncellendi!" : "Ürün eklendi!");
    resetForm();
    await loadAndRender();
  } else {
    const err = await res.json();
    showToast("Hata: " + (err.error || "Bilinmeyen hata"));
  }
});

document.addEventListener("DOMContentLoaded", () => {
  Auth.onReady(loadAndRender);
});
