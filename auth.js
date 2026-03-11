// ===== AUTH — Supabase tabanlı =====

const Auth = (() => {
  const SUPABASE_URL  = "https://ldjanptdlabmudrjxaqo.supabase.co";
  const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkamFucHRkbGFibXVkcmp4YXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjQ4NTcsImV4cCI6MjA4ODg0MDg1N30.MR9HbJSYDS4WuOnUkop02tSRils--7A8KppXs76MZCg";

  const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

  let _user     = null;
  let _isReady  = false;
  const _readyCbs = [];

  // Supabase oturum durumunu dinle — sayfa yüklenince hemen tetiklenir
  _sb.auth.onAuthStateChange((_event, session) => {
    const su = session?.user ?? null;
    _user = su ? {
      id:    su.id,
      name:  su.user_metadata?.name || su.email.split("@")[0],
      email: su.email,
    } : null;

    if (!_isReady) {
      _isReady = true;
      _readyCbs.forEach((cb) => cb());
      _readyCbs.length = 0;
    }
  });

  // UI hazır olmadan önce oturumu bekle
  function onReady(cb) {
    if (_isReady) cb();
    else _readyCbs.push(cb);
  }

  // Mevcut kullanıcıyı senkron döndür (onAuthStateChange'den önbelleğe alındı)
  function getCurrentUser() {
    return _user;
  }

  // ---- Validasyon ----
  const NAME_REGEX = /^[a-zA-ZğĞüÜşŞıİöÖçÇ\s]+$/;

  function validateName(name) {
    const c = name.trim();
    if (!c)               return "İsim boş bırakılamaz.";
    if (c.length < 2)     return "İsim en az 2 karakter olmalı.";
    if (c.length > 60)    return "İsim en fazla 60 karakter olabilir.";
    if (!NAME_REGEX.test(c)) return "İsim yalnızca harf ve boşluk içerebilir.";
    return null;
  }
  function validateEmail(email) {
    const c = email.trim().toLowerCase();
    if (!c) return "E-posta boş bırakılamaz.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)) return "Geçerli bir e-posta girin.";
    return null;
  }
  function validatePassword(pw) {
    if (!pw)           return "Şifre boş bırakılamaz.";
    if (pw.length < 6) return "Şifre en az 6 karakter olmalı.";
    if (pw.length > 128) return "Şifre çok uzun.";
    return null;
  }

  // ---- Kayıt Ol ----
  async function register(name, email, password) {
    const nameErr = validateName(name);
    if (nameErr) return { success: false, error: nameErr };
    const emailErr = validateEmail(email);
    if (emailErr) return { success: false, error: emailErr };
    const passErr = validatePassword(password);
    if (passErr) return { success: false, error: passErr };

    const { error } = await _sb.auth.signUp({
      email:    email.trim().toLowerCase(),
      password,
      options:  { data: { name: name.trim() } },
    });

    if (error) return { success: false, error: _mapErr(error.message) };
    return { success: true };
  }

  // ---- Giriş Yap ----
  async function login(email, password) {
    const emailErr = validateEmail(email);
    if (emailErr) return { success: false, error: emailErr };
    if (!password) return { success: false, error: "Şifre boş bırakılamaz." };

    const { error } = await _sb.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) return { success: false, error: _mapErr(error.message) };
    return { success: true };
  }

  // ---- Çıkış ----
  async function logout() {
    await _sb.auth.signOut();
  }

  // ---- Hata mesajları Türkçeleştirme ----
  function _mapErr(msg) {
    if (msg.includes("Invalid login credentials")) return "E-posta veya şifre hatalı.";
    if (msg.includes("Email not confirmed"))       return "E-postanızı doğrulamadınız.";
    if (msg.includes("already registered") || msg.includes("User already registered"))
      return "Bu e-posta zaten kayıtlı.";
    if (msg.includes("Password should be"))        return "Şifre en az 6 karakter olmalı.";
    if (msg.includes("rate limit"))                return "Çok fazla deneme. Lütfen bekleyin.";
    return msg;
  }

  function sanitize(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#x27;").trim();
  }

  return { getCurrentUser, register, login, logout, sanitize, onReady };
})();
