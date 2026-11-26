<?php
/* API pembaca buku: info buku + progres terakhir (GET), simpan progres otomatis (POST).
   Hanya untuk buku yang sedang dipinjam user. */
require 'config.php';
$u = need_login(); $uid = (int)$u['id_user'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (($_POST['action'] ?? '') !== 'simpan') fail('Aksi tidak dikenal.');
    $isbn = trim($_POST['isbn'] ?? '');
    $b = q('SELECT halaman FROM buku WHERE isbn=?', [$isbn])->fetch();
    if (!$b || !has_active($uid, $isbn)) fail('Buku ini tidak sedang kamu pinjam.');
    $h = (int)($_POST['halaman'] ?? -1);
    if ($h < 0 || $h > (int)$b['halaman']) fail('Halaman harus antara 0 dan ' . $b['halaman'] . '.');
    q('INSERT INTO progres(id_user, isbn, halaman_terakhir) VALUES(?,?,?)
       ON DUPLICATE KEY UPDATE halaman_terakhir=VALUES(halaman_terakhir), updated_at=NOW()', [$uid, $isbn, $h]);
    ok(['halaman' => $h]);
}

$isbn = trim($_GET['isbn'] ?? '');
$b = q('SELECT b.isbn, b.judul, b.halaman, b.format, COALESCE(pr.halaman_terakhir, 0) AS halaman_terakhir
        FROM buku b LEFT JOIN progres pr ON pr.isbn=b.isbn AND pr.id_user=? WHERE b.isbn=?', [$uid, $isbn])->fetch();
if (!$b) fail('Buku tidak ditemukan.');
if (!has_active($uid, $isbn)) fail('Kamu tidak sedang meminjam buku ini. Pinjam dulu dari Beranda.');
// tandai sebagai "sedang dibaca" (tanpa mengubah halaman tersimpan)
q('INSERT INTO progres(id_user, isbn) VALUES(?,?) ON DUPLICATE KEY UPDATE updated_at=NOW()', [$uid, $isbn]);
ok(['buku' => ['isbn' => $b['isbn'], 'judul' => $b['judul'], 'halaman' => (int)$b['halaman'],
               'format' => $b['format'], 'halaman_terakhir' => (int)$b['halaman_terakhir']]]);
