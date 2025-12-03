-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-12-2025 a las 02:40:11
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12


SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tiendalego`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `imagen` longblob NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `disponibilidad` int(11) NOT NULL DEFAULT 0,
  `categoria` enum('Technic','Ideas','Icons') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `imagen`, `nombre`, `descripcion`, `precio`, `disponibilidad`, `categoria`) VALUES
(0, 0x68747470733a2f2f7669612e706c616365686f6c6465722e636f6d2f333030783330303f746578743d53696e2b496d6167656e, 'calis', 'sjsjsj', 80.00, 4, 'Technic');


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
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
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `nombrecuenta`, `correo`, `productoscomprados`, `rol`, `intentos_fallidos`, `bloqueado_hasta`, `contrasena`, `codigo_recuperacion`, `codigo_expiracion`, `pais`) VALUES
(5, 'kikin', 'kikin', 'al369829@edu.uaa.mx', 0, 'usuario', 0, NULL, '7099ef0dc0963aacc2e5a32194160b3b:9a6741060472cc4c83fece13d231f7ae5f981e675c73d4ea49686507420435214b8db4f2f3c58100223164ab0abd3e388434710bbb95b125015bbc2af1069ac6', NULL, NULL, 'México'),
(6, 'admin', 'admin', 'juanmanuelfriascortes@gmail.com', 0, 'admin', 0, NULL, '09b8dbdfb9b7b547a77cb3ff45dae7dd:f2ae76ad9a73886789d1f79821d0df006eb94c7d265f183fe3d665d141039633248f94ce32a48ff0da9a3a7af705ed3d47dc3f294a1d8c9921c12fcc9fc32a30', NULL, NULL, 'México');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
