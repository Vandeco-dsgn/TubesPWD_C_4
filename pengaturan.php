<?php
require 'config.php';
$u = need_login(); $uid = (int)$u['id_user'];
if ($_SERVER['REQUEST_METHOD'] !== 'POST') ok();
$a = $_POST['action'] ?? '';

if ($a === 'simpan') {
    $un = trim($_POST['username'] ?? ''); $em = trim($_POST['email'] ?? ''); $pw = $_POST['password'] ?? '';
    if (!preg_match('/^[A-Za-z0-9_.]{3,30}$/', $un)) fail('Username 3-30 karakter (huruf, angka, titik, underscore).', 422);
    if (!filter_var($em, FILTER_VALIDATE_EMAIL)) fail('Format email tidak valid.', 422);
    if (q('SELECT 1 FROM users WHERE username=? AND id_user<>?', [$un, $uid])->fetch()) fail('Username sudah dipakai.', 422);
    if (q('SELECT 1 FROM users WHERE email=? AND id_user<>?', [$em, $uid])->fetch()) fail('Email sudah dipakai.', 422);
    q('UPDATE users SET username=?, email=? WHERE id_user=?', [$un, $em, $uid]);
    if ($pw !== '') {
        if (strlen($pw) < 6) fail('Password baru minimal 6 karakter.', 422);
        q('UPDATE users SET password_hash=? WHERE id_user=?', [password_hash($pw, PASSWORD_DEFAULT), $uid]);
    }
    ok(['message' => 'Perubahan disimpan.']);
}
if ($a === 'foto') { // ganti foto lewat upload
    $path = save_upload('foto', 'images/avatars', ['jpg', 'jpeg', 'png', 'gif', 'webp'], 2, 'u' . $uid);
    if (!$path) fail('Pilih file gambar terlebih dahulu.');
    hapus_lokal($u['pfp_url']);
    q('UPDATE users SET pfp_url=? WHERE id_user=?', [$path, $uid]);
    ok(['message' => 'Foto profil diperbarui.']);
}
if ($a === 'foto_url') { // ganti foto lewat URL
    $url = trim($_POST['url'] ?? '');
    if (!preg_match('#^https?://\S+$#i', $url) || strlen($url) > 255) fail('URL tidak valid (harus diawali http:// atau https://, maks 255 karakter).', 422);
    hapus_lokal($u['pfp_url']);
    q('UPDATE users SET pfp_url=? WHERE id_user=?', [$url, $uid]);
    ok(['message' => 'Foto profil diperbarui.']);
}
if ($a === 'hapus_foto') {
    hapus_lokal($u['pfp_url']);
    q('UPDATE users SET pfp_url=NULL WHERE id_user=?', [$uid]);
    ok(['message' => 'Foto profil dihapus.']);
}
fail('Aksi tidak dikenal.');
