<?php
require 'config.php';
need_staff();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') ok();

$isbn = strtoupper(preg_replace('/[\s-]/', '', $_POST['isbn'] ?? ''));
$judul = trim($_POST['judul'] ?? ''); $pnb = trim($_POST['penerbit'] ?? '');
$edisi = ($_POST['edisi'] ?? '') !== '' ? (int)$_POST['edisi'] : null;
$hal = (int)($_POST['halaman'] ?? 0); $lic = (int)($_POST['license'] ?? 0);
$fmt = $_POST['format'] ?? '';
$split = fn($s) => array_values(array_unique(array_filter(array_map('trim', explode(',', $s)), 'strlen')));
$penulis = $split($_POST['penulis'] ?? ''); $kategori = $split($_POST['kategori'] ?? '');

if (!preg_match('/^(\d{9}[\dX]|\d{13})$/', $isbn)) fail('ISBN harus 10 atau 13 karakter.', 422);
if ($judul === '' || $pnb === '' || !$penulis) fail('Judul, penulis, dan penerbit wajib diisi.', 422);
if ($hal < 1) fail('Jumlah halaman tidak valid.', 422);
if ($lic < 1) fail('Jumlah lisensi minimal 1 (jumlah orang yang bisa meminjam bersamaan).', 422);
if (!in_array($fmt, ['pdf', 'epub'], true)) fail('Format harus pdf atau epub.', 422);
if (q('SELECT 1 FROM buku WHERE isbn=?', [$isbn])->fetch()) fail('ISBN sudah terdaftar.', 422);

$cover = save_upload('cover', 'images/covers', ['jpg', 'jpeg', 'png', 'webp', 'gif'], 3, $isbn) ?: (trim($_POST['cover_url'] ?? '') ?: null);
$file = save_upload('file', 'books', [$fmt], 50, $isbn) ?: trim($_POST['file_url'] ?? '');
if ($file === '') { hapus_lokal($cover); fail('Unggah file buku atau isi URL file.', 422); }

$pdo->beginTransaction();
try {
    q('INSERT IGNORE INTO penerbit(nama_penerbit) VALUES(?)', [$pnb]);
    $idp = q('SELECT id_penerbit FROM penerbit WHERE nama_penerbit=?', [$pnb])->fetchColumn();
    q('INSERT INTO buku(isbn, judul, edisi, id_penerbit, halaman, cover_url, file_url, format, license) VALUES(?,?,?,?,?,?,?,?,?)',
      [$isbn, $judul, $edisi, $idp, $hal, $cover, $file, $fmt, $lic]);
    foreach ($penulis as $n) {
        $id = q('SELECT id_penulis FROM penulis WHERE nama_penulis=? LIMIT 1', [$n])->fetchColumn();
        if (!$id) { q('INSERT INTO penulis(nama_penulis) VALUES(?)', [$n]); $id = $pdo->lastInsertId(); }
        q('INSERT INTO tulis_buku(id_penulis, isbn) VALUES(?,?)', [$id, $isbn]);
    }
    foreach ($kategori as $n) {
        q('INSERT IGNORE INTO kategori(nama_kategori) VALUES(?)', [$n]);
        $id = q('SELECT id_kategori FROM kategori WHERE nama_kategori=?', [$n])->fetchColumn();
        q('INSERT INTO kategori_buku(id_kategori, isbn) VALUES(?,?)', [$id, $isbn]);
    }
    $pdo->commit();
} catch (Exception $e) {
    $pdo->rollBack(); hapus_lokal($cover); hapus_lokal($file);
    fail('Gagal menyimpan buku: ' . $e->getMessage(), 500);
}
ok(['message' => 'Buku "' . $judul . '" berhasil ditambahkan.']);
