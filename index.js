// ===== INDEX SAYFASI — Köy Lezzetleri =====

// ===== ÜRÜN VERİLERİ =====
const PRODUCTS = [
  { id: 1, name: "Sıkma Zeytinyağı",       desc: "Soğuk sıkma, natürel, erken hasat. 500 ml cam şişe.",               price: 480, emoji: "🫒", category: "yag",    badge: "Zeytinyağı" },
  { id: 2, name: "Zeytinyağı Büyük Boy",   desc: "Soğuk sıkma, natürel, erken hasat. 1 lt cam şişe.",                 price: 590, emoji: "🫒", category: "yag",    badge: "Zeytinyağı" },
  { id: 3, name: "Ev Salçası — Domates",   desc: "Güneşte kurutulmuş, tuz hariç katkısız, 700 g kavanoz.",            price: 420, emoji: "🍅", category: "salca",  badge: "Salça"      },
  { id: 4, name: "Ev Salçası — Biber",     desc: "Acı biber harmanı, geleneksel tarif, 700 g kavanoz.",               price: 435, emoji: "🌶️", category: "salca",  badge: "Salça"      },
  { id: 5, name: "Karışık Turşu",          desc: "Mevsim sebzeleri, kaya tuzu, sirke. 1 lt kavanoz.",                 price: 410, emoji: "🥒", category: "tursu",  badge: "Turşu"      },
  { id: 6, name: "Salatalık Turşusu",      desc: "Çıtır salatalık, sarımsak, dereotu. 1 lt kavanoz.",               price: 400, emoji: "🥒", category: "tursu",  badge: "Turşu"      },
  { id: 7, name: "Yeşil Zeytin",           desc: "El ile toplanmış, kırık yeşil zeytin, limon & sarımsaklı. 500 g.", price: 455, emoji: "🫒", category: "zeytin", badge: "Zeytin"     },
  { id: 8, name: "Siyah Zeytin",           desc: "Salamura siyah zeytin, yağlı ve aromalı. 500 g.",                  price: 470, emoji: "🫒", category: "zeytin", badge: "Zeytin"     },
];

// ===== AUTH UI =====
function initAuthUI() {
  const user             = Auth.getCurrentUser();
  const openAuthBtn      = document.getElementById("openAuthBtn");
  const userMenu         = document.getElementById("userMenu");
  const userAvatar       = document.getElementById("userAvatar");
  const userNameEl       = document.getElementById("userName");
  const userMenuTrigger  = document.getElementById("userMenuTrigger");
  const userDropdown     = document.getElementById("userDropdown");
  const logoutBtn        = document.getElementById("logoutBtn");

  if (user) {
    openAuthBtn.style.display = "none";
    userMenu.style.display    = "flex";
    userNameEl.textContent    = user.name.split(" ")[0];
    userAvatar.textContent    = user.name.charAt(0).toUpperCase();
  } else {
    openAuthBtn.style.display = "block";
    userMenu.style.display    = "none";
  }

  openAuthBtn.addEventListener("click", openAuthModal);
  logoutBtn.addEventListener("click", () => {
    Auth.logout();
    window.location.reload();
  });
  userMenuTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle("open");
  });
  document.addEventListener("click", () => userDropdown.classList.remove("open"));
}

// ===== AUTH MODAL =====
function openAuthModal() {
  document.getElementById("authOverlay").classList.add("open");
}
function closeAuthModal() {
  document.getElementById("authOverlay").classList.remove("open");
  document.getElementById("loginError").textContent    = "";
  document.getElementById("registerError").textContent = "";
}

function initAuthModal() {
  document.getElementById("authClose").addEventListener("click", closeAuthModal);
  document.getElementById("authOverlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeAuthModal();
  });

  document.querySelectorAll(".modal-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".modal-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const which = tab.dataset.tab;
      document.getElementById("loginForm").classList.toggle("hidden", which !== "login");
      document.getElementById("registerForm").classList.toggle("hidden", which !== "register");
    });
  });

  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const result = Auth.login(
      document.getElementById("loginEmail").value,
      document.getElementById("loginPassword").value
    );
    if (result.success) {
      closeAuthModal();
      initAuthUI();
      updateCartCount();
      renderDrawer();
    } else {
      document.getElementById("loginError").textContent = result.error;
    }
  });

  document.getElementById("registerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const p1 = document.getElementById("regPassword").value;
    const p2 = document.getElementById("regPassword2").value;
    if (p1 !== p2) {
      document.getElementById("registerError").textContent = "Şifreler eşleşmiyor.";
      return;
    }
    const result = Auth.register(
      document.getElementById("regName").value,
      document.getElementById("regEmail").value,
      p1
    );
    if (result.success) {
      closeAuthModal();
      initAuthUI();
      updateCartCount();
      renderDrawer();
    } else {
      document.getElementById("registerError").textContent = result.error;
    }
  });
}

