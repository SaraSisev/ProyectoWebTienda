-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 03, 2025 at 02:36 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tiendalego`
--

-- --------------------------------------------------------

--
-- Table structure for table `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `disponibilidad` int(11) NOT NULL DEFAULT 0,
  `categoria` enum('Technic','Ideas','Icons') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `productos`
--

INSERT INTO `productos` (`id`, `imagen`, `nombre`, `descripcion`, `precio`, `disponibilidad`, `categoria`) VALUES
(0, 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.facebook.com%2Fchivas.femenil%2F&psig=AOvVaw06YUsgvAW5MYDz9BtjRE4U&ust=1764699755284000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCID_gdyAnZEDFQAAAAAdAAAAABAE', 'chivas alv', 'kikin', 5.00, 10, 'Technic');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `nombrecuenta` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `productoscomprados` int(11) NOT NULL,
  `rol` enum('usuario','admin') DEFAULT 'usuario',
  `intentos_fallidos` int(11) DEFAULT 0,
  `bloqueado_hasta` datetime DEFAULT NULL,
  `contrasena` varchar(255) DEFAULT NULL,
  `codigo_recuperacion` varchar(6) DEFAULT NULL,
  `codigo_expiracion` datetime DEFAULT NULL,
  `pais` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `nombrecuenta`, `correo`, `productoscomprados`, `rol`, `intentos_fallidos`, `bloqueado_hasta`, `contrasena`, `codigo_recuperacion`, `codigo_expiracion`, `pais`) VALUES
(5, 'kikin', 'kikin', 'al369829@edu.uaa.mx', 0, 'usuario', 0, NULL, '7099ef0dc0963aacc2e5a32194160b3b:9a6741060472cc4c83fece13d231f7ae5f981e675c73d4ea49686507420435214b8db4f2f3c58100223164ab0abd3e388434710bbb95b125015bbc2af1069ac6', NULL, NULL, 'México'),
(6, 'admin', 'admin', 'juanmanuelfriascortes@gmail.com', 0, 'admin', 0, NULL, '09b8dbdfb9b7b547a77cb3ff45dae7dd:f2ae76ad9a73886789d1f79821d0df006eb94c7d265f183fe3d665d141039633248f94ce32a48ff0da9a3a7af705ed3d47dc3f294a1d8c9921c12fcc9fc32a30', NULL, NULL, 'México');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
