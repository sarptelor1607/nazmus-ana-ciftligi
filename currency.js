// ===== CURRENCY — Nazmuş Ana Çiftliği =====
// Tüm fiyatlar TL bazlı saklanır; bu modül görüntüleme için dönüştürür.
// Kur güncellemesi için sadece RATES nesnesini değiştirin.

const Currency = (() => {
  const KEY = "kl_currency";

  // 1 yabancı para = kaç TL (manuel güncellenmeli)
  const RATES = {
    TRY: 1,
    USD: 38.5,
    EUR: 41.5,
  };

  const SYMBOLS = { TRY: "₺", USD: "$", EUR: "€" };
  const CODES   = ["TRY", "USD", "EUR"];

  function getSelected() {
    const stored = localStorage.getItem(KEY);
    return CODES.includes(stored) ? stored : "TRY";
  }

  function setSelected(code) {
    if (CODES.includes(code)) {
      localStorage.setItem(KEY, code);
    }
  }

  // TL fiyatı seçili dövize çevirir ve sembolüyle formatlar
  function formatPrice(tlPrice) {
    const code     = getSelected();
    const symbol   = SYMBOLS[code];
    const converted = tlPrice / RATES[code];
    return `${symbol}${converted.toFixed(2)}`;
  }

  // PayPal TRY kabul etmez → TRY seçiliyse USD kullan
  function getPayPalCurrency() {
    const c = getSelected();
    return c === "TRY" ? "USD" : c;
  }

  // PayPal için TL toplamını dövize çevirir
  function getPayPalAmount(tlTotal) {
    return (tlTotal / RATES[getPayPalCurrency()]).toFixed(2);
  }

  return { getSelected, setSelected, formatPrice, getPayPalCurrency, getPayPalAmount, CODES, SYMBOLS };
})();
