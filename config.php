<?php
/* Konfigurasi & fungsi bantu E-Lib */
session_start();
date_default_timezone_set('Asia/Jakarta');

const DB_HOST = 'localhost';
const DB_NAME = 'e-library';   // nama database tempat e-lib.sql di-import
const DB_USER = 'root';
const DB_PASS = '';        // default XAMPP: kosong
const MAX_HARI  = 14;      // batas maksimal lama peminjaman (hari)
const WARN_HARI = 3;       // "Segera Jatuh Tempo" jika sisa <= 3 hari
const AUTHORS = "(SELECT GROUP_CONCAT(p.nama_penulis ORDER BY p.nama_penulis SEPARATOR ', ') FROM tulis_buku t JOIN penulis p ON p.id_penulis=t.id_penulis WHERE t.isbn=b.isbn)";

function json_out($d, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($d, JSON_UNESCAPED_UNICODE);
    exit;
}
function fail($msg, $code = 400) { json_out(['ok' => false, 'error' => $msg], $code); }
function ok($d = []) { $u = me(); json_out(array_merge(['ok' => true, 'user' => $u ? pub($u) : null], $d)); }

try {
    $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => true,
    ]);
} catch (PDOException $e) {
    fail('Koneksi database gagal. Pastikan MySQL aktif dan database "' . DB_NAME . '" sudah dibuat + di-import.', 500);
}

function q($sql, $p = []) { global $pdo; $s = $pdo->prepare($sql); $s->execute($p); return $s; }

function me() {
    if (empty($_SESSION['uid'])) return null;
    return q('SELECT * FROM users WHERE id_user=?', [$_SESSION['uid']])->fetch() ?: null;
}
function pub($u) {
    return ['id_user' => (int)$u['id_user'], 'username' => $u['username'], 'email' => $u['email'],
            'role' => $u['role'], 'pfp_url' => $u['pfp_url'], 'cart' => count($_SESSION['cart'] ?? [])];
}
function need_login() { $u = me(); if (!$u) fail('Silakan login terlebih dahulu.', 401); return $u; }
function need_staff() { $u = need_login(); if ($u['role'] !== 'staff') fail('Hanya staff yang boleh mengakses ini.', 403); return $u; }

/* Query dasar buku: penulis, sisa lisensi (tersedia), jumlah peminjaman (populer), apakah user sedang meminjam */
function book_sql($uid) {
    $uid = (int)$uid;
    return "SELECT b.isbn, b.judul, b.cover_url, b.halaman, b.license, " . AUTHORS . " AS penulis,
      GREATEST(b.license - (SELECT COUNT(*) FROM detail_pinjam d JOIN pinjam j ON j.id_pinjam=d.id_pinjam
                            WHERE d.isbn=b.isbn AND j.status='aktif'), 0) AS tersedia,
      (SELECT COUNT(*) FROM detail_pinjam d WHERE d.isbn=b.isbn) AS populer,
      EXISTS(SELECT 1 FROM detail_pinjam d JOIN pinjam j ON j.id_pinjam=d.id_pinjam
             WHERE d.isbn=b.isbn AND j.status='aktif' AND j.id_user=$uid) AS dipinjam
      FROM buku b";
}
function has_active($uid, $isbn) {
    return (bool)q("SELECT 1 FROM detail_pinjam d JOIN pinjam j ON j.id_pinjam=d.id_pinjam
                    WHERE j.id_user=? AND d.isbn=? AND j.status='aktif' LIMIT 1", [$uid, $isbn])->fetch();
}

/* Upload file -> mengembalikan path relatif, atau null bila tidak ada file */
function save_upload($field, $dir, $exts, $maxMB, $prefix) {
    if (empty($_FILES[$field]) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) return null;
    $x = $_FILES[$field];
    if ($x['error'] !== UPLOAD_ERR_OK) fail('Upload gagal (kode ' . $x['error'] . '). Cek batas upload_max_filesize di php.ini.');
    if ($x['size'] > $maxMB * 1048576) fail("Ukuran file maksimal {$maxMB} MB.");
    $ext = strtolower(pathinfo($x['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $exts, true)) fail('Tipe file harus: ' . implode(', ', $exts) . '.');
    if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true) && !@getimagesize($x['tmp_name'])) fail('File bukan gambar yang valid.');
    $abs = __DIR__ . '/' . $dir;
    if (!is_dir($abs)) mkdir($abs, 0777, true);
    $name = $prefix . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    if (!move_uploaded_file($x['tmp_name'], "$abs/$name")) fail('Gagal menyimpan file ke folder ' . $dir . '.', 500);
    return "$dir/$name";
}
/* Hapus file lokal hanya jika berada di folder upload milik aplikasi */
function hapus_lokal($path) {
    if ($path && preg_match('#^(images/avatars|images/covers|books)/[\w.\-]+$#', $path)) {
        $f = __DIR__ . '/' . $path;
        if (is_file($f)) @unlink($f);
    }
}
