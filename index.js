// ===== INDEX SAYFASI — Köy Lezzetleri =====
// PRODUCTS artık products.js içinde tanımlı (global değişken)

// Mevcut dile göre ürün alanını döndür
function pLang(p, field) {
  return Lang.getSelected() === "en" && p[field + "En"] ? p[field + "En"] : p[field];
}

// Sepetteki item için dile göre ad/badge döndür (eski item'lar için PRODUCTS'tan yedekle)
function itemLang(item, field) {
  if (Lang.getSelected() === "en") {
    if (item[field + "En"]) return item[field + "En"];
    const product = PRODUCTS.find((p) => p.id === item.id);
    if (product && product[field + "En"]) return product[field + "En"];
  }
  return item[field];
}

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
  logoutBtn.addEventListener("click", async () => {
    await Auth.logout();
    window.location.reload();
  });
  userMenuTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle("open");
  });
  document.addEventListener("click", () => userDropdown.classList.remove("open"));
}

// ===== AUTH MODAL =====
const EMAILJS_PUBLIC_KEY = "yDBggSbpkFeuKjXA0";
const EMAILJS_SERVICE    = "service_95tublp";
const EMAILJS_TEMPLATE   = "template_wek1lf8";

let pendingReg = null; // { name, email, password, code, expiresAt }

