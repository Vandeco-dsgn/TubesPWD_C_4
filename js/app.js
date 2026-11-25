'use strict';
/* ============ Helper umum ============ */
var AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#dbe7fb"/><circle cx="32" cy="25" r="11" fill="#2f5fb3"/><path d="M10 64c2-16 14-22 22-22s20 6 22 22z" fill="#2f5fb3"/></svg>');
const $ = (s, e = document) => e.querySelector(s);
const $$ = (s, e = document) => [...e.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const never = () => new Promise(() => {});
const fmtDate = s => s ? new Date(s + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

function toast(msg, err) {
  const t = document.createElement('div');
  t.className = 'toast' + (err ? ' err' : ''); t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.remove(), 3800);
}
function objFD(o) {
  const f = new FormData();
  for (const k in o) Array.isArray(o[k]) ? o[k].forEach(v => f.append(k + '[]', v)) : f.append(k, o[k]);
  return f;
}
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
function renderNav(u, q) {
  const cur = document.body.dataset.page;
  const L = [['index', 'Beranda'], ['keranjang', 'Keranjang'], ['riwayat', 'Riwayat'], ['pengaturan', 'Pengaturan']];
  if (u.role === 'staff') L.push(['tambah-buku', 'Tambah Buku']);
  $('#nav').innerHTML = `<div class="topbar">
    ${cur === 'index' ? `<form id="searchForm" class="search" action="#"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="q" type="search" placeholder="Cari judul, penulis, ISBN" value="${esc(q || '')}"/></form>` : '<div class="spacer"></div>'}
    <nav>${L.map(([k, t]) => `<a href="${k}.xhtml" class="${k === cur ? 'on' : ''}">${t}${k === 'keranjang' ? `<span class="badge" id="cartBadge" ${u.cart ? '' : 'hidden="hidden"'}>${u.cart}</span>` : ''}</a>`).join('')}<a href="#" id="logout">Keluar</a></nav>
    <a class="profile" href="pengaturan.xhtml"><img class="avatar" src="${esc(u.pfp_url || AVATAR)}" alt="" onerror="this.onerror=null;this.src=AVATAR"/><span><b>${esc(u.username)}</b><small>${u.role === 'staff' ? 'Staff' : 'Member'}</small></span></a></div>`;
  $('#logout').onclick = async e => { e.preventDefault(); await api('login.php?logout=1'); location.href = 'login.xhtml'; };
}
const setCart = n => { const b = $('#cartBadge'); if (b) { b.textContent = n; b.hidden = !n; } };
const cover = (url, t) => `<div class="cover">${url ? `<img src="${esc(url)}" alt="${esc(t)}" loading="lazy" onerror="this.remove()"/>` : ''}<span>${esc((t || '?').charAt(0))}</span></div>`;

/* ============ Login & Pendaftaran ============ */
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

/* ============ Beranda ============ */
const card = b => {
  const habis = b.tersedia < 1;
  const btn = +b.dipinjam ? '<button class="btn btn-sm" disabled="disabled">Sedang dipinjam</button>'
    : habis ? '<button class="btn btn-sm" disabled="disabled">Lisensi habis</button>'
    : `<button class="btn btn-sm btn-primary" data-add="${esc(b.isbn)}">+ Keranjang</button>`;
  return `<div class="book">${cover(b.cover_url, b.judul)}<div class="book-title">${esc(b.judul)}</div><div class="book-author">${esc(b.penulis || '')}</div><div class="stock ${habis ? 'out' : ''}">Tersedia ${b.tersedia}/${b.license}</div>${btn}</div>`;
};
async function initIndex() {
  let q = '', first = true;
  const showReading = r => {
    const head = '<div class="eyebrow">SEDANG DIBACA</div>';
    if (!r) { $('#reading').innerHTML = head + '<p class="muted">Belum ada buku yang sedang dibaca. Pinjam buku, lalu tekan “Baca” di halaman Riwayat.</p>'; return; }
    const pct = r.halaman ? Math.round(r.halaman_terakhir / r.halaman * 100) : 0;
    $('#reading').innerHTML = `${head}<h3>${esc(r.judul)}</h3><div class="bar"><i style="width:${pct}%"></i></div>
      <p class="muted">Halaman ${r.halaman_terakhir} dari ${r.halaman} (${pct}%)</p><p class="by">— ${esc(r.penulis || '')}</p>
      <a class="btn btn-primary btn-sm" target="_blank" href="riwayat.php?baca=${encodeURIComponent(r.isbn)}">Lanjut Baca</a>
      <button type="button" class="btn btn-sm" id="btnProg">Perbarui Halaman</button>`;
    $('#btnProg').onclick = async () => {
      const v = prompt(`Halaman terakhir yang kamu baca (0–${r.halaman}):`, r.halaman_terakhir); if (v === null) return;
      const x = await api('index.php', { action: 'progres', isbn: r.isbn, halaman: v });
      x.ok ? (toast(x.message), load()) : toast(x.error, 1);
    };
  };
  async function load() {
    const r = await api('index.php?q=' + encodeURIComponent(q)); if (!r.ok) return toast(r.error, 1);
    if (first) { first = false; renderNav(r.user); $('#searchForm').onsubmit = e => { e.preventDefault(); q = $('#q').value.trim(); load(); }; }
    $('#popTitle').textContent = r.judul;
    $('#popular').innerHTML = r.populer.length ? r.populer.map(card).join('') : '<p class="muted">Tidak ada buku yang cocok.</p>';
    $('#allSec').hidden = !r.semua.length; $('#all').innerHTML = r.semua.map(card).join('');
    showReading(r.reading);
  }
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-add]'); if (!b) return;
    b.disabled = true;
    const r = await api('index.php', { action: 'keranjang', isbn: b.dataset.add });
    if (r.ok) { toast(r.message); setCart(r.user.cart); $$(`[data-add="${b.dataset.add}"]`).forEach(x => { x.textContent = 'Di keranjang'; x.disabled = true; }); }
    else { toast(r.error, 1); b.disabled = false; }
  });
  load();
}

