<?php
/* Penyaji file buku. Tidak ada URL file asli yang pernah dikirim ke browser.
   Syarat: login, buku sedang dipinjam, dan permintaan datang dari pembaca situs (header X-Reader).
   Dengan begitu file tidak bisa dibuka/diunduh lewat tab baru atau "Save link as". */
require 'config.php';
$u = need_login(); $uid = (int)$u['id_user'];
if (($_SERVER['HTTP_X_READER'] ?? '') !== '1') fail('File hanya bisa dibuka lewat pembaca di situs ini.', 403);

$isbn = trim($_GET['isbn'] ?? '');
$b = q('SELECT file_url, format FROM buku WHERE isbn=?', [$isbn])->fetch();
if (!$b) fail('Buku tidak ditemukan.', 404);
if (!has_active($uid, $isbn)) fail('Kamu tidak sedang meminjam buku ini.', 403);
session_write_close(); // lepas kunci sesi agar halaman lain tidak menunggu

$mime = $b['format'] === 'epub' ? 'application/epub+zip' : 'application/pdf';
function kirim_header($mime, $len = null) {
    header('Content-Type: ' . $mime);
    header('Content-Disposition: inline');
    header('Cache-Control: no-store, no-cache, must-revalidate, private');
    header('Pragma: no-cache');
    header('X-Content-Type-Options: nosniff');
    if ($len !== null) header('Content-Length: ' . $len);
}
while (ob_get_level()) ob_end_clean();
set_time_limit(0);
$src = $b['file_url'];

if (preg_match('#^books/[\w.\-]+$#', $src)) {                 // file lokal hasil unggahan
    $f = __DIR__ . '/' . $src;
    if (!is_file($f)) fail('File buku tidak ditemukan di server.', 404);
    kirim_header($mime, filesize($f));
    readfile($f); exit;
}
if (preg_match('#^https?://#i', $src)) {                      // file di URL eksternal: diteruskan lewat server
    if (!function_exists('curl_init')) fail('Ekstensi cURL PHP belum aktif (aktifkan extension=curl di php.ini).', 500);
    $sent = false;
    $ch = curl_init($src);
    curl_setopt_array($ch, [
        CURLOPT_FOLLOWLOCATION => true, CURLOPT_MAXREDIRS => 5, CURLOPT_FAILONERROR => true,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS, CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
        CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 300,
        CURLOPT_WRITEFUNCTION => function ($c, $d) use (&$sent, $mime) {
            if (!$sent) { kirim_header($mime); $sent = true; }
            echo $d; return strlen($d);
        },
    ]);
    $okc = curl_exec($ch); curl_close($ch);
    if (!$okc && !$sent) fail('Gagal mengambil file buku dari sumbernya.', 502);
    exit;
}
fail('Lokasi file buku tidak valid.', 404);
