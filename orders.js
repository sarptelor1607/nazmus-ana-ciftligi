// ===== ORDER HISTORY PAGE =====

function formatDate(iso) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function renderOrders(orders) {
  const container = document.getElementById("ordersContainer");
  const subtitle  = document.getElementById("pageSubtitle");

  if (!orders.length) {
    subtitle.textContent = "You have no orders yet.";
    container.innerHTML  = `
      <div style="text-align:center;padding:64px 0;color:var(--gray)">
        <div style="font-size:56px;margin-bottom:16px">📦</div>
        <p style="font-size:16px;margin-bottom:20px">You have no orders yet.</p>
        <a href="index.html#products" class="btn btn--primary">Start Shopping</a>
      </div>`;
    return;
  }

  subtitle.textContent = `${orders.length} order(s)`;
  container.innerHTML  = orders.map(o => `
    <div class="order-card">
      <div class="order-card__head">
        <div>
          <div style="font-size:15px;font-weight:600;margin-bottom:2px">Order #${o._id.slice(-6).toUpperCase()}</div>
          <div class="order-card__id">PayPal: ${o.paypalOrderId || "—"}</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span class="order-card__date">${formatDate(o.createdAt)}</span>
          <span class="order-card__status">${o.status === "completed" ? "Completed" : o.status}</span>
        </div>
      </div>
      <div class="order-card__body">
        ${o.items.map(i => `
          <div class="order-item-row">
            <span>${i.emoji || "📦"} ${i.name} × ${i.qty}</span>
            <span style="font-weight:600">${(i.price * i.qty).toLocaleString("tr-TR")} ₺</span>
          </div>
        `).join("")}
      </div>
      <div class="order-card__total">
        <span>Total:</span>
        <span>${o.total.toLocaleString("tr-TR")} ₺</span>
      </div>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  Auth.onReady(async () => {
    const user = Auth.getCurrentUser();

    // Header: update auth state
    const openBtn   = document.getElementById("openAuthBtn");
    const userMenu  = document.getElementById("userMenu");
    const userAvatar= document.getElementById("userAvatar");
    const userNameEl= document.getElementById("userName");
    const logoutBtn = document.getElementById("logoutBtn");
    const trigger   = document.getElementById("userMenuTrigger");
    const dropdown  = document.getElementById("userDropdown");

    if (user) {
      openBtn.style.display   = "none";
      userMenu.style.display  = "flex";
      userNameEl.textContent  = user.name.split(" ")[0];
      userAvatar.textContent  = user.name.charAt(0).toUpperCase();
    } else {
      openBtn.style.display  = "block";
      userMenu.style.display = "none";
    }

    logoutBtn?.addEventListener("click", async () => { await Auth.logout(); location.reload(); });
    trigger?.addEventListener("click", (e) => { e.stopPropagation(); dropdown.classList.toggle("open"); });
    document.addEventListener("click", () => dropdown?.classList.remove("open"));
    document.getElementById("authClose")?.addEventListener("click", () =>
      document.getElementById("authOverlay").classList.remove("open"));
    openBtn?.addEventListener("click", () =>
      document.getElementById("authOverlay").classList.add("open"));

    if (!user) {
      document.getElementById("ordersContainer").innerHTML = `
        <div style="text-align:center;padding:64px 0;color:var(--gray)">
          <div style="font-size:56px;margin-bottom:16px">🔒</div>
          <p style="font-size:16px;margin-bottom:20px">Please sign in to view your order history.</p>
          <button class="btn btn--primary" onclick="document.getElementById('authOverlay').classList.add('open')">Sign In</button>
        </div>`;
      return;
    }

    const res    = await fetch(`/api/orders?userId=${encodeURIComponent(user.id)}`);
    const orders = await res.json();
    renderOrders(orders);
  });
});
