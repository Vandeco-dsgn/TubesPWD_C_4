'use strict';
/* Halaman Masuk (login.xhtml) & Daftar (pendaftaran.xhtml) */
function bindEyes() {
  $$('[data-eye]').forEach(b => b.onclick = () => { const i = $('#' + b.dataset.eye); i.type = i.type === 'password' ? 'text' : 'password'; });
}
async function initLogin() {
  bindEyes();
  const s = await api('login.php'); if (s.user) { location.href = 'index.xhtml'; return; }
  $('#loginForm').onsubmit = async e => {
    e.preventDefault();
    const r = await api('login.php', new FormData(e.target));
    if (r.ok) location.href = 'index.xhtml'; else { $('#msg').className = 'form-msg'; $('#msg').textContent = r.error; }
  };
}
async function initPendaftaran() {
  $('#regForm').onsubmit = async e => {
    e.preventDefault();
    const r = await api('pendaftaran.php', new FormData(e.target)), m = $('#msg');
    m.className = 'form-msg' + (r.ok ? ' good' : ''); m.textContent = r.ok ? r.message : r.error;
    if (r.ok) setTimeout(() => location.href = 'login.xhtml', 1200);
  };
}
document.addEventListener('DOMContentLoaded', () => {
  const p = document.body.dataset.page;
  if (p === 'login') initLogin(); else if (p === 'pendaftaran') initPendaftaran();
});