// ===== TOAST =====
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

// ===== CART COUNT =====
function updateCartCount() {
  document.getElementById("cartCount").textContent = Cart.getCount();
}

// ===== CART DRAWER =====
function renderDrawer() {
  const container = document.getElementById("cartItems");
  const footer    = document.getElementById("cartFooter");
  const totalEl   = document.getElementById("cartTotal");
  const user      = Auth.getCurrentUser();

  if (!user) {
    container.innerHTML = `
      <p class="cart-empty" style="margin-top:60px">
        Sepeti kullanmak için <button onclick="closeCart();openAuthModal();"
          style="background:none;border:none;cursor:pointer;color:var(--green);font-weight:600;font-size:15px">
          giriş yapın
        </button>
      </p>`;
    footer.style.display = "none";
    return;
  }

  const items = Cart.getItems();
  if (items.length === 0) {
    container.innerHTML = '<p class="cart-empty">Sepetiniz boş.</p>';
    footer.style.display = "none";
    return;
  }

  container.innerHTML = items.map((item) => `
    <div class="cart-item">
      <span class="cart-item__emoji">${item.emoji}</span>
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__unit">Birim: ${Currency.formatPrice(item.price)}</div>
        <div class="cart-item__price">${Currency.formatPrice(item.price * item.qty)}</div>
        <div class="cart-item__qty">
          <button class="qty-btn" onclick="drawerChangeQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="drawerChangeQty(${item.id}, +1)">+</button>
        </div>
      </div>
      <button class="cart-item__remove" onclick="drawerRemove(${item.id})">🗑</button>
    </div>
  `).join("");

  totalEl.textContent      = Currency.formatPrice(Cart.getTotal());
  footer.style.display     = "block";
}

function drawerChangeQty(id, delta) {
  Cart.changeQty(id, delta);
  updateCartCount();
  renderDrawer();
}

function drawerRemove(id) {
  Cart.remove(id);
  updateCartCount();
  renderDrawer();
  showToast("Ürün sepetten kaldırıldı.");
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

// ===== PRODUCTS =====
function renderProducts(filter = "all") {
  const filtered = filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);
  document.getElementById("productsGrid").innerHTML = filtered.map((p) => `
    <div class="product-card">
      <div class="product-card__img">${p.emoji}</div>
      <div class="product-card__body">
        <span class="product-card__badge">${p.badge}</span>
        <div class="product-card__name">${p.name}</div>
        <div class="product-card__desc">${p.desc}</div>
        <div class="product-card__footer">
          <span class="product-card__price">${Currency.formatPrice(p.price)}</span>
          <button class="add-to-cart" onclick="handleAddToCart(${p.id})">Sepete Ekle</button>
        </div>
      </div>
    </div>
  `).join("");
}

function handleAddToCart(id) {
  if (!Auth.getCurrentUser()) {
    showToast("Sepete eklemek için giriş yapın.");
    openAuthModal();
    return;
  }
  const product = PRODUCTS.find((p) => p.id === id);
  Cart.add(product);
  updateCartCount();
  renderDrawer();
  showToast(`${product.name} sepete eklendi ✓`);
}

function initFilters() {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderProducts(btn.dataset.filter);
    });
  });
}

// ===== CURRENCY SWITCHER =====
function initCurrencySwitcher() {
  const switcher = document.getElementById("currencySwitcher");
  if (!switcher) return;

  function updateActive() {
    const selected = Currency.getSelected();
    switcher.querySelectorAll(".currency-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.currency === selected);
    });
  }

  switcher.querySelectorAll(".currency-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      Currency.setSelected(btn.dataset.currency);
      updateActive();
      renderProducts(
        document.querySelector(".filter-btn.active")?.dataset.filter || "all"
      );
      renderDrawer();
    });
  });

  updateActive();
}

// ===== CONTACT =====
function initContactForm() {
  document.getElementById("contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Mesajınız iletildi, teşekkürler!");
    e.target.reset();
  });
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  initCurrencySwitcher();
  initAuthUI();
  initAuthModal();
  renderProducts();
  initFilters();
  initContactForm();
  updateCartCount();
  renderDrawer();

  document.getElementById("cartBtn").addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  document.getElementById("cartOverlay").addEventListener("click", closeCart);
});
