'use strict';
/* Beranda (index.xhtml): pencarian, daftar buku, sedang dibaca, hapus buku (staff) */
const card = (b, staff) => {
  const habis = b.tersedia < 1;
  const btn = +b.dipinjam ? '<button class="btn btn-sm" disabled="disabled">Sedang dipinjam</button>'
    : habis ? '<button class="btn btn-sm" disabled="disabled">Lisensi habis</button>'
    : `<button class="btn btn-sm btn-primary" data-add="${esc(b.isbn)}">+ Keranjang</button>`;
  const del = staff ? `<button type="button" class="btn btn-sm btn-danger" data-hapus-buku="${esc(b.isbn)}" data-judul="${esc(b.judul)}">Hapus Buku</button>` : '';
  return `<div class="book">${cover(b.cover_url, b.judul)}<div class="book-title">${esc(b.judul)}</div><div class="book-author">${esc(b.penulis || '')}</div><div class="stock ${habis ? 'out' : ''}">Tersedia ${b.tersedia}/${b.license}</div>${btn}${del}</div>`;
};
async function initIndex() {
  let q = '', first = true, staff = false;
  const showReading = r => {
    const head = '<div class="eyebrow">SEDANG DIBACA</div>';
    if (!r) { $('#reading').innerHTML = head + '<p class="muted">Belum ada buku yang sedang dibaca. Pinjam buku, lalu tekan “Baca” di halaman Riwayat.</p>'; return; }
    const pct = r.halaman ? Math.round(r.halaman_terakhir / r.halaman * 100) : 0;
    $('#reading').innerHTML = `${head}<h3>${esc(r.judul)}</h3><div class="bar"><i style="width:${pct}%"></i></div>
      <p class="muted">Halaman ${r.halaman_terakhir} dari ${r.halaman} (${pct}%)</p><p class="by">— ${esc(r.penulis || '')}</p>
      <a class="btn btn-primary btn-sm" target="_blank" href="baca.xhtml?isbn=${encodeURIComponent(r.isbn)}">Lanjut Baca</a>`;
  };
  async function load() {
    const r = await api('index.php?q=' + encodeURIComponent(q)); if (!r.ok) return toast(r.error, 1);
    staff = r.user.role === 'staff';
    if (first) { first = false; renderNav(r.user); $('#searchForm').onsubmit = e => { e.preventDefault(); q = $('#q').value.trim(); load(); }; }
    const draw = b => card(b, staff);
    $('#popTitle').textContent = r.judul;
    $('#popular').innerHTML = r.populer.length ? r.populer.map(draw).join('') : '<p class="muted">Tidak ada buku yang cocok.</p>';
    $('#allSec').hidden = !r.semua.length; $('#all').innerHTML = r.semua.map(draw).join('');
    showReading(r.reading);
  }
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-add]'); if (!b) return;
    b.disabled = true;
    const r = await api('index.php', { action: 'keranjang', isbn: b.dataset.add });
    if (r.ok) { toast(r.message); setCart(r.user.cart); $$(`[data-add="${b.dataset.add}"]`).forEach(x => { x.textContent = 'Di keranjang'; x.disabled = true; }); }
    else { toast(r.error, 1); b.disabled = false; }
  });
  /* Hapus buku (khusus staff) */
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-hapus-buku]'); if (!b) return;
    if (!confirm(`Hapus buku "${b.dataset.judul}" secara permanen?\nRiwayat peminjaman dan progres baca buku ini juga akan ikut terhapus.`)) return;
    b.disabled = true;
    const r = await api('hapus-buku.php', { isbn: b.dataset.hapusBuku });
    if (r.ok) { toast(r.message); load(); } else { toast(r.error, 1); b.disabled = false; }
  });
  /* Progres dibarui otomatis oleh pembaca (tab lain): segarkan panel "Sedang Dibaca" saat tab ini aktif lagi */
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState !== 'visible' || first) return;
    const r = await api('index.php?q=' + encodeURIComponent(q)); if (r.ok) showReading(r.reading);
  });
  load();
}
document.addEventListener('DOMContentLoaded', initIndex);
