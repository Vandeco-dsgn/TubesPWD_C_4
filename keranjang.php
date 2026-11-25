<?php
require 'config.php';
$u = need_login(); $uid = (int)$u['id_user'];
$cart = $_SESSION['cart'] ?? [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $a = $_POST['action'] ?? '';
    $sel = array_values(array_unique(array_filter((array)($_POST['isbn'] ?? []), 'strlen')));
    if ($a === 'hapus') {
        $_SESSION['cart'] = array_values(array_diff($cart, $sel));
        ok(['message' => 'Buku dihapus dari keranjang.']);
    }
    if ($a === 'pinjam') {
        if (!$sel) fail('Pilih minimal satu buku.');
        $hari = (int)($_POST['hari'] ?? MAX_HARI);
        if ($hari < 1 || $hari > MAX_HARI) fail('Lama peminjaman maksimal ' . MAX_HARI . ' hari.');
        $pdo->beginTransaction();
        try {
            $in = implode(',', array_fill(0, count($sel), '?'));
            // kunci baris buku agar stok lisensi tidak balapan antar user
            $rows = q("SELECT isbn FROM buku WHERE isbn IN ($in) FOR UPDATE", $sel)->fetchAll();
            if (count($rows) !== count($sel)) throw new Exception('Ada buku yang tidak ditemukan.');
            foreach ($sel as $isbn) {
                $b = q(book_sql($uid) . ' WHERE b.isbn=?', [$isbn])->fetch();
                if ($b['dipinjam']) throw new Exception('Kamu masih meminjam "' . $b['judul'] . '". Satu buku tidak bisa dipinjam dua kali.');
                if ($b['tersedia'] < 1) throw new Exception('Lisensi "' . $b['judul'] . '" sudah habis dipinjam.');
            }
            foreach ($sel as $isbn) { // satu baris pinjam per buku -> bisa dikembalikan satu per satu
                q("INSERT INTO pinjam(id_user, tanggal_pinjam, tanggal_jatuh_tempo, status)
                   VALUES(?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), 'aktif')", [$uid, $hari]);
                q('INSERT INTO detail_pinjam(id_pinjam, isbn) VALUES(?,?)', [$pdo->lastInsertId(), $isbn]);
            }
            $pdo->commit();
        } catch (Exception $e) { $pdo->rollBack(); fail($e->getMessage()); }
        $_SESSION['cart'] = array_values(array_diff($cart, $sel));
        ok(['message' => 'Peminjaman berhasil. Selamat membaca!']);
    }
    fail('Aksi tidak dikenal.');
}

$items = [];
if ($cart) {
    $in = implode(',', array_fill(0, count($cart), '?'));
    $by = [];
    foreach (q(book_sql($uid) . " WHERE b.isbn IN ($in)", $cart)->fetchAll() as $r) $by[$r['isbn']] = $r;
    foreach ($cart as $isbn) if (isset($by[$isbn])) $items[] = $by[$isbn];
    $_SESSION['cart'] = array_column($items, 'isbn');
}
ok(['items' => $items, 'max_hari' => MAX_HARI]);