/* ============ Keranjang ============ */
async function initKeranjang() {
  let items = [];
  const usable = i => !+i.dipinjam && i.tersedia > 0;
  const sum = () => {
    const sel = $$('.chk:checked').map(c => items.find(i => i.isbn === c.value));
    $('#sumList').innerHTML = sel.length ? sel.map(i => `<li>${esc(i.judul)}</li>`).join('') : '<li class="muted">-</li>';
    $('#total').textContent = sel.length; $('#btnPinjam').disabled = !sel.length;
    const n = $$('.chk:not(:disabled)').length; $('#chkAll').checked = n > 0 && sel.length === n;
  };
  const draw = () => {
    $('#items').innerHTML = items.length ? items.map(i => `<div class="card item"><input class="chk" type="checkbox" value="${esc(i.isbn)}" ${usable(i) ? '' : 'disabled="disabled"'}/>
      <div class="thumb">${cover(i.cover_url, i.judul)}</div>
      <div class="grow" style="flex:1"><div class="a">${esc(i.penulis || '')}</div><div class="t">${esc(i.judul)}</div>
      ${+i.dipinjam ? '<div class="warn">Kamu masih meminjam buku ini.</div>' : i.tersedia < 1 ? '<div class="warn">Lisensi habis dipinjam orang lain.</div>' : ''}</div>
      <button type="button" class="icon-btn" data-del="${esc(i.isbn)}" aria-label="Hapus"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button></div>`).join('')
      : '<div class="card empty">Keranjang masih kosong. <a href="index.xhtml">Cari buku</a></div>';
    $$('.chk').forEach(c => c.onchange = sum); sum();
  };
  async function load() {
    const r = await api('keranjang.php'); renderNav(r.user); items = r.items; setCart(items.length);
    $('#hari').innerHTML = Array.from({ length: r.max_hari }, (_, k) => r.max_hari - k).map(n => `<option value="${n}">${n} hari</option>`).join('');
    draw();
  }
  $('#chkAll').onchange = e => { $$('.chk:not(:disabled)').forEach(c => c.checked = e.target.checked); sum(); };
  $('#items').onclick = async e => {
    const b = e.target.closest('[data-del]'); if (!b) return;
    const r = await api('keranjang.php', { action: 'hapus', isbn: [b.dataset.del] }); r.ok ? load() : toast(r.error, 1);
  };
  $('#btnPinjam').onclick = async () => {
    const isbn = $$('.chk:checked').map(c => c.value);
    $('#btnPinjam').disabled = true;
    const r = await api('keranjang.php', { action: 'pinjam', isbn, hari: $('#hari').value });
    if (r.ok) { toast(r.message); setTimeout(() => location.href = 'riwayat.xhtml', 1000); } else { toast(r.error, 1); load(); }
  };
  load();
}

