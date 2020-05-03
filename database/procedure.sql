USE fbsdb;

-- Show all
DROP PROCEDURE IF EXISTS AuditLog;
DELIMITER //
CREATE PROCEDURE AuditLog()
BEGIN
    SELECT * FROM audit_log;
END
//
DELIMITER ;

-- Show log for user
DROP PROCEDURE IF EXISTS LogUser;
DELIMITER //
CREATE PROCEDURE LogUser(
    IN uId VARCHAR(36),
    IN msg VARCHAR(255)
)
BEGIN
    INSERT INTO audit_log (user_id, message) VALUES (uId, msg);
END
//
DELIMITER ;

-- Create log for user
DROP PROCEDURE IF EXISTS AuditUser;
DELIMITER //
CREATE PROCEDURE AuditUser(
    IN uId VARCHAR(36)
)
BEGIN
    SELECT * FROM audit_log WHERE user_id = uId;
END
//
DELIMITER ;