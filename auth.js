// ===== AUTH — Supabase-based authentication =====

const Auth = (() => {
  const SUPABASE_URL  = "https://ldjanptdlabmudrjxaqo.supabase.co";
  const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkamFucHRkbGFibXVkcmp4YXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjQ4NTcsImV4cCI6MjA4ODg0MDg1N30.MR9HbJSYDS4WuOnUkop02tSRils--7A8KppXs76MZCg";

  const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

  let _user     = null;
  let _isReady  = false;
  const _readyCbs = [];

  // Listen for Supabase auth state changes — fires immediately on page load
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

  // Wait for the session to be resolved before running UI code
  function onReady(cb) {
    if (_isReady) cb();
    else _readyCbs.push(cb);
  }

  // Return the current user synchronously (cached from onAuthStateChange)
  function getCurrentUser() {
    return _user;
  }

  // ---- Validation ----
  const NAME_REGEX = /^[a-zA-ZğĞüÜşŞıİöÖçÇ\s]+$/;

  function validateName(name) {
    const c = name.trim();
    if (!c)               return "Name cannot be empty.";
    if (c.length < 2)     return "Name must be at least 2 characters.";
    if (c.length > 60)    return "Name cannot exceed 60 characters.";
    if (!NAME_REGEX.test(c)) return "Name may only contain letters and spaces.";
    return null;
  }
  function validateEmail(email) {
    const c = email.trim().toLowerCase();
    if (!c) return "Email cannot be empty.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)) return "Please enter a valid email address.";
    return null;
  }
  function validatePassword(pw) {
    if (!pw)           return "Password cannot be empty.";
    if (pw.length < 6) return "Password must be at least 6 characters.";
    if (pw.length > 128) return "Password is too long.";
    return null;
  }

  // ---- Register ----
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

  // ---- Login ----
  async function login(email, password) {
    const emailErr = validateEmail(email);
    if (emailErr) return { success: false, error: emailErr };
    if (!password) return { success: false, error: "Password cannot be empty." };

    const { error } = await _sb.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) return { success: false, error: _mapErr(error.message) };
    return { success: true };
  }

  // ---- Logout ----
  async function logout() {
    await _sb.auth.signOut();
  }

  // ---- Map Supabase error messages to user-friendly strings ----
  function _mapErr(msg) {
    if (msg.includes("Invalid login credentials")) return "Incorrect email or password.";
    if (msg.includes("Email not confirmed"))       return "Please verify your email address.";
    if (msg.includes("already registered") || msg.includes("User already registered"))
      return "This email is already registered.";
    if (msg.includes("Password should be"))        return "Password must be at least 6 characters.";
    if (msg.includes("rate limit"))                return "Too many attempts. Please wait.";
    return msg;
  }

  function sanitize(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#x27;").trim();
  }

  return { getCurrentUser, register, login, logout, sanitize, onReady };
})();
