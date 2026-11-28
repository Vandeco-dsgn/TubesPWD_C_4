'use strict';
var ELIB_BUILD = '20261128c';
/* Helper umum: selektor, escape HTML, format tanggal, avatar bawaan */
var AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#dbe7fb"/><circle cx="32" cy="25" r="11" fill="#2f5fb3"/><path d="M10 64c2-16 14-22 22-22s20 6 22 22z" fill="#2f5fb3"/></svg>');
const $ = (s, e = document) => e.querySelector(s);
const $$ = (s, e = document) => [...e.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const never = () => new Promise(() => {});
const fmtDate = s => s ? new Date(s + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
function objFD(o) {
  const f = new FormData();
  for (const k in o) Array.isArray(o[k]) ? o[k].forEach(v => f.append(k + '[]', v)) : f.append(k, o[k]);
  return f;
}

/* ---- Pembantu untuk XHTML 1.0 Strict ---- */
/* Strict tidak punya atribut hidden, data-*, placeholder, onerror, dsb. Semuanya diganti: */
const show = (el, on) => { if (el) el.classList.toggle('hide', !on); };   // tampil/sembunyi lewat class "hide"
const bodyPage = () => document.body.id.replace(/^page-/, '');            // <body id="page-xxx">

/* Atribut/tipe HTML5 dipasang lewat JS: title -> placeholder, class t-* -> type input */
function enhance(root) {
  root = root || document;
  $$('input[title]', root).forEach(i => { if (/^(text|password)$/.test(i.type) && !i.placeholder) i.placeholder = i.title; });
  [['t-email', 'email'], ['t-url', 'url'], ['t-search', 'search']].forEach(([c, t]) => $$('input.' + c, root).forEach(i => { i.type = t; }));
  $$('input.t-number', root).forEach(i => { i.type = 'number'; i.min = '1'; });
  $$('form', root).forEach(f => { f.noValidate = true; });
}

/* Gambar rusak: pengganti onerror (event error tidak "bubble", jadi ditangkap di fase capture) */
document.addEventListener('error', e => {
  const t = e.target;
  if (!t || t.localName !== 'img') return;
  if (t.classList.contains('avatar') || t.classList.contains('avatar-lg')) { if (!t._fb) { t._fb = 1; t.src = AVATAR; } }
  else if (t.parentNode && t.parentNode.classList.contains('cover')) t.remove();
}, true);
document.addEventListener('DOMContentLoaded', () => enhance());

/* Jaring pengaman: semua form di situs ini diproses lewat JS (fetch). Submit bawaan browser dibatalkan
   agar tidak pernah membuka JSON mentah dari file .php. */
document.addEventListener('submit', e => e.preventDefault());
