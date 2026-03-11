// ===== AUTH — Nazmuş Ana Çiftliği =====
// Kullanıcı verileri localStorage'da saklanır.
// Backend entegrasyonunda bu fonksiyonlar API çağrılarıyla değiştirilecek.

const Auth = (() => {
  const USERS_KEY   = "kl_users";
  const SESSION_KEY = "kl_session";

  // ---- Yardımcı: Güvenli metin — HTML tag ve zararlı karakterleri temizler ----
  function sanitize(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .trim();
  }

  // ---- Validasyonlar ----

  // Türkçe dahil yalnızca harf ve boşluk — emoji, rakam, sembol, HTML yasak
  const NAME_REGEX = /^[a-zA-ZğĞüÜşŞıİöÖçÇ\s]+$/;

  function validateName(name) {
    const clean = name.trim();
    if (!clean)                       return "İsim boş bırakılamaz.";
    if (clean.length < 2)             return "İsim en az 2 karakter olmalı.";
    if (clean.length > 60)            return "İsim en fazla 60 karakter olabilir.";
    if (!NAME_REGEX.test(clean))      return "İsim yalnızca harf ve boşluk içerebilir (rakam, emoji veya özel karakter kabul edilmez).";
    return null; // geçerli
  }

  function validateEmail(email) {
    const clean = email.trim().toLowerCase();
    if (!clean)                          return "E-posta boş bırakılamaz.";
    if (clean.length > 254)              return "E-posta adresi çok uzun.";
    // RFC 5321 uyumlu temel kontrol
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) return "Geçerli bir e-posta adresi girin.";
    return null;
  }

  function validatePassword(password) {
    if (!password)             return "Şifre boş bırakılamaz.";
    if (password.length < 6)   return "Şifre en az 6 karakter olmalı.";
    if (password.length > 128) return "Şifre en fazla 128 karakter olabilir.";
    return null;
  }

  // ---- LocalStorage ----
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch {
      return [];
    }
  }
  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  }
  function setCurrentUser(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  // ---- Kayıt Ol ----
  function register(name, email, password) {
    // Validasyon
    const nameErr = validateName(name);
    if (nameErr) return { success: false, error: nameErr };

    const emailErr = validateEmail(email);
    if (emailErr) return { success: false, error: emailErr };

    const passErr = validatePassword(password);
    if (passErr) return { success: false, error: passErr };

    const users     = getUsers();
    const cleanEmail = email.trim().toLowerCase();

    if (users.find((u) => u.email === cleanEmail)) {
      return { success: false, error: "Bu e-posta zaten kayıtlı." };
    }

    const user = {
      id: Date.now().toString(),
      name: sanitize(name.trim()),       // güvenli saklama
      email: cleanEmail,
      password,                           // backend gelince hash'lenecek
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    saveUsers(users);
    setCurrentUser({ id: user.id, name: user.name, email: user.email });
    return { success: true };
  }

  // ---- Giriş Yap ----
  function login(email, password) {
    const emailErr = validateEmail(email);
    if (emailErr) return { success: false, error: emailErr };

    if (!password) return { success: false, error: "Şifre boş bırakılamaz." };

    const users = getUsers();
    const user  = users.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!user) {
      return { success: false, error: "E-posta veya şifre hatalı." };
    }
    setCurrentUser({ id: user.id, name: user.name, email: user.email });
    return { success: true };
  }

  // ---- Çıkış ----
  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  return { getCurrentUser, register, login, logout, sanitize };
})();
