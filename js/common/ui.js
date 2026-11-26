'use strict';
/* Komponen UI bersama: toast, navigasi, badge keranjang, sampul buku */
const SVG_NS = 'xmlns="http://www.w3.org/2000/svg"'; /* wajib agar <svg> tampil di dokumen XHTML */

function toast(msg, err) {
  const t = document.createElement('div');
  t.className = 'toast' + (err ? ' err' : ''); t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.remove(), 3800);
}
function renderNav(u, q) {
  const cur = document.body.dataset.page;
  const L = [['index', 'Beranda'], ['keranjang', 'Keranjang'], ['riwayat', 'Riwayat'], ['pengaturan', 'Pengaturan']];
  if (u.role === 'staff') L.push(['tambah-buku', 'Tambah Buku']);
  $('#nav').innerHTML = `<div class="topbar">
    ${cur === 'index' ? `<form id="searchForm" class="search" action="#"><svg ${SVG_NS} viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="q" type="search" placeholder="Cari judul, penulis, ISBN" value="${esc(q || '')}"/></form>` : '<div class="spacer"></div>'}
    <nav>${L.map(([k, t]) => `<a href="${k}.xhtml" class="${k === cur ? 'on' : ''}">${t}${k === 'keranjang' ? `<span class="badge" id="cartBadge" ${u.cart ? '' : 'hidden="hidden"'}>${u.cart}</span>` : ''}</a>`).join('')}<a href="#" id="logout">Keluar</a></nav>
    <a class="profile" href="pengaturan.xhtml"><img class="avatar" src="${esc(u.pfp_url || AVATAR)}" alt="" onerror="this.onerror=null;this.src=AVATAR"/><span><b>${esc(u.username)}</b><small>${u.role === 'staff' ? 'Staff' : 'Member'}</small></span></a></div>`;
  $('#logout').onclick = async e => { e.preventDefault(); await api('login.php?logout=1'); location.href = 'login.xhtml'; };
}
const setCart = n => { const b = $('#cartBadge'); if (b) { b.textContent = n; b.hidden = !n; } };
const cover = (url, t) => `<div class="cover">${url ? `<img src="${esc(url)}" alt="${esc(t)}" loading="lazy" onerror="this.remove()"/>` : ''}<span>${esc((t || '?').charAt(0))}</span></div>`;
