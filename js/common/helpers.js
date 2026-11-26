'use strict';
/* Helper umum: selektor, escape HTML, format tanggal, avatar bawaan */
var AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#dbe7fb"/><circle cx="32" cy="25" r="11" fill="#2f5fb3"/><path d="M10 64c2-16 14-22 22-22s20 6 22 22z" fill="#2f5fb3"/></svg>');
const $ = (s, e = document) => e.querySelector(s);
const $$ = (s, e = document) => [...e.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const never = () => new Promise(() => {});
const fmtDate = s => s ? new Date(s + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
function objFD(o) {
  const f = new FormData();
  for (const k in o) Array.isArray(o[k]) ? o[k].forEach(v => f.append(k + '[]', v)) : f.append(k, o[k]);
  return f;
}
