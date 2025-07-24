-- Base de datos: `sistema_ventas`
CREATE DATABASE IF NOT EXISTS `sistema_ventas`;
USE `sistema_ventas`;

-- Estructura de tabla para `categorias`
CREATE TABLE `categorias` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text,
  PRIMARY KEY (`id_categoria`)
);

-- Estructura de tabla para `usuarios`
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` text,
  `fecha_registro` date NOT NULL,
  `tipo` enum('admin','cliente','empleado') NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
);

-- Estructura de tabla para `productos`
CREATE TABLE `productos` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `precio` decimal(10,2) NOT NULL,
  `stock` int NOT NULL,
  `id_categoria` int DEFAULT NULL,
  `fecha_creacion` date NOT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `id_categoria` (`id_categoria`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`)
);

-- Estructura de tabla para `facturas`
CREATE TABLE `facturas` (
  `id_factura` int NOT NULL AUTO_INCREMENT,
  `codigo_factura` varchar(20) NOT NULL,
  `id_usuario` int NOT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total` decimal(10,2) NOT NULL,
  `impuesto` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','pagada','cancelada') NOT NULL,
  PRIMARY KEY (`id_factura`),
  UNIQUE KEY `codigo_factura` (`codigo_factura`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
);

-- Estructura de tabla para `detalle_facturas`
CREATE TABLE `detalle_facturas` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_factura` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_factura` (`id_factura`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `detalle_facturas_ibfk_1` FOREIGN KEY (`id_factura`) REFERENCES `facturas` (`id_factura`),
  CONSTRAINT `detalle_facturas_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
);

-- Estructura de tabla para `auditoria_usuarios`
CREATE TABLE `auditoria_usuarios` (
  `id_auditoria` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int,
  `campo_modificado` varchar(50),
  `valor_antiguo` text,
  `valor_nuevo` text,
  `fecha_modificacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_auditoria`)
);

