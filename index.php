<?php
require 'config.php';
$u = need_login(); $uid = (int)$u['id_user'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $a = $_POST['action'] ?? '';
    $isbn = trim($_POST['isbn'] ?? '');
    if ($a === 'keranjang') {
        $b = q(book_sql($uid) . ' WHERE b.isbn=?', [$isbn])->fetch();
        if (!$b) fail('Buku tidak ditemukan.', 404);
        if ($b['dipinjam']) fail('Kamu masih meminjam buku ini. Kembalikan dulu sebelum meminjam lagi.');
        if ($b['tersedia'] < 1) fail('Lisensi buku ini sedang habis dipinjam orang lain.');
        $c = $_SESSION['cart'] ?? [];
        if (in_array($isbn, $c, true)) fail('Buku sudah ada di keranjang.');
        $c[] = $isbn; $_SESSION['cart'] = $c;
        ok(['message' => 'Ditambahkan ke keranjang.']);
    }
    if ($a === 'progres') {
        $b = q('SELECT halaman FROM buku WHERE isbn=?', [$isbn])->fetch();
        if (!$b || !has_active($uid, $isbn)) fail('Buku ini tidak sedang kamu pinjam.');
        $h = (int)($_POST['halaman'] ?? -1);
        if ($h < 0 || $h > (int)$b['halaman']) fail('Halaman harus antara 0 dan ' . $b['halaman'] . '.');
        q('INSERT INTO progres(id_user, isbn, halaman_terakhir) VALUES(?,?,?)
           ON DUPLICATE KEY UPDATE halaman_terakhir=VALUES(halaman_terakhir), updated_at=NOW()', [$uid, $isbn, $h]);
        ok(['message' => 'Progres membaca disimpan.']);
    }
    fail('Aksi tidak dikenal.');
}

$cari = trim($_GET['q'] ?? '');
if ($cari !== '') {
    $l = '%' . $cari . '%';
    $populer = q(book_sql($uid) . ' WHERE b.judul LIKE ? OR b.isbn LIKE ? OR EXISTS(SELECT 1 FROM tulis_buku t JOIN penulis p ON p.id_penulis=t.id_penulis WHERE t.isbn=b.isbn AND p.nama_penulis LIKE ?) ORDER BY b.judul', [$l, $l, $l])->fetchAll();
    $semua = []; $judul = 'Hasil Pencarian';
} else {
    $populer = q(book_sql($uid) . ' ORDER BY populer DESC, b.judul LIMIT 5')->fetchAll();
    $semua = q(book_sql($uid) . ' ORDER BY b.judul')->fetchAll();
    $judul = 'Populer Sekarang';
}
$reading = q("SELECT b.isbn, b.judul, b.halaman, pr.halaman_terakhir, " . AUTHORS . " AS penulis
              FROM progres pr JOIN buku b ON b.isbn=pr.isbn
              WHERE pr.id_user=? AND EXISTS(SELECT 1 FROM detail_pinjam d JOIN pinjam j ON j.id_pinjam=d.id_pinjam
                                            WHERE d.isbn=b.isbn AND j.id_user=pr.id_user AND j.status='aktif')
              ORDER BY pr.updated_at DESC LIMIT 1", [$uid])->fetch() ?: null;
ok(['judul' => $judul, 'populer' => $populer, 'semua' => $semua, 'reading' => $reading]);
