<?php
require 'config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') ok();
$un = trim($_POST['username'] ?? ''); $em = trim($_POST['email'] ?? '');
$pw = $_POST['password'] ?? ''; $pw2 = $_POST['konfirmasi'] ?? '';
if (!preg_match('/^[A-Za-z0-9_.]{3,30}$/', $un)) fail('Username 3-30 karakter (huruf, angka, titik, underscore).', 422);
if (!filter_var($em, FILTER_VALIDATE_EMAIL) || strlen($em) > 255) fail('Format email tidak valid.', 422);
if (strlen($pw) < 6) fail('Password minimal 6 karakter.', 422);
if ($pw !== $pw2) fail('Konfirmasi password tidak sama.', 422);
if (q('SELECT 1 FROM users WHERE username=?', [$un])->fetch()) fail('Username sudah dipakai.', 422);
if (q('SELECT 1 FROM users WHERE email=?', [$em])->fetch()) fail('Email sudah terdaftar.', 422);
// role tidak diambil dari input -> otomatis 'member' (default tabel)
q('INSERT INTO users(email, username, password_hash) VALUES(?,?,?)', [$em, $un, password_hash($pw, PASSWORD_DEFAULT)]);
ok(['message' => 'Pendaftaran berhasil. Silakan masuk.']);
