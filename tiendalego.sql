-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 06-12-2025 a las 06:09:39
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
  `imagen` varchar(500) DEFAULT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `disponibilidad` int(11) NOT NULL DEFAULT 0,
  `categoria` enum('Technic','Ideas','Marcas') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `imagen`, `nombre`, `descripcion`, `precio`, `disponibilidad`, `categoria`) VALUES
(1, 'https://juguetron.vtexassets.com/arquivos/ids/192372-800-auto?v=638746424903570000&width=800&height=auto&aspect=true', 'Ferrari F1', 'Lego de auto de carreras color rojo de la escudería Ferrari pertenece a la fórmula 1', 1300.00, 4, 'Marcas'),
(2, 'https://th.bing.com/th/id/OIP.qA9jPKwSwhZlh3aROApQ0gHaFj?w=271&h=203&c=7&r=0&o=7&pid=1.7', 'Chevrolet Corvette', 'Auto deportivo de lujo amarillo motor V8', 2229.00, 3, 'Technic'),
(3, 'https://th.bing.com/th/id/OIP.BpXhxdThkvYk1BAVCZoa6wHaFj?w=252&h=189&c=7&r=0&o=7&pid=1.7', 'Autotransportador Rojo', 'Autotransportador de lego, ideal para guardar y trasladar otro vehículos', 5999.00, 2, 'Technic'),
(4, 'https://th.bing.com/th/id/OIP.Nf9-7zs4jYnMNiH8-Fo41AHaE8?w=206&h=180&c=7&r=0&o=7&pid=1.7', 'Helicóptero de rescate', 'Lego helicóptero de emergencia y rescate', 3429.00, 5, 'Technic'),
(5, 'https://tse4.mm.bing.net/th/id/OIP.JfkQfkStD_tWZDRYtvMnuAHaEK?pid=ImgDet&w=189&h=106&c=7&o=7', 'Lego Land Rover Defender', 'Figura de lego 4X4 todo terreno poderoso e ideal para terrenos difíciles y extremos', 6969.00, 4, 'Technic'),
(6, 'https://tse4.mm.bing.net/th/id/OIP.2RyraYVhpvE6R2gqBAmq3wHaFW?pid=ImgDet&w=189&h=136&c=7&o=7', 'Camion de remolque', 'Camion  de remolque color naranja ,para llevar otros carros', 7890.00, 5, 'Technic'),
(7, 'https://tse3.mm.bing.net/th/id/OIP.0A7scJjxJzKbLz9EjXWRuQHaHa?pid=ImgDet&w=189&h=189&c=7&o=7', 'Lego Motocycle', 'Motocicleta azul de carga para llevar y distribuir paquetes', 1089.00, 7, 'Technic'),
(8, 'https://th.bing.com/th/id/OIP.6QIrMc39O_PwVuMXkgPzgwHaEO?w=271&h=180&c=7&r=0&o=7&pid=1.7', 'Barco', 'Kit de Barco de tripulación poderoso azul marino + mini helicóptero + pequeña grúa amarilla', 11200.00, 3, 'Technic'),
(9, 'https://tse1.explicit.bing.net/th/id/OIP.wPoVHxzRN8NUxbkoi8naiwAAAA?rs=1&pid=ImgDetMain&o=7', 'Bloques de construcción', 'Caja con 1500 piezas de bloques para explotar la creatividad', 999.00, 10, 'Ideas'),
(10, 'https://th.bing.com/th/id/OIP.aHxFHSYydAQFEpFOZ2ZIhQHaFV?w=233&h=180&c=7&r=0&o=7&pid=1.7', 'Caja con Bloques de construcción', 'La caja incluye diferentes formas de piezas para construir lo que puedas imaginar.', 1299.00, 15, 'Ideas'),
(11, 'https://th.bing.com/th/id/OIP.1aFmvUHlK12R4CltAF7_fQHaHe?w=166&h=180&c=7&r=0&o=7&pid=1.7', 'Mini Caja con Bloques de construcción', 'La caja incluye 800 piezas para armar', 799.00, 15, 'Ideas'),
(12, 'https://th.bing.com/th/id/OIP.1aFmvUHlK12R4CltAF7_fQHaHe?w=166&h=180&c=7&r=0&o=7&pid=1.7', 'Bloques para peques', 'Versión de bloques apta para niños pequeños por el gran tamaño de las piezas', 569.00, 12, 'Ideas'),
(13, 'https://th.bing.com/th/id/OIP.Pq9KOWFffamJJoBSX3V3QwHaFV?w=264&h=191&c=7&r=0&o=7&pid=1.7', 'Bloques sabana', 'Contenido de piezas especial para crear los animales de la sabana', 439.00, 9, 'Ideas'),
(14, 'https://th.bing.com/th/id/OIP.Pq9KOWFffamJJoBSX3V3QwHaFV?w=264&h=191&c=7&r=0&o=7&pid=1.7', 'Bloques de construcción', 'Ideal para niños pequeños con creatividad de construir cosas', 569.00, 16, 'Ideas'),
(15, 'https://th.bing.com/th/id/OIP.Pq9KOWFffamJJoBSX3V3QwHaFV?w=264&h=191&c=7&r=0&o=7&pid=1.7', 'Caja de bloques rosa', 'Para aquellas niñas que quieren distinguir sus creaciones', 669.00, 6, 'Ideas'),
(16, 'https://th.bing.com/th/id/OIP.Pq9KOWFffamJJoBSX3V3QwHaFV?w=264&h=191&c=7&r=0&o=7&pid=1.7', 'Caja de juguete de bloques', 'Caja con 480 piezas de bloques con 8 colores diferentes', 469.00, 6, 'Ideas'),
(17, 'https://tse4.mm.bing.net/th/id/OIP.wvKmFBFITQfRzouKRkNiUQHaEo?rs=1&pid=ImgDetMain&o=7', 'Barco One Piece', 'Set del barco de one Piece', 13789.00, 3, 'Marcas'),
(18, 'https://tse4.mm.bing.net/th/id/OIP.wvKmFBFITQfRzouKRkNiUQHaEo?rs=1&pid=ImgDetMain&o=7', 'Castillo de Hogwarts Harry Potter', 'Castillo de Hogwart de la película de Harry Potter incluye 3 personajes de la pelicula', 11599.00, 2, 'Marcas'),
(19, 'https://tse1.mm.bing.net/th/id/OIP.BnkbtLRIz5q3eESaJaPa2QHaKp?rs=1&pid=ImgDetMain&o=7', 'Ninjago', 'Set de Ciudad de Ninjago', 8889.00, 3, 'Marcas');

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
  `cupon` varchar(50) DEFAULT NULL,
  `codigo_recuperacion` varchar(10) DEFAULT NULL,
  `codigo_expiracion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `nombrecuenta`, `correo`, `productoscomprados`, `rol`, `intentos_fallidos`, `bloqueado_hasta`, `contrasena`, `pais`, `cupon`, `codigo_recuperacion`, `codigo_expiracion`) VALUES
(5, 'kikin', 'kikin', 'al369829@edu.uaa.mx', 0, 'usuario', 0, NULL, '914564be357a26c9773e83f85dbd5c7d:081d063a511d4b778c5dffef898aedd3fc4ff033a2e7662bc7504f9075c2874e94309fa547ca71f1cd3d0c1fe228815c4a42ecb0d9689753f78c17d1b53cd6af', 'México', NULL, NULL, NULL),
(6, 'admin', 'admin', 'juanmanuelfriascortes@gmail.com', 0, 'admin', 0, NULL, '09b8dbdfb9b7b547a77cb3ff45dae7dd:f2ae76ad9a73886789d1f79821d0df006eb94c7d265f183fe3d665d141039633248f94ce32a48ff0da9a3a7af705ed3d47dc3f294a1d8c9921c12fcc9fc32a30', 'México', NULL, NULL, NULL),
(7, 'Sara Alexandra', 'Gansito12', 'saraalexandrac@hotmail.com', 0, 'usuario', 0, NULL, '179f63174dc7b618d6ebd6b453c9a9dc:5a0305034aa985b82c93cde77bcfc87a308f0ee065d2eca82030d2ae150afae0fc69029a21e079eb4afe43214b9734f1d85059a8df3d35c1b3cbe32ad5de9b26', 'México', 'GC3LGV9G6V', NULL, NULL),
(8, 'Miguel de Jesus Zavala Romo', 'Miguel Zavala', 'zaromiguel3305@gmail.com', 0, 'usuario', 0, NULL, '104f3a5cfb5970a340d2690ec8bbd534:32ebcbf8c9eac6640a24b4a285042763a39d1816f7defdae718710da77ee4c25f9e8d41cb9a732789114cccae9d4fc4734079bc7fecdcfdddbbedcaf27718aaf', 'España', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `fecha_venta` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id`, `usuario_id`, `producto_id`, `cantidad`, `precio_unitario`, `subtotal`, `fecha_venta`) VALUES
(1, 6, 2, 2, 2229.00, 4458.00, '2024-12-01 16:30:00'),
(2, 6, 3, 1, 5999.00, 5999.00, '2024-12-02 20:15:00'),
(3, 6, 4, 3, 3429.00, 10287.00, '2024-12-03 15:45:00'),
(4, 6, 9, 5, 999.00, 4995.00, '2024-12-01 17:20:00'),
(5, 6, 10, 3, 1299.00, 3897.00, '2024-12-02 22:30:00'),
(6, 6, 17, 1, 13789.00, 13789.00, '2024-12-03 21:00:00'),
(7, 6, 18, 2, 11599.00, 23198.00, '2024-12-04 16:00:00'),
(8, 8, 14, 1, 569.00, 569.00, '2025-12-06 04:57:42'),
(9, 8, 16, 1, 469.00, 469.00, '2025-12-06 04:57:42'),
(10, 8, 15, 1, 669.00, 669.00, '2025-12-06 04:57:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `fecha_agregado` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `wishlist`
--

INSERT INTO `wishlist` (`id`, `usuario_id`, `producto_id`, `fecha_agregado`) VALUES
(1, 6, 17, '2025-12-04 23:20:04');

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
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_producto` (`producto_id`),
  ADD KEY `idx_fecha` (`fecha_venta`);

--
-- Indices de la tabla `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
