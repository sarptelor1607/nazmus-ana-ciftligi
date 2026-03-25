// ===== SEPET SAYFASI — Köy Lezzetleri =====
const EMAILJS_PUBLIC_KEY = "yDBggSbpkFeuKjXA0";
const EMAILJS_SERVICE    = "service_95tublp";
const EMAILJS_TEMPLATE   = "template_wek1lf8";

// Sepetteki item için dile göre ad/badge döndür (PRODUCTS global olarak products.js'den gelir)
function itemLang(item, field) {
  if (Lang.getSelected() === "en") {
    if (item[field + "En"]) return item[field + "En"];
    const product = PRODUCTS.find((p) => p.id === item.id);
    if (product && product[field + "En"]) return product[field + "En"];
  }
  return item[field];
}

// ---- Auth UI ----
function initAuthUI() {
  const user = Auth.getCurrentUser();
  const openAuthBtn    = document.getElementById("openAuthBtn");
  const userMenu       = document.getElementById("userMenu");
  const userAvatar     = document.getElementById("userAvatar");
  const userNameEl     = document.getElementById("userName");
  const userMenuTrigger= document.getElementById("userMenuTrigger");
  const userDropdown   = document.getElementById("userDropdown");
  const logoutBtn      = document.getElementById("logoutBtn");

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

// ---- Auth Modal ----
let _sepetPendingReg = null;

function _sepetResetVerifyStep() {
  document.getElementById("verifyStep").classList.add("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
  document.getElementById("verifyError").textContent = "";
  document.getElementById("verifyCode").value = "";
  _sepetPendingReg = null;
}

function openAuthModal() {
  document.getElementById("authOverlay").classList.add("open");
}
function closeAuthModal() {
  document.getElementById("authOverlay").classList.remove("open");
  document.getElementById("loginError").textContent    = "";
  document.getElementById("registerError").textContent = "";
  _sepetResetVerifyStep();
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
      _sepetResetVerifyStep();
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
      window.location.reload();
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
      _sepetPendingReg = { name, email, password: p1, code, expiresAt: Date.now() + 10 * 60 * 1000 };
      document.getElementById("registerForm").classList.add("hidden");
      document.getElementById("verifyStep").classList.remove("hidden");
    } catch {
      document.getElementById("registerError").textContent = Lang.t("verifyEmailErr");
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("verifyBtn").addEventListener("click", async () => {
    if (!_sepetPendingReg) return;
    if (Date.now() > _sepetPendingReg.expiresAt) {
      document.getElementById("verifyError").textContent = Lang.t("verifyExpired");
      _sepetResetVerifyStep();
      return;
    }
    const entered = document.getElementById("verifyCode").value.trim();
    if (entered !== _sepetPendingReg.code) {
      document.getElementById("verifyError").textContent = Lang.t("verifyWrong");
      return;
    }
    const btn = document.getElementById("verifyBtn");
    btn.disabled = true;
    const result = await Auth.register(_sepetPendingReg.name, _sepetPendingReg.email, _sepetPendingReg.password);
    btn.disabled = false;
    _sepetPendingReg = null;
    if (result.success) {
      closeAuthModal();
      window.location.reload();
    } else {
      document.getElementById("verifyError").textContent = result.error;
    }
  });

  document.getElementById("verifyBackBtn").addEventListener("click", _sepetResetVerifyStep);
}

// ---- Toast ----
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

// ---- PayPal ----
let paypalRendered = false;

function renderPayPalButton() {
  if (paypalRendered || Cart.getItems().length === 0) return;
  const container = document.getElementById("paypalButtonContainer");
  container.innerHTML = "";

  if (typeof paypal === "undefined") {
    container.innerHTML =
      '<p style="color:#ef4444;font-size:13px;">PayPal yüklenemedi.</p>';
    return;
  }

  paypal.Buttons({
    style: { shape: "pill", color: "gold", layout: "vertical", label: "pay" },
    createOrder: (_data, actions) =>
      actions.order.create({
        purchase_units: [{
          description: "Nazmuş Ana Çiftliği Siparişi",
          amount: {
            value: Currency.getPayPalAmount(Cart.getTotal()),
            currency_code: Currency.getPayPalCurrency(),
          },
        }],
      }),
    onApprove: (_data, actions) =>
      actions.order.capture().then(async (details) => {
        const user = Auth.getCurrentUser();
        await fetch('/api/orders', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId:        user?.id    || 'guest',
            userEmail:     user?.email || '',
            items:         Cart.getItems().map(i => ({
              productId: i.id, name: i.name, nameEn: i.nameEn,
              emoji: i.emoji, price: i.price, qty: i.qty,
            })),
            total:         Cart.getTotal(),
            currency:      Currency.getSelected(),
            paypalOrderId: details.id,
            status:        'completed',
          }),
        });
        showToast(Lang.t("toastPayOk"));
        Cart.clear();
        renderSepet();
        paypalRendered = false;
      }),
    onError: (err) => {
      showToast(Lang.t("toastPayErr"));
      console.error(err);
    },
  }).render("#paypalButtonContainer");

  paypalRendered = true;
}

