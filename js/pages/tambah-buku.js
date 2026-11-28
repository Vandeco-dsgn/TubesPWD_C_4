'use strict';
/* Tambah buku, khusus staff (tambah-buku.xhtml) */
async function initTambah() {
  $('#bookForm').onsubmit = async e => {
    e.preventDefault();
    const x = await api('tambah-buku.php', new FormData(e.target));
    if (x.ok) { toast(x.message); e.target.reset(); } else toast(x.error, 1);
  };
  const r = await api('tambah-buku.php'); renderNav(r.user);
}
document.addEventListener('DOMContentLoaded', initTambah);