-- Estructura de tabla para `alertas_stock`
CREATE TABLE `alertas_stock` (
  `id_alerta` int NOT NULL AUTO_INCREMENT,
  `id_producto` int,
  `stock_actual` int,
  `mensaje` varchar(255),
  `fecha_alerta` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_alerta`)
);

-- Datos para la tabla `categorias`
INSERT INTO `categorias` (`nombre`, `descripcion`) VALUES
('Electrónicos', 'Dispositivos electrónicos y gadgets'),
('Ropa', 'Prendas de vestir para hombres, mujeres y niños'),
('Hogar', 'Artículos para el hogar y decoración'),
('Alimentos', 'Productos alimenticios y bebidas'),
('Deportes', 'Equipamiento y accesorios deportivos');

-- Datos para la tabla `usuarios`
INSERT INTO `usuarios` (`nombre`, `email`, `telefono`, `direccion`, `fecha_registro`, `tipo`) VALUES
('Juan Pérez', 'juan.perez@email.com', '555-1234', 'Calle Falsa 123', '2023-01-15', 'admin'),
('María García', 'maria.garcia@email.com', '555-5678', 'Avenida Siempreviva 456', '2023-02-20', 'empleado'),
('Carlos López', 'carlos.lopez@email.com', '555-9012', 'Boulevard Los Sueños 789', '2023-03-10', 'cliente');

-- Datos para la tabla `productos`
INSERT INTO `productos` (`nombre`, `descripcion`, `precio`, `stock`, `id_categoria`, `fecha_creacion`) VALUES
('Smartphone X', 'Teléfono inteligente de última generación', 899.99, 50, 1, '2023-01-10'),
('Laptop Pro', 'Laptop de alto rendimiento para profesionales', 1299.99, 30, 1, '2023-01-15'),
('Camiseta Básica', 'Camiseta de algodón 100% unisex', 19.99, 15, 2, '2023-02-01');

-- FUNCIONES ALMACENADAS

-- Función para generar códigos únicos para facturas
DELIMITER $$
CREATE FUNCTION `fn_generate_invoice_code`() RETURNS varchar(20) CHARSET utf8mb4
BEGIN
    DECLARE new_code VARCHAR(20);
    SET new_code = CONCAT('INV-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 100000), 5, '0'));
    RETURN new_code;
END$$
DELIMITER ;

-- Función para validar si un usuario es administrador
DELIMITER $$
CREATE FUNCTION `fn_is_admin`(user_id INT) RETURNS tinyint(1)
BEGIN
    DECLARE user_type VARCHAR(10);
    SELECT `tipo` INTO user_type FROM `usuarios` WHERE `id_usuario` = user_id AND `estado` = 'activo';
    IF user_type = 'admin' THEN
        RETURN 1;
    ELSE
        RETURN 0;
    END IF;
END$$
DELIMITER ;

-- Función para calcular el IVA (16% como ejemplo)
DELIMITER $$
CREATE FUNCTION `fn_calculate_iva`(amount DECIMAL(10,2)) RETURNS decimal(10,2)
BEGIN
    DECLARE iva_rate DECIMAL(4,2);
    SET iva_rate = 0.16;
    RETURN amount * iva_rate;
END$$
DELIMITER ;


-- PROCEDIMIENTOS ALMACENADOS

-- CRUD de Usuarios
DELIMITER $$
CREATE PROCEDURE `sp_create_user`(IN p_nombre VARCHAR(100), IN p_email VARCHAR(100), IN p_telefono VARCHAR(20), IN p_direccion TEXT, IN p_tipo ENUM('admin','cliente','empleado'))
BEGIN
    INSERT INTO `usuarios` (nombre, email, telefono, direccion, fecha_registro, tipo)
    VALUES (p_nombre, p_email, p_telefono, p_direccion, CURDATE(), p_tipo);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_read_users`()
BEGIN
    SELECT id_usuario, nombre, email, telefono, direccion, fecha_registro, tipo, estado FROM `usuarios`;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_update_user`(IN p_id_usuario INT, IN p_nombre VARCHAR(100), IN p_email VARCHAR(100), IN p_telefono VARCHAR(20), IN p_direccion TEXT, IN p_tipo ENUM('admin','cliente','empleado'))
BEGIN
    UPDATE `usuarios`
    SET nombre = p_nombre, email = p_email, telefono = p_telefono, direccion = p_direccion, tipo = p_tipo
    WHERE id_usuario = p_id_usuario;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_delete_user`(IN p_id_usuario INT)
BEGIN
    UPDATE `usuarios` SET estado = 'inactivo' WHERE id_usuario = p_id_usuario;
END$$
DELIMITER ;

-- Gestión de Venta
DELIMITER $$
CREATE PROCEDURE `sp_create_invoice`(IN p_id_usuario INT, OUT p_id_factura INT)
BEGIN
    DECLARE total_amount DECIMAL(10,2) DEFAULT 0;
    DECLARE tax_amount DECIMAL(10,2) DEFAULT 0;
    DECLARE invoice_code VARCHAR(20);
    
    SET invoice_code = fn_generate_invoice_code();
    
    INSERT INTO `facturas` (codigo_factura, id_usuario, total, impuesto, estado)
    VALUES (invoice_code, p_id_usuario, total_amount, tax_amount, 'pendiente');
    
    SET p_id_factura = LAST_INSERT_ID();
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_add_product_to_invoice`(IN p_id_factura INT, IN p_id_producto INT, IN p_cantidad INT)
BEGIN
    DECLARE product_price DECIMAL(10,2);
    DECLARE subtotal_amount DECIMAL(10,2);

    SELECT precio INTO product_price FROM productos WHERE id_producto = p_id_producto;
    SET subtotal_amount = product_price * p_cantidad;

    INSERT INTO `detalle_facturas` (id_factura, id_producto, cantidad, precio_unitario, subtotal)
    VALUES (p_id_factura, p_id_producto, p_cantidad, product_price, subtotal_amount);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_remove_product_from_invoice`(IN p_id_detalle INT)
BEGIN
    DELETE FROM `detalle_facturas` WHERE id_detalle = p_id_detalle;
END$$
DELIMITER ;

-- Procedimiento para leer todas las facturas con sus detalles
DELIMITER $$
CREATE PROCEDURE `sp_read_invoices_with_details`()
BEGIN
    SELECT
        f.id_factura,
        f.codigo_factura,
        f.fecha,
        f.total,
        f.impuesto,
        f.estado AS estado_factura,
        u.nombre AS nombre_cliente,
        u.email AS email_cliente,
        df.id_detalle,
        p.nombre AS nombre_producto,
        df.cantidad,
        df.precio_unitario,
        df.subtotal
    FROM
        facturas f
    JOIN
        usuarios u ON f.id_usuario = u.id_usuario
    LEFT JOIN
        detalle_facturas df ON f.id_factura = df.id_factura
    LEFT JOIN
        productos p ON df.id_producto = p.id_producto
    ORDER BY
        f.fecha DESC, f.id_factura, df.id_detalle;
END$$
DELIMITER ;


-- TRIGGERS

-- Trigger para auditoría de usuarios
DELIMITER $$
CREATE TRIGGER `trg_after_user_update`
AFTER UPDATE ON `usuarios`
FOR EACH ROW
BEGIN
    IF OLD.nombre <> NEW.nombre THEN
        INSERT INTO auditoria_usuarios (id_usuario, campo_modificado, valor_antiguo, valor_nuevo)
        VALUES (OLD.id_usuario, 'nombre', OLD.nombre, NEW.nombre);
    END IF;
    IF OLD.email <> NEW.email THEN
        INSERT INTO auditoria_usuarios (id_usuario, campo_modificado, valor_antiguo, valor_nuevo)
        VALUES (OLD.id_usuario, 'email', OLD.email, NEW.email);
    END IF;
END$$
DELIMITER ;

-- Trigger para actualizar stock y calcular totales de factura
DELIMITER $$
CREATE TRIGGER `trg_after_sale`
AFTER INSERT ON `detalle_facturas`
FOR EACH ROW
BEGIN
    -- Actualizar stock
    UPDATE productos SET stock = stock - NEW.cantidad WHERE id_producto = NEW.id_producto;
    
    -- Actualizar total de la factura
    UPDATE facturas 
    SET total = (SELECT SUM(subtotal) FROM detalle_facturas WHERE id_factura = NEW.id_factura),
        impuesto = fn_calculate_iva((SELECT SUM(subtotal) FROM detalle_facturas WHERE id_factura = NEW.id_factura))
    WHERE id_factura = NEW.id_factura;
END$$
DELIMITER ;

-- Trigger para revertir stock si se elimina un detalle
DELIMITER $$
CREATE TRIGGER `trg_after_sale_delete`
AFTER DELETE ON `detalle_facturas`
FOR EACH ROW
BEGIN
    -- Revertir stock
    UPDATE productos SET stock = stock + OLD.cantidad WHERE id_producto = OLD.id_producto;

    -- Actualizar total de la factura
    UPDATE facturas 
    SET total = (SELECT SUM(subtotal) FROM detalle_facturas WHERE id_factura = OLD.id_factura),
        impuesto = fn_calculate_iva((SELECT SUM(subtotal) FROM detalle_facturas WHERE id_factura = OLD.id_factura))
    WHERE id_factura = OLD.id_factura;
END$$
DELIMITER ;

-- Trigger para alertas de stock bajo
DELIMITER $$
CREATE TRIGGER `trg_check_low_stock`
AFTER UPDATE ON `productos`
FOR EACH ROW
BEGIN
    IF NEW.stock < 20 THEN
        INSERT INTO alertas_stock (id_producto, stock_actual, mensaje)
        VALUES (NEW.id_producto, NEW.stock, 'El stock del producto es bajo.');
    END IF;
END$$
DELIMITER ;