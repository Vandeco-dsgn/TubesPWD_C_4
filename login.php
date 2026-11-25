<?php
require 'config.php';
if (isset($_GET['logout'])) { $_SESSION = []; session_destroy(); json_out(['ok' => true]); }
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = trim($_POST['username'] ?? ''); $pw = $_POST['password'] ?? '';
    if ($id === '' || $pw === '') fail('Username dan password wajib diisi.', 422);
    $u = q('SELECT * FROM users WHERE username=? OR email=?', [$id, $id])->fetch();
    if (!$u || !password_verify($pw, $u['password_hash'])) fail('Username atau password salah.', 422);
    session_regenerate_id(true);
    $_SESSION['uid'] = (int)$u['id_user'];
    $_SESSION['cart'] = [];
    ok(['message' => 'Login berhasil.']);
}
ok(); // cek status login
