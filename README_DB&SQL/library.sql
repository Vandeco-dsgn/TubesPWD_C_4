-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 28, 2026 at 06:47 AM
-- Server version: 10.11.16-MariaDB
-- PHP Version: 8.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `e-library`
--

-- --------------------------------------------------------

--
-- Table structure for table `buku`
--

CREATE TABLE `buku` (
  `isbn` varchar(13) NOT NULL,
  `judul` varchar(255) NOT NULL,
  `edisi` int(11) DEFAULT NULL,
  `id_penerbit` int(11) NOT NULL,
  `halaman` int(11) NOT NULL,
  `cover_url` varchar(255) DEFAULT NULL,
  `file_url` varchar(255) NOT NULL COMMENT 'Location of the readable file',
  `format` enum('pdf','epub') NOT NULL,
  `license` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `buku`
--

INSERT INTO `buku` (`isbn`, `judul`, `edisi`, `id_penerbit`, `halaman`, `cover_url`, `file_url`, `format`, `license`) VALUES
('9786020531328', 'Seporsi Mie Ayam Sebelum Mati', 0, 3, 217, 'images/covers/9786020531328_2c3a001f.jpg', 'books/9786020531328_d03424e1.pdf', 'pdf', 5),
('9786020644158', 'Sukses Memimpin', 0, 1, 214, 'images/covers/9786020644158_db962484.jpg', 'books/9786020644158_de0e532b.pdf', 'pdf', 5),
('9786020653853', 'Breath: Cara Bernapas dengan Benar', 0, 1, 322, 'images/covers/9786020653853_829795d8.jpg', 'books/9786020653853_1349a63e.pdf', 'pdf', 5),
('9786026320094', 'Hipnosis Go: Untuk Hidup Lebih Baik', 0, 4, 222, 'images/covers/9786026320094_cd38a177.jpg', 'books/9786026320094_bcc2e4da.pdf', 'pdf', 5),
('9786230417863', 'Logika Asa', 0, 2, 356, 'images/covers/9786230417863_47e632cc.jpg', 'books/9786230417863_9c05008b.pdf', 'pdf', 5),
('9789797945275', 'Merayakan Kehilangan', 1, 5, 226, 'images/covers/9789797945275_ea0d79c3.jpg', 'books/9789797945275_712ac70f.pdf', 'pdf', 5);

-- --------------------------------------------------------

--
-- Table structure for table `detail_pinjam`
--

CREATE TABLE `detail_pinjam` (
  `id_pinjam` int(11) NOT NULL,
  `isbn` varchar(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kategori`
--

CREATE TABLE `kategori` (
  `id_kategori` int(11) NOT NULL,
  `nama_kategori` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kategori`
--

INSERT INTO `kategori` (`id_kategori`, `nama_kategori`) VALUES
(9, 'Bisnis & Pengembangan Diri'),
(4, 'Fiksi'),
(3, 'Fiksi / Novel'),
(2, 'Kesehatan'),
(1, 'Nonfiksi'),
(6, 'Psikologi & Pengembangan Diri'),
(7, 'Romance');

-- --------------------------------------------------------

--
-- Table structure for table `kategori_buku`
--

CREATE TABLE `kategori_buku` (
  `id_kategori` int(11) NOT NULL,
  `isbn` varchar(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kategori_buku`
--

INSERT INTO `kategori_buku` (`id_kategori`, `isbn`) VALUES
(1, '9786020644158'),
(1, '9786020653853'),
(1, '9786026320094'),
(2, '9786020653853'),
(3, '9786230417863'),
(4, '9786020531328'),
(6, '9786026320094'),
(7, '9789797945275'),
(9, '9786020644158');

-- --------------------------------------------------------

--
-- Table structure for table `penerbit`
--

CREATE TABLE `penerbit` (
  `id_penerbit` int(11) NOT NULL,
  `nama_penerbit` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `penerbit`
--

INSERT INTO `penerbit` (`id_penerbit`, `nama_penerbit`) VALUES
(2, 'Bhuana Ilmu Populer'),
(4, 'BintangWahyu'),
(1, 'Gramedia Pustaka Utama'),
(3, 'Gramedia Widiasarana Indonesia (Grasindo)'),
(5, 'mediakita');

-- --------------------------------------------------------

--
-- Table structure for table `penulis`
--

CREATE TABLE `penulis` (
  `id_penulis` int(11) NOT NULL,
  `nama_penulis` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `penulis`
--

INSERT INTO `penulis` (`id_penulis`, `nama_penulis`) VALUES
(1, 'James Nestor'),
(2, 'Valerie Patkar'),
(3, 'Brian Khrisna'),
(4, 'Nurul Fajriyah & Machrubiansyah'),
(5, 'Dale Carnegie');

-- --------------------------------------------------------

--
-- Table structure for table `pinjam`
--

CREATE TABLE `pinjam` (
  `id_pinjam` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `tanggal_pinjam` date NOT NULL,
  `tanggal_jatuh_tempo` date NOT NULL,
  `tanggal_kembali` date DEFAULT NULL COMMENT 'NULL while the loan is still active',
  `status` enum('aktif','dikembalikan') NOT NULL DEFAULT 'aktif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `progres`
--

CREATE TABLE `progres` (
  `id_user` int(11) NOT NULL,
  `isbn` varchar(13) NOT NULL,
  `halaman_terakhir` int(11) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tulis_buku`
--

CREATE TABLE `tulis_buku` (
  `id_penulis` int(11) NOT NULL,
  `isbn` varchar(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tulis_buku`
--

INSERT INTO `tulis_buku` (`id_penulis`, `isbn`) VALUES
(1, '9786020653853'),
(2, '9786230417863'),
(3, '9786020531328'),
(3, '9789797945275'),
(4, '9786026320094'),
(5, '9786020644158');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('staff','member') NOT NULL DEFAULT 'member',
  `pfp_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `email`, `username`, `password_hash`, `role`, `pfp_url`, `created_at`) VALUES
(1, 'admin@gmail.com', 'admin', '$2y$12$wN/ks8dS27JBcCT9zcIPUeLxiQXevb2h3OTY7xjWMeyDIfJMP373e', 'staff', NULL, '2026-11-28 05:26:04'),
(2, 'xxx@gmail.com', 'xxx', '$2y$12$m8clzxzNiKNwRp.FAAIHYedmU0tykbdZC0dZFjZWQw/A./a1g2abO', 'member', NULL, '2026-11-28 05:43:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `buku`
--
ALTER TABLE `buku`
  ADD PRIMARY KEY (`isbn`),
  ADD KEY `buku_index_0` (`id_penerbit`);

--
-- Indexes for table `detail_pinjam`
--
ALTER TABLE `detail_pinjam`
  ADD PRIMARY KEY (`id_pinjam`,`isbn`),
  ADD KEY `detail_pinjam_index_5` (`isbn`);

--
-- Indexes for table `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`id_kategori`),
  ADD UNIQUE KEY `nama_kategori` (`nama_kategori`);

--
-- Indexes for table `kategori_buku`
--
ALTER TABLE `kategori_buku`
  ADD PRIMARY KEY (`id_kategori`,`isbn`),
  ADD KEY `kategori_buku_index_2` (`isbn`);

--
-- Indexes for table `penerbit`
--
ALTER TABLE `penerbit`
  ADD PRIMARY KEY (`id_penerbit`),
  ADD UNIQUE KEY `nama_penerbit` (`nama_penerbit`);

--
-- Indexes for table `penulis`
--
ALTER TABLE `penulis`
  ADD PRIMARY KEY (`id_penulis`);

--
-- Indexes for table `pinjam`
--
ALTER TABLE `pinjam`
  ADD PRIMARY KEY (`id_pinjam`),
  ADD KEY `pinjam_index_3` (`id_user`),
  ADD KEY `pinjam_index_4` (`id_user`,`status`);

--
-- Indexes for table `progres`
--
ALTER TABLE `progres`
  ADD PRIMARY KEY (`id_user`,`isbn`),
  ADD KEY `progres_index_6` (`isbn`);

--
-- Indexes for table `tulis_buku`
--
ALTER TABLE `tulis_buku`
  ADD PRIMARY KEY (`id_penulis`,`isbn`),
  ADD KEY `tulis_buku_index_1` (`isbn`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `kategori`
--
ALTER TABLE `kategori`
  MODIFY `id_kategori` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `penerbit`
--
ALTER TABLE `penerbit`
  MODIFY `id_penerbit` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `penulis`
--
ALTER TABLE `penulis`
  MODIFY `id_penulis` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `pinjam`
--
ALTER TABLE `pinjam`
  MODIFY `id_pinjam` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `buku`
--
ALTER TABLE `buku`
  ADD CONSTRAINT `buku_ibfk_1` FOREIGN KEY (`id_penerbit`) REFERENCES `penerbit` (`id_penerbit`);

--
-- Constraints for table `detail_pinjam`
--
ALTER TABLE `detail_pinjam`
  ADD CONSTRAINT `detail_pinjam_ibfk_1` FOREIGN KEY (`id_pinjam`) REFERENCES `pinjam` (`id_pinjam`),
  ADD CONSTRAINT `detail_pinjam_ibfk_2` FOREIGN KEY (`isbn`) REFERENCES `buku` (`isbn`);

--
-- Constraints for table `kategori_buku`
--
ALTER TABLE `kategori_buku`
  ADD CONSTRAINT `kategori_buku_ibfk_1` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`),
  ADD CONSTRAINT `kategori_buku_ibfk_2` FOREIGN KEY (`isbn`) REFERENCES `buku` (`isbn`);

--
-- Constraints for table `pinjam`
--
ALTER TABLE `pinjam`
  ADD CONSTRAINT `pinjam_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);

--
-- Constraints for table `progres`
--
ALTER TABLE `progres`
  ADD CONSTRAINT `progres_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`),
  ADD CONSTRAINT `progres_ibfk_2` FOREIGN KEY (`isbn`) REFERENCES `buku` (`isbn`);

--
-- Constraints for table `tulis_buku`
--
ALTER TABLE `tulis_buku`
  ADD CONSTRAINT `tulis_buku_ibfk_1` FOREIGN KEY (`id_penulis`) REFERENCES `penulis` (`id_penulis`),
  ADD CONSTRAINT `tulis_buku_ibfk_2` FOREIGN KEY (`isbn`) REFERENCES `buku` (`isbn`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