/* ============ Riwayat ============ */
async function initRiwayat() {
  const LBL = { dipinjam: 'Sedang Dipinjam', selesai: 'Selesai', segera: 'Segera Jatuh Tempo', terlambat: 'Terlambat' };
  let f = 'semua', first = true;
  async function load() {
    const r = await api('riwayat.php?filter=' + f); if (first) { first = false; renderNav(r.user); }
    $('#rows').innerHTML = r.rows.length ? r.rows.map(x => {
      const sisa = +x.sisa;
      const note = x.label === 'selesai' ? 'Dikembalikan ' + fmtDate(x.tanggal_kembali)
        : x.label === 'terlambat' ? 'Terlambat ' + Math.abs(sisa) + ' hari'
        : x.label === 'segera' ? (sisa === 0 ? 'Jatuh tempo hari ini' : sisa + ' hari lagi') : '';
      const act = x.status === 'aktif' ? `<a class="btn btn-sm btn-primary" target="_blank" href="riwayat.php?baca=${encodeURIComponent(x.isbn)}">Baca</a><button type="button" class="btn btn-sm" data-ret="${x.id_pinjam}">Kembalikan</button>` : '';
      return `<div class="tr row"><div class="bk"><div class="thumb">${cover(x.cover_url, x.judul)}</div><div><b>${esc(x.judul)}</b><small>${esc(x.penulis || '')}</small></div></div>
        <span>${fmtDate(x.tanggal_pinjam)}</span><span>${fmtDate(x.tanggal_jatuh_tempo)}</span>
        <span class="st st-${x.label}">${LBL[x.label]}${note ? `<small>${note}</small>` : ''}</span><span class="acts">${act}</span></div>`;
    }).join('') : '<div class="card empty">Belum ada riwayat peminjaman. <a href="index.xhtml">Cari buku</a></div>';
  }
  $('#tabs').onclick = e => { const t = e.target.closest('.tab'); if (!t) return; $$('.tab').forEach(x => x.classList.toggle('active', x === t)); f = t.dataset.f; load(); };
  $('#rows').onclick = async e => {
    const b = e.target.closest('[data-ret]'); if (!b || !confirm('Kembalikan buku ini sekarang?')) return;
    const r = await api('riwayat.php', { action: 'kembali', id: b.dataset.ret }); r.ok ? (toast(r.message), load()) : toast(r.error, 1);
  };
  load();
}

/* ============ Pengaturan ============ */
async function initPengaturan() {
  const fill = u => { $('#username').value = u.username; $('#email').value = u.email; $('#avatar').src = u.pfp_url || AVATAR; $('#btnHapus').hidden = !u.pfp_url; };
  const act = async fd => { const r = await api('pengaturan.php', fd); if (r.ok) { toast(r.message); renderNav(r.user); fill(r.user); } else toast(r.error, 1); return r; };
  const r = await api('pengaturan.php'); renderNav(r.user); fill(r.user);
  $('#avatar').onerror = function () { this.onerror = null; this.src = AVATAR; };
  $('#btnFoto').onclick = () => $('#fileFoto').click();
  $('#fileFoto').onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('action', 'foto'); fd.append('foto', file); await act(fd); e.target.value = '';
  };
  $('#btnUrl').onclick = async () => { const x = await act(objFD({ action: 'foto_url', url: $('#fotoUrl').value })); if (x.ok) $('#fotoUrl').value = ''; };
  $('#btnHapus').onclick = () => confirm('Hapus foto profil?') && act(objFD({ action: 'hapus_foto' }));
  $('#profileForm').onsubmit = async e => {
    e.preventDefault(); const fd = new FormData(e.target); fd.append('action', 'simpan');
    const x = await act(fd); if (x.ok) $('#password').value = '';
  };
}

/* ============ Tambah Buku (staff) ============ */
async function initTambah() {
  const r = await api('tambah-buku.php'); renderNav(r.user);
  $('#bookForm').onsubmit = async e => {
    e.preventDefault();
    const x = await api('tambah-buku.php', new FormData(e.target));
    if (x.ok) { toast(x.message); e.target.reset(); } else toast(x.error, 1);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const p = document.body.dataset.page;
  ({ login: initLogin, pendaftaran: initPendaftaran, index: initIndex, keranjang: initKeranjang,
     riwayat: initRiwayat, pengaturan: initPengaturan, 'tambah-buku': initTambah }[p] || (() => {}))();
});
