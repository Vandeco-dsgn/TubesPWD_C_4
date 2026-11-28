CREATE TABLE `users` (
  `id_user` integer PRIMARY KEY AUTO_INCREMENT,
  `email` varchar(255) UNIQUE NOT NULL,
  `username` varchar(255) UNIQUE NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` ENUM ('staff', 'member') NOT NULL DEFAULT 'member',
  `pfp_url` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `penerbit` (
  `id_penerbit` integer PRIMARY KEY AUTO_INCREMENT,
  `nama_penerbit` varchar(255) UNIQUE NOT NULL
);

CREATE TABLE `penulis` (
  `id_penulis` integer PRIMARY KEY AUTO_INCREMENT,
  `nama_penulis` varchar(255) NOT NULL
);

CREATE TABLE `kategori` (
  `id_kategori` integer PRIMARY KEY AUTO_INCREMENT,
  `nama_kategori` varchar(255) UNIQUE NOT NULL
);

CREATE TABLE `buku` (
  `isbn` varchar(13) PRIMARY KEY,
  `judul` varchar(255) NOT NULL,
  `edisi` integer,
  `id_penerbit` integer NOT NULL,
  `halaman` integer NOT NULL,
  `cover_url` varchar(255),
  `file_url` varchar(255) NOT NULL COMMENT 'Location of the readable file',
  `format` ENUM ('pdf', 'epub') NOT NULL,
  `license` integer NOT NULL DEFAULT 0
);

CREATE TABLE `tulis_buku` (
  `id_penulis` integer NOT NULL,
  `isbn` varchar(13) NOT NULL,
  PRIMARY KEY (`id_penulis`, `isbn`)
);

CREATE TABLE `kategori_buku` (
  `id_kategori` integer NOT NULL,
  `isbn` varchar(13) NOT NULL,
  PRIMARY KEY (`id_kategori`, `isbn`)
);

CREATE TABLE `pinjam` (
  `id_pinjam` integer PRIMARY KEY AUTO_INCREMENT,
  `id_user` integer NOT NULL,
  `tanggal_pinjam` date NOT NULL,
  `tanggal_jatuh_tempo` date NOT NULL,
  `tanggal_kembali` date COMMENT 'NULL while the loan is still active',
  `status` ENUM ('aktif', 'dikembalikan') NOT NULL DEFAULT 'aktif',
  `created_at` timestamp NOT NULL DEFAULT now()
);

CREATE TABLE `detail_pinjam` (
  `id_pinjam` integer NOT NULL,
  `isbn` varchar(13) NOT NULL,
  PRIMARY KEY (`id_pinjam`, `isbn`)
);

CREATE TABLE `progres` (
  `id_user` integer NOT NULL,
  `isbn` varchar(13) NOT NULL,
  `halaman_terakhir` integer NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id_user`, `isbn`)
);

CREATE INDEX `buku_index_0` ON `buku` (`id_penerbit`);

CREATE INDEX `tulis_buku_index_1` ON `tulis_buku` (`isbn`);

CREATE INDEX `kategori_buku_index_2` ON `kategori_buku` (`isbn`);

CREATE INDEX `pinjam_index_3` ON `pinjam` (`id_user`);

CREATE INDEX `pinjam_index_4` ON `pinjam` (`id_user`, `status`);

CREATE INDEX `detail_pinjam_index_5` ON `detail_pinjam` (`isbn`);

CREATE INDEX `progres_index_6` ON `progres` (`isbn`);

ALTER TABLE `buku` ADD FOREIGN KEY (`id_penerbit`) REFERENCES `penerbit` (`id_penerbit`);

ALTER TABLE `tulis_buku` ADD FOREIGN KEY (`id_penulis`) REFERENCES `penulis` (`id_penulis`);

ALTER TABLE `tulis_buku` ADD FOREIGN KEY (`isbn`) REFERENCES `buku` (`isbn`);

ALTER TABLE `kategori_buku` ADD FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`);

ALTER TABLE `kategori_buku` ADD FOREIGN KEY (`isbn`) REFERENCES `buku` (`isbn`);

ALTER TABLE `pinjam` ADD FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);

ALTER TABLE `detail_pinjam` ADD FOREIGN KEY (`id_pinjam`) REFERENCES `pinjam` (`id_pinjam`);

ALTER TABLE `detail_pinjam` ADD FOREIGN KEY (`isbn`) REFERENCES `buku` (`isbn`);

ALTER TABLE `progres` ADD FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);

ALTER TABLE `progres` ADD FOREIGN KEY (`isbn`) REFERENCES `buku` (`isbn`);
