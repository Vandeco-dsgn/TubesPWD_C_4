<?php
/* Hapus buku (khusus staff).
   Ditolak jika masih ada yang meminjam. Jika tidak, buku beserta riwayat peminjaman,
   progres baca, relasi penulis/kategori, dan file lokalnya ikut dihapus. */
require 'config.php';
need_staff();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Metode tidak valid.', 405);

$isbn = trim($_POST['isbn'] ?? '');
$b = q('SELECT isbn, judul, cover_url, file_url FROM buku WHERE isbn=?', [$isbn])->fetch();
if (!$b) fail('Buku tidak ditemukan.', 404);

$aktif = (int)q("SELECT COUNT(*) FROM detail_pinjam d JOIN pinjam j ON j.id_pinjam=d.id_pinjam
                 WHERE d.isbn=? AND j.status='aktif'", [$isbn])->fetchColumn();
if ($aktif > 0) fail("Buku \"{$b['judul']}\" tidak bisa dihapus karena masih dipinjam oleh $aktif orang. Tunggu sampai semua dikembalikan.", 409);

$pdo->beginTransaction();
try {
    $ids = q('SELECT DISTINCT id_pinjam FROM detail_pinjam WHERE isbn=?', [$isbn])->fetchAll(PDO::FETCH_COLUMN);
    q('DELETE FROM detail_pinjam WHERE isbn=?', [$isbn]);
    foreach ($ids as $id) { // hapus data pinjam yang tidak punya buku lagi
        q('DELETE FROM pinjam WHERE id_pinjam=? AND NOT EXISTS(SELECT 1 FROM detail_pinjam WHERE id_pinjam=?)', [$id, $id]);
    }
    q('DELETE FROM progres WHERE isbn=?', [$isbn]);
    q('DELETE FROM tulis_buku WHERE isbn=?', [$isbn]);
    q('DELETE FROM kategori_buku WHERE isbn=?', [$isbn]);
    q('DELETE FROM buku WHERE isbn=?', [$isbn]);
    $pdo->commit();
} catch (Exception $e) {
    $pdo->rollBack();
    fail('Gagal menghapus buku: ' . $e->getMessage(), 500);
}

// file lokal dihapus setelah database berhasil (URL eksternal dibiarkan)
hapus_lokal($b['cover_url']); hapus_lokal($b['file_url']);
$_SESSION['cart'] = array_values(array_diff($_SESSION['cart'] ?? [], [$isbn]));
ok(['message' => 'Buku "' . $b['judul'] . '" berhasil dihapus.']);