// ---- Sepet Render ----
function renderSepet() {
  const user   = Auth.getCurrentUser();
  const items  = Cart.getItems();
  const rows   = document.getElementById("cartRows");
  const sumItems     = document.getElementById("summaryItems");
  const subtotalEl   = document.getElementById("subtotal");
  const grandTotalEl = document.getElementById("grandTotal");
  const ppContainer  = document.getElementById("paypalButtonContainer");
  const orderSummary = document.getElementById("orderSummary");
  const pageSubtitle = document.getElementById("pageSubtitle");

  if (!user) {
    rows.innerHTML = `
      <div class="cart-table__empty">
        <span>🔒</span>
        <p>${Lang.t("sepetLoginMsg")}</p>
        <button class="btn btn--primary" onclick="openAuthModal()">${Lang.t("sepetLoginBtn")}</button>
      </div>`;
    orderSummary.style.display = "none";
    return;
  }

  orderSummary.style.display = "block";

  if (items.length === 0) {
    pageSubtitle.textContent = Lang.t("sepetEmpty");
    rows.innerHTML = `
      <div class="cart-table__empty">
        <span>🛒</span>
        <p>${Lang.t("sepetNoItems")}</p>
        <a href="index.html" class="btn btn--primary">${Lang.t("sepetShopBtn")}</a>
      </div>`;
    sumItems.innerHTML = "";
    subtotalEl.textContent   = "$0.00";
    grandTotalEl.textContent = "$0.00";
    ppContainer.innerHTML    = "";
    paypalRendered = false;
    return;
  }

  const total = Cart.getTotal();
  pageSubtitle.textContent = `${Cart.getCount()} ${Lang.getSelected() === "en" ? "items" : "ürün"} · ${Lang.getSelected() === "en" ? "Total" : "Toplam"} ${Currency.formatPrice(total)}`;

  rows.innerHTML = items.map((item) => `
    <div class="cart-table__row">
      <div class="ct-product">
        <span class="ct-product__emoji">${item.emoji}</span>
        <div>
          <div class="ct-product__name">${itemLang(item, "name")}</div>
          <span class="ct-product__badge">${itemLang(item, "badge")}</span>
        </div>
      </div>
      <div class="ct-price">${Currency.formatPrice(item.price)}</div>
      <div class="ct-qty">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, +1)">+</button>
      </div>
      <div class="ct-total">${Currency.formatPrice(item.price * item.qty)}</div>
      <button class="ct-remove" onclick="removeItem(${item.id})" title="Kaldır">✕</button>
    </div>
  `).join("");

  sumItems.innerHTML = items.map((item) => `
    <div class="summary-item-row">
      <span class="summary-item-name">
        <span>${item.emoji}</span>
        <span>${itemLang(item, "name")} × ${item.qty}</span>
      </span>
      <span class="summary-item-subtotal">${Currency.formatPrice(item.price * item.qty)}</span>
    </div>
  `).join("");

  subtotalEl.textContent   = Currency.formatPrice(total);
  grandTotalEl.textContent = Currency.formatPrice(total);

  renderPayPalButton();
}

// ---- Eylemler ----
function changeQty(productId, delta) {
  Cart.changeQty(productId, delta);
  paypalRendered = false;
  renderSepet();
}

function removeItem(productId) {
  Cart.remove(productId);
  paypalRendered = false;
  renderSepet();
  showToast(Lang.t("toastRemoved"));
}

// ---- Currency Switcher ----
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
      paypalRendered = false;
      renderSepet();
    });
  });

  updateActive();
}

// ---- Language Switcher ----
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
      paypalRendered = false;
      renderSepet();
    });
  });

  updateActive();
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  Auth.onReady(async () => {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    await loadProducts();
    initLangSwitcher();
    initCurrencySwitcher();
    initAuthUI();
    initAuthModal();
    renderSepet();
    Lang.applyLang();
  });
});
