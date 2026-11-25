<?php
require 'config.php';
$u = need_login(); $uid = (int)$u['id_user'];

// Buka file buku (hanya jika sedang dipinjam), catat progres, lalu arahkan ke file
if (isset($_GET['baca'])) {
    $isbn = $_GET['baca'];
    $b = q('SELECT file_url FROM buku WHERE isbn=?', [$isbn])->fetch();
    if (!$b || !has_active($uid, $isbn)) { header('Location: riwayat.xhtml'); exit; }
    q('INSERT INTO progres(id_user, isbn) VALUES(?,?) ON DUPLICATE KEY UPDATE updated_at=NOW()', [$uid, $isbn]);
    header('Location: ' . $b['file_url']); exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (($_POST['action'] ?? '') === 'kembali') {
        $st = q("UPDATE pinjam SET status='dikembalikan', tanggal_kembali=CURDATE()
                 WHERE id_pinjam=? AND id_user=? AND status='aktif'", [(int)($_POST['id'] ?? 0), $uid]);
        if (!$st->rowCount()) fail('Peminjaman tidak ditemukan atau sudah dikembalikan.');
        ok(['message' => 'Buku berhasil dikembalikan.']);
    }
    fail('Aksi tidak dikenal.');
}

$f = $_GET['filter'] ?? 'semua';
$where = $f === 'dipinjam' ? " AND j.status='aktif'" : ($f === 'selesai' ? " AND j.status='dikembalikan'" : '');
$rows = q("SELECT j.id_pinjam, b.isbn, b.judul, b.cover_url, " . AUTHORS . " AS penulis,
      j.tanggal_pinjam, j.tanggal_jatuh_tempo, j.tanggal_kembali, j.status,
      DATEDIFF(j.tanggal_jatuh_tempo, CURDATE()) AS sisa,
      CASE WHEN j.status='dikembalikan' THEN 'selesai'
           WHEN j.tanggal_jatuh_tempo < CURDATE() THEN 'terlambat'
           WHEN DATEDIFF(j.tanggal_jatuh_tempo, CURDATE()) <= " . WARN_HARI . " THEN 'segera'
           ELSE 'dipinjam' END AS label
    FROM pinjam j JOIN detail_pinjam d ON d.id_pinjam=j.id_pinjam JOIN buku b ON b.isbn=d.isbn
    WHERE j.id_user=? $where ORDER BY j.created_at DESC, j.id_pinjam DESC", [$uid])->fetchAll();
ok(['rows' => $rows]);