function _resetVerifyStep() {
  document.getElementById("verifyStep").classList.add("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
  document.getElementById("verifyError").textContent = "";
  document.getElementById("verifyCode").value = "";
  pendingReg = null;
}

function openAuthModal() {
  document.getElementById("authOverlay").classList.add("open");
}
function closeAuthModal() {
  document.getElementById("authOverlay").classList.remove("open");
  document.getElementById("loginError").textContent    = "";
  document.getElementById("registerError").textContent = "";
  _resetVerifyStep();
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
      _resetVerifyStep();
    });
  });

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    const result = await Auth.login(
      document.getElementById("loginEmail").value,
      document.getElementById("loginPassword").value
    );
    btn.disabled = false;
    if (result.success) {
      closeAuthModal();
      initAuthUI();
      updateCartCount();
      renderDrawer();
    } else {
      document.getElementById("loginError").textContent = result.error;
    }
  });

  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const p1   = document.getElementById("regPassword").value;
    const p2   = document.getElementById("regPassword2").value;
    if (p1 !== p2) {
      document.getElementById("registerError").textContent = Lang.t("passMatch");
      return;
    }
    const name  = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const btn   = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    document.getElementById("registerError").textContent = "";

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
        to_name:  name,
        to_email: email,
        code:     code,
      });
      pendingReg = { name, email, password: p1, code, expiresAt: Date.now() + 10 * 60 * 1000 };
      document.getElementById("registerForm").classList.add("hidden");
      document.getElementById("verifyStep").classList.remove("hidden");
    } catch {
      document.getElementById("registerError").textContent = Lang.t("verifyEmailErr");
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("verifyBtn").addEventListener("click", async () => {
    if (!pendingReg) return;
    if (Date.now() > pendingReg.expiresAt) {
      document.getElementById("verifyError").textContent = Lang.t("verifyExpired");
      _resetVerifyStep();
      return;
    }
    const entered = document.getElementById("verifyCode").value.trim();
    if (entered !== pendingReg.code) {
      document.getElementById("verifyError").textContent = Lang.t("verifyWrong");
      return;
    }
    const btn = document.getElementById("verifyBtn");
    btn.disabled = true;
    const result = await Auth.register(pendingReg.name, pendingReg.email, pendingReg.password);
    btn.disabled = false;
    pendingReg = null;
    if (result.success) {
      closeAuthModal();
      initAuthUI();
      updateCartCount();
      renderDrawer();
    } else {
      document.getElementById("verifyError").textContent = result.error;
    }
  });

  document.getElementById("verifyBackBtn").addEventListener("click", _resetVerifyStep);
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
        ${Lang.t("cartLoginMsg")} <button onclick="closeCart();openAuthModal();"
          style="background:none;border:none;cursor:pointer;color:var(--green);font-weight:600;font-size:15px">
          ${Lang.t("cartLoginLink")}
        </button>
      </p>`;
    footer.style.display = "none";
    return;
  }

  const items = Cart.getItems();
  if (items.length === 0) {
    container.innerHTML = `<p class="cart-empty">${Lang.t("cartEmpty")}</p>`;
    footer.style.display = "none";
    return;
  }

  container.innerHTML = items.map((item) => `
    <div class="cart-item">
      <span class="cart-item__emoji">${item.emoji}</span>
      <div class="cart-item__info">
        <div class="cart-item__name">${itemLang(item, "name")}</div>
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

  totalEl.textContent  = Currency.formatPrice(Cart.getTotal());
  footer.style.display = "block";
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
  showToast(Lang.t("toastRemoved"));
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
        <span class="product-card__badge">${pLang(p, "badge")}</span>
        <div class="product-card__name">${pLang(p, "name")}</div>
        <div class="product-card__desc">${pLang(p, "desc")}</div>
        <div class="product-card__footer">
          <span class="product-card__price">${Currency.formatPrice(p.price)}</span>
          <button class="add-to-cart" onclick="handleAddToCart(${p.id})">${Lang.t("addToCart")}</button>
        </div>
      </div>
    </div>
  `).join("");
}

function handleAddToCart(id) {
  if (!Auth.getCurrentUser()) {
    showToast(Lang.t("toastLoginRequired"));
    openAuthModal();
    return;
  }
  const product = PRODUCTS.find((p) => p.id === id);
  Cart.add(product);
  updateCartCount();
  renderDrawer();
  showToast(`${pLang(product, "name")} ${Lang.t("toastAdded")}`);
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

// ===== LANGUAGE SWITCHER =====
function initLangSwitcher() {
  const switcher = document.getElementById("langSwitcher");
  if (!switcher) return;

  function updateActive() {
    const selected = Lang.getSelected();
    switcher.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === selected);
    });
  }

  switcher.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      Lang.setSelected(btn.dataset.lang);
      updateActive();
      Lang.applyLang();
      renderProducts(
        document.querySelector(".filter-btn.active")?.dataset.filter || "all"
      );
      renderDrawer();
      if (_heroRefresh) _heroRefresh();
    });
  });

  updateActive();
}

// ===== HERO SLIDER =====
const SLIDE_INTERVAL = 5000;
const SLIDE_BG = {
  yag:    ["#f0fdf4", "#dcfce7"],
  salca:  ["#fff7ed", "#fed7aa"],
  tursu:  ["#ecfdf5", "#a7f3d0"],
  zeytin: ["#fafaf9", "#d6d3d1"],
};
let _heroRefresh = null;

function initHeroSlider() {
  let current = 0;
  let timer;
  const showcase = document.getElementById("heroShowcase");
  const dotsWrap = document.getElementById("heroDots");
  const heroEl   = document.getElementById("hero");

  PRODUCTS.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.className = "hero-dot";
    btn.addEventListener("click", () => goTo(i, 1));
    dotsWrap.appendChild(btn);
  });

  function updateDots() {
    dotsWrap.querySelectorAll(".hero-dot").forEach((d, i) => {
      d.classList.toggle("active", i === current);
    });
  }

  function updateBg() {
    const [c1, c2] = SLIDE_BG[PRODUCTS[current].category] || ["#f0fdf4", "#dcfce7"];
    heroEl.style.background = `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
    const [s1, s2] = SLIDE_BG[PRODUCTS[current].category] || ["#b7e4c7", "#74c69d"];
    showcase.style.background = `linear-gradient(135deg, ${s1 === "#f0fdf4" ? "#b7e4c7" : s1}, ${s2 === "#dcfce7" ? "#74c69d" : s2})`;
  }

  function renderShowcase(direction) {
    const p = PRODUCTS[current];
    const fromX = direction >= 0 ? "60px" : "-60px";
    showcase.innerHTML = `
      <span class="hero-showcase__emoji" style="transform:translateX(${fromX});opacity:0;transition:none">${p.emoji}</span>
      <span class="hero-showcase__name">${pLang(p, "name")}</span>
    `;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const em = showcase.querySelector(".hero-showcase__emoji");
      if (!em) return;
      em.style.transition = "transform 0.5s cubic-bezier(.25,.46,.45,.94), opacity 0.5s ease";
      em.style.transform = "translateX(0)";
      em.style.opacity = "1";
    }));
  }

  function goTo(index, direction = 1) {
    current = ((index % PRODUCTS.length) + PRODUCTS.length) % PRODUCTS.length;
    updateDots();
    updateBg();
    renderShowcase(direction);
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1, 1), SLIDE_INTERVAL);
  }

  document.getElementById("heroPrev").addEventListener("click", () => goTo(current - 1, -1));
  document.getElementById("heroNext").addEventListener("click", () => goTo(current + 1, 1));

  _heroRefresh = () => renderShowcase(0);
  goTo(0, 1);
}

// ===== CONTACT =====
const FORMSPREE_ID = "xyknwjoq";

function initContactForm() {
  document.getElementById("contactForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn  = form.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method:  "POST",
        headers: { "Accept": "application/json" },
        body:    new FormData(form),
      });
      if (res.ok) {
        showToast(Lang.t("toastMsgSent"));
        form.reset();
      } else {
        showToast(Lang.t("toastMsgErr"));
      }
    } catch {
      showToast(Lang.t("toastMsgErr"));
    } finally {
      btn.disabled = false;
    }
  });
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  Auth.onReady(() => {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    initLangSwitcher();
    initHeroSlider();
    initCurrencySwitcher();
    initAuthUI();
    initAuthModal();
    renderProducts();
    initFilters();
    initContactForm();
    updateCartCount();
    renderDrawer();
    Lang.applyLang();

    document.getElementById("cartBtn").addEventListener("click", openCart);
    document.getElementById("cartClose").addEventListener("click", closeCart);
    document.getElementById("cartOverlay").addEventListener("click", closeCart);
  });
});
