'use strict';
/* Komponen UI bersama: toast, navigasi, badge keranjang, sampul buku */
function toast(msg, err) {
  const t = document.createElement('div');
  t.className = 'toast' + (err ? ' err' : ''); t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.remove(), 3800);
}
function renderNav(u, q) {
  const cur = bodyPage();
  const L = [['index', 'Beranda'], ['keranjang', 'Keranjang'], ['riwayat', 'Riwayat'], ['pengaturan', 'Pengaturan']];
  if (u.role === 'staff') L.push(['tambah-buku', 'Tambah Buku']);
  $('#nav').innerHTML = `<div class="topbar">
    ${cur === 'index' ? `<form id="searchForm" class="search" action="index.xhtml" method="get"><div class="search-in"><img src="images/icons/search.svg" width="15" height="15" alt="" /><input id="q" name="q" type="text" class="t-search" title="Cari judul, penulis, ISBN" value="${esc(q || '')}" /></div></form>` : '<div class="spacer"></div>'}
    <div class="navlinks">${L.map(([k, t]) => `<a href="${k}.xhtml" class="${k === cur ? 'on' : ''}">${t}${k === 'keranjang' ? `<span class="badge${u.cart ? '' : ' hide'}" id="cartBadge">${u.cart}</span>` : ''}</a>`).join('')}<a href="#" id="logout">Keluar</a></div>
    <a class="profile" href="pengaturan.xhtml"><img class="avatar" src="${esc(u.pfp_url || AVATAR)}" alt="" /><span><b>${esc(u.username)}</b><small>${u.role === 'staff' ? 'Staff' : 'Member'}</small></span></a></div>`;
  enhance($('#nav'));
  $('#logout').onclick = async e => { e.preventDefault(); await api('login.php?logout=1'); location.href = 'login.xhtml'; };
}
const setCart = n => { const b = $('#cartBadge'); if (b) { b.textContent = n; show(b, n > 0); } };
const cover = (url, t) => `<div class="cover">${url ? `<img src="${esc(url)}" alt="${esc(t)}" />` : ''}<span>${esc((t || '?').charAt(0))}</span></div>`;
