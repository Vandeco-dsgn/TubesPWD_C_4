'use strict';
/* Keranjang (keranjang.xhtml) */
async function initKeranjang() {
  let items = [];
  const usable = i => !+i.dipinjam && i.tersedia > 0;
  const sum = () => {
    const sel = $$('.chk:checked').map(c => items.find(i => i.isbn === c.value)).filter(Boolean);
    $('#sumList').innerHTML = sel.length ? sel.map(i => `<li>${esc(i.judul)}</li>`).join('') : '<li class="muted">-</li>';
    $('#total').textContent = sel.length;
    $('#btnPinjam').disabled = !sel.length || sel.some(i => !usable(i));
    $('#btnHapusSel').disabled = !sel.length;
    $('#chkAll').checked = items.length > 0 && sel.length === items.length;
  };
  const draw = () => {
    $('#items').innerHTML = items.length ? items.map(i => `<div class="card item"><input class="chk" type="checkbox" value="${esc(i.isbn)}" />
      <div class="thumb">${cover(i.cover_url, i.judul)}</div>
      <div class="grow" style="flex:1"><div class="a">${esc(i.penulis || '')}</div><div class="t">${esc(i.judul)}</div>
      ${+i.dipinjam ? '<div class="warn">Kamu masih meminjam buku ini.</div>' : i.tersedia < 1 ? '<div class="warn">Lisensi habis dipinjam orang lain.</div>' : ''}</div>
      <button type="button" class="icon-btn" data-del="${esc(i.isbn)}" aria-label="Hapus"><svg ${SVG_NS} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button></div>`).join('')
      : '<div class="card empty">Keranjang masih kosong. <a href="index.xhtml">Cari buku</a></div>';
    $$('.chk').forEach(c => c.onchange = sum); sum();
  };
  async function load() {
    const r = await api('keranjang.php'); renderNav(r.user); items = r.items; setCart(items.length);
    $('#hari').innerHTML = Array.from({ length: r.max_hari }, (_, k) => k + 1).map(n => `<option value="${n}">${n} hari</option>`).join('');
    draw();
  }
  $('#chkAll').onchange = e => { $$('.chk').forEach(c => c.checked = e.target.checked); sum(); };
  $('#btnHapusSel').onclick = async () => {
    const isbn = $$('.chk:checked').map(c => c.value);
    if (!isbn.length) return;
    $('#btnHapusSel').disabled = true;
    await api('keranjang.php', { action: 'hapus', isbn });
    load();
  };
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
document.addEventListener('DOMContentLoaded', initKeranjang);