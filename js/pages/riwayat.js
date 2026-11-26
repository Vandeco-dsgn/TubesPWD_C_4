'use strict';
/* Riwayat peminjaman (riwayat.xhtml) */
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
      const act = x.status === 'aktif' ? `<a class="btn btn-sm btn-primary" target="_blank" href="baca.xhtml?isbn=${encodeURIComponent(x.isbn)}">Baca</a><button type="button" class="btn btn-sm" data-ret="${x.id_pinjam}">Kembalikan</button>` : '';
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
document.addEventListener('DOMContentLoaded', initRiwayat);
