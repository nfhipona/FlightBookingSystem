--
-- NOTE: Holds the sample data for staging development
--

USE fbsdb;

--
-- Data for table `role`
--

INSERT INTO `role` (`id`, `code`, `name`) VALUES
(UUID(), 'sup_admin', 'Super Admin'),
(UUID(), 'sys_admin', 'System Admin'),
(UUID(), 'std_user', 'Customer'),
(UUID(), 'gst_user', 'Guest');

--
-- Data for table `resource`
--

INSERT INTO `resource` (`id`, `code`, `name`, `description`) VALUES
(UUID(), 'resource', 'App Resources', 'App resources management, set resource permissions'),
(UUID(), 'maintenance', 'Maintenance settings', 'Server maintenance management'),

(UUID(), 'user_management', 'User Management', 'User account management'),
(UUID(), 'user_account', 'User Account', 'User account management'),
(UUID(), 'name_later', 'Ungroup Resource', '');

--
-- Data for table `permission`
--

INSERT INTO `permission` (`role_id`, `resource_id`, `mode`, `is_disabled`) VALUES
-- sup_admin
('2c41860a-8c3e-11ea-b57f-acde48001122', 'a67a9b84-8c46-11ea-b57f-acde48001122', 'r', 0), -- resource
('2c41860a-8c3e-11ea-b57f-acde48001122', 'a67a9b84-8c46-11ea-b57f-acde48001122', 'w', 0),
('2c41860a-8c3e-11ea-b57f-acde48001122', 'a67a9b84-8c46-11ea-b57f-acde48001122', 'd', 0);