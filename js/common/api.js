'use strict';
/* Semua komunikasi ke PHP lewat fungsi ini (GET jika tanpa data, POST jika ada data) */
async function api(url, data) {
  const o = { credentials: 'same-origin' };
  if (data) { o.method = 'POST'; o.body = data instanceof FormData ? data : objFD(data); }
  let r, j;
  try { r = await fetch(url, o); j = await r.json(); }
  catch (e) { return { ok: false, error: 'Tidak bisa terhubung ke server. Pastikan Apache & MySQL XAMPP aktif dan halaman dibuka lewat http://localhost/.' }; }
  if (r.status === 401) { location.href = 'login.xhtml'; return never(); }
  if (r.status === 403) { location.href = 'index.xhtml'; return never(); }
  return j;
}
