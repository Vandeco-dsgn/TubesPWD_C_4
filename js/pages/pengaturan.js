'use strict';
/* Pengaturan profil (pengaturan.xhtml) */
async function initPengaturan() {
  const fill = u => { $('#username').value = u.username; $('#email').value = u.email; $('#avatar').src = u.pfp_url || AVATAR; show($('#btnHapus'), !!u.pfp_url); };
  const act = async fd => { const r = await api('pengaturan.php', fd); if (r.ok) { toast(r.message); renderNav(r.user); fill(r.user); } else toast(r.error, 1); return r; };
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
  const r = await api('pengaturan.php'); renderNav(r.user); fill(r.user); // dimuat setelah semua handler terpasang
}
document.addEventListener('DOMContentLoaded', initPengaturan);
