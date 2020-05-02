DROP DATABASE IF EXISTS fbsdb;
CREATE DATABASE fbsdb;
USE fbsdb;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
    `id` varchar(36) NOT NULL,
    `name` varchar(255) NOT NULL,
    `code` varchar(255) NOT NULL,
    `description` varchar(255),

    `deleted` tinyint(1) NOT NULL DEFAULT 0,
    `updatedAt` timestamp NOT NULL DEFAULT CURRENt_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT `role_id_pk` PRIMARY KEY (`id`)
);

--
-- Table structure for table `resource`
--

DROP TABLE IF EXISTS `resource`;
CREATE TABLE `resource` (
    `id` varchar(36) NOT NULL,
    `name` varchar(150) NOT NULL COMMENT 'resource access name',
    `code` varchar(255) NOT NULL COMMENT 'resource access unique code',
    `description` varchar(255) NOT NULL,

    `deleted` tinyint(1) NOT NULL DEFAULT 0,
    `updatedAt` timestamp NOT NULL DEFAULT CURRENt_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT `resource_id_pk` PRIMARY KEY (`id`)
);

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
CREATE TABLE `permission` (
    `role_id` varchar(36) NOT NULL,
    `resource_id` varchar(36) NOT NULL,
    `mode` varchar(5) NOT NULL COMMENT '+r, +w, +d',

    `is_disabled` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'No entry means access disabled',

    `updatedAt` timestamp NOT NULL DEFAULT CURRENt_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT `permission_mode_u_key` UNIQUE INDEX (`role_id`, `resource_id`, `mode`),
    CONSTRAINT `permission_role_id_fk` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE,
    CONSTRAINT `permission_resource_id_fk` FOREIGN KEY (`resource_id`) REFERENCES `resource` (`id`) ON DELETE CASCADE
);

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
    `id` varchar(36) NOT NULL,
    `role_id` varchar(36) NOT NULL,
    `username` varchar(30) NOT NULL,
    `password` varchar(255) NOT NULL,
    `first_name` varchar(50) NOT NULL,
    `last_name` varchar(50) NOT NULL,

    `deleted` tinyint(1) NOT NULL DEFAULT 0,
    `updatedAt` timestamp NOT NULL DEFAULT CURRENt_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT `user_id_pk` PRIMARY KEY (`id`),
    CONSTRAINT `user_username_u_key` UNIQUE (`username`),
    CONSTRAINT `user_role_id_fk` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE
);

DROP TABLE IF EXISTS `airline`;
CREATE TABLE `airline` (
    `id` varchar(36) NOT NULL,
    `name` varchar(30) NOT NULL,

    `deleted` tinyint(1) NOT NULL DEFAULT 0,
    `updatedAt` timestamp NOT NULL DEFAULT CURRENt_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT `airline_id_pk` PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `package`;
CREATE TABLE `package` (
    `id` varchar(36) NOT NULL,
    `airline_id` varchar(36) NOT NULL,
    `name` varchar(30) NOT NULL,
    `rate` decimal(15,4) NOT NULL,
    `from_address` varchar(255) NOT NULL,
    `to_address` varchar(255) NOT NULL,

    `deleted` tinyint(1) NOT NULL DEFAULT 0,
    `updatedAt` timestamp NOT NULL DEFAULT CURRENt_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT `package_id_pk` PRIMARY KEY (`id`),
    CONSTRAINT `package_airline_id_fk` FOREIGN KEY (`airline_id`) REFERENCES `airline` (`id`) ON DELETE CASCADE
);

DROP TABLE IF EXISTS `order`;
CREATE TABLE `order` (
    `id` varchar(36) NOT NULL,
    `package_id` varchar(36) NOT NULL,
    `user_id` varchar(36) NOT NULL,

    `deleted` tinyint(1) NOT NULL DEFAULT 0,
    `updatedAt` timestamp NOT NULL DEFAULT CURRENt_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT `order_id_pk` PRIMARY KEY (`id`),
    CONSTRAINT `order_airline_id_fk` FOREIGN KEY (`package_id`) REFERENCES `package` (`id`) ON DELETE CASCADE,
    CONSTRAINT `order_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
);

DROP TABLE IF EXISTS `cart`;
CREATE TABLE `cart` (
    `user_id` varchar(36) NOT NULL,
    `package_id` varchar(36) NOT NULL,
    `item_count` Int(5) NOT NULL DEFAULT 0,

    CONSTRAINT `cart_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
    CONSTRAINT `cart_package_id_fk` FOREIGN KEY (`package_id`) REFERENCES `package` (`id`) ON DELETE CASCADE
);