// ===== CURRENCY — Nazmuş Ana Çiftliği =====
// All prices are stored in Turkish Lira (TRY); this module converts them for display.
// To update exchange rates, edit the RATES object below.

const Currency = (() => {
  const KEY = "kl_currency";

  // 1 foreign currency = how many TRY (update manually)
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

  // Convert a TRY price to the selected currency and format it with the symbol
  function formatPrice(tlPrice) {
    const code     = getSelected();
    const symbol   = SYMBOLS[code];
    const converted = tlPrice / RATES[code];
    return `${symbol}${converted.toFixed(2)}`;
  }

  // PayPal does not accept TRY — fall back to USD when TRY is selected
  function getPayPalCurrency() {
    const c = getSelected();
    return c === "TRY" ? "USD" : c;
  }

  // Convert a TRY total to the PayPal currency amount
  function getPayPalAmount(tlTotal) {
    return (tlTotal / RATES[getPayPalCurrency()]).toFixed(2);
  }

  return { getSelected, setSelected, formatPrice, getPayPalCurrency, getPayPalAmount, CODES, SYMBOLS };
})();
