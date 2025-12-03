-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-12-2025 a las 04:19:33
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
  `pais` varchar(100) NOT NULL,
  `cupon` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `nombrecuenta`, `correo`, `productoscomprados`, `rol`, `intentos_fallidos`, `bloqueado_hasta`, `contrasena`, `pais`, `cupon`) VALUES
(5, 'kikin', 'kikin', 'al369829@edu.uaa.mx', 0, 'usuario', 0, NULL, 'dc00382c0e659736958006411807bbe0:4a75b1b543ec8fbd983df6b5d816b70024f749210e64a765a507f901402994391178c6745aca73a01c9a7c23bdc3f8dc026f6e94999218ca1ca835d14528b494', 'México', NULL),
(9, 'Miguel de Jesus Zavala Romo', 'Miguel Zavala', 'zaromiguel3305@gmail.com', 0, 'usuario', 0, NULL, '3edd237fd7cc669690464e4d3ae13431:ee32e90cdc4447fc2544eca7f32b58a4c6422f235c4c42b10ed5f023dbd76bac3039e0e25d62e6a033670ead6d6cbd57a292d04666642de4490e5362816a5539', 'México', 'P8KZW5YL89');

--
-- Índices para tablas volcadas
--

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
