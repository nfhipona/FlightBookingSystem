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