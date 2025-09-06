-- Fixed SQL script with proper database selection and foreign key constraints
USE bldxzmkp_socialmanager;

-- Create AuditLog table with proper foreign key constraints
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    action ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'SCHEDULE', 'PUBLISH') NOT NULL,
    entityType VARCHAR(191) NOT NULL,
    entityId VARCHAR(191),
    oldValues TEXT,
    newValues TEXT,
    ipAddress VARCHAR(191),
    userAgent TEXT,
    userId VARCHAR(191) NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    CONSTRAINT FK_audit_logs_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_audit_logs_userId (userId),
    INDEX idx_audit_logs_entityType (entityType),
    INDEX idx_audit_logs_createdAt (createdAt)
);

-- Insert some sample audit log entries
INSERT INTO audit_logs (id, action, entityType, entityId, userId, createdAt) VALUES
('audit_001', 'LOGIN', 'User', 'user_admin_001', 'user_admin_001', NOW()),
('audit_002', 'CREATE', 'Post', 'post_001', 'user_designer_001', NOW()),
('audit_003', 'APPROVE', 'Post', 'post_001', 'user_manager_001', NOW()),
('audit_004', 'SCHEDULE', 'Post', 'post_001', 'user_manager_001', NOW());
