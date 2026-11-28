-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 28, 2026 at 10:04 AM
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
-- Database: `library`
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
('9786020531328', 'Seporsi Mie Ayam Sebelum Mati', NULL, 1, 217, 'images/covers/9786020531328_4acdb942.jpg', 'books/9786020531328_e1dbb438.pdf', 'pdf', 5),
('9786020644158', 'Sukses Memimpin', NULL, 8, 214, 'images/covers/9786020644158_556a9481.jpg', 'books/9786020644158_7f33891d.pdf', 'pdf', 5),
('9786020653853', 'Breath: Cara Bernapas dengan Benar', NULL, 8, 332, 'images/covers/9786020653853_ac699703.jpg', 'books/9786020653853_62560ebb.pdf', 'pdf', 5),
('9786026320094', 'Hipnosis Go: Untuk Hidup Lebih Baik', NULL, 7, 220, 'images/covers/9786026320094_d8ad1b83.jpg', 'books/9786026320094_d949fc0a.pdf', 'pdf', 5),
('9786230417863', 'Logika Asa', NULL, 6, 356, 'images/covers/9786230417863_9cd69f0f.jpg', 'books/9786230417863_c1c15417.pdf', 'pdf', 5),
('9789797945275', 'Merayakan Kehilangan', NULL, 3, 226, 'images/covers/9789797945275_4324c745.jpg', 'books/9789797945275_302a1995.pdf', 'pdf', 5);

-- --------------------------------------------------------

--
-- Table structure for table `detail_pinjam`
--

CREATE TABLE `detail_pinjam` (
  `id_pinjam` int(11) NOT NULL,
  `isbn` varchar(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `detail_pinjam`
--

INSERT INTO `detail_pinjam` (`id_pinjam`, `isbn`) VALUES
(1, '9786020531328'),
(2, '9786020644158'),
(3, '9786020531328'),
(4, '9786020644158'),
(5, '9786020531328');

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
(1, 'Fiksi'),
(7, 'Non Fiksi'),
(3, 'Romance');

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
(1, '9786020531328'),
(1, '9786230417863'),
(3, '9789797945275'),
(7, '9786020644158'),
(7, '9786020653853');

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
(6, 'Bhuana Ilmu Populer'),
(7, 'BintangWahyu'),
(8, 'Gramedia Pustaka Utama'),
(1, 'Gramedia Widiasarana Indonesia (Grasindo)'),
(2, 'Gramedia Widiasarana Indonesia (Grasindo) 2'),
(3, 'mediakita');

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
(1, 'Brian Krisna'),
(2, 'Brian Krisna 2'),
(3, 'Brian Khrisna'),
(4, 'Valerie Patkar'),
(5, 'Nurul Fajriyah & Machrubiansyah'),
(6, 'James Nestor'),
(7, 'Dale Carnegie');

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

--
-- Dumping data for table `pinjam`
--

INSERT INTO `pinjam` (`id_pinjam`, `id_user`, `tanggal_pinjam`, `tanggal_jatuh_tempo`, `tanggal_kembali`, `status`, `created_at`) VALUES
(1, 1, '2026-11-28', '2026-11-29', '2026-11-28', 'dikembalikan', '2026-11-28 05:04:00'),
(2, 1, '2026-11-28', '2026-12-12', '2026-11-28', 'dikembalikan', '2026-11-28 08:21:42'),
(3, 2, '2026-11-28', '2026-12-12', '2026-11-28', 'dikembalikan', '2026-11-28 08:46:13'),
(4, 1, '2026-11-28', '2026-12-01', '2026-11-28', 'dikembalikan', '2026-11-28 08:49:49'),
(5, 1, '2026-11-28', '2026-12-04', '2026-11-28', 'dikembalikan', '2026-11-28 08:56:02');

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

--
-- Dumping data for table `progres`
--

INSERT INTO `progres` (`id_user`, `isbn`, `halaman_terakhir`, `updated_at`) VALUES
(1, '9786020644158', 1, '2026-11-28 08:21:53');

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
(3, '9786020531328'),
(3, '9789797945275'),
(4, '9786230417863'),
(5, '9786026320094'),
(6, '9786020653853'),
(7, '9786020644158');

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
(1, 'admin@gmail.com', 'admin', '$2y$12$SRWZqnSVGe2vwFc5QE.UsOq2OEPXxWyXRkSHLatUCxnGnJ5G5GOqW', 'staff', NULL, '2026-11-26 06:36:19'),
(2, 'testing@gmail.com', 'testing', '$2y$12$kIWKdxLyoIdqkCwszeU6oeg9b93qXeygO9HpS5Lx96CnAes8xjaU6', 'member', NULL, '2026-11-26 06:38:09'),
(3, 'user@gmail.com', 'user', '$2y$12$EruCUeQQQzpUbHD/daZtWuHT8Mx26fMejxlumqqjrLYj1Vcsw0GKO', 'member', NULL, '2026-11-28 08:56:34');

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
  MODIFY `id_kategori` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `penerbit`
--
ALTER TABLE `penerbit`
  MODIFY `id_penerbit` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `penulis`
--
ALTER TABLE `penulis`
  MODIFY `id_penulis` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `pinjam`
--
ALTER TABLE `pinjam`
  MODIFY `id_pinjam` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
