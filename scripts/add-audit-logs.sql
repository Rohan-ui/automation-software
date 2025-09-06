-- Add audit log table to track all system activities
CREATE TABLE IF NOT EXISTS AuditLog (
    id VARCHAR(191) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    userId VARCHAR(191) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entityType VARCHAR(50) NOT NULL,
    entityId VARCHAR(191) NOT NULL,
    details JSON,
    ipAddress VARCHAR(45),
    userAgent TEXT,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    INDEX idx_audit_user (userId),
    INDEX idx_audit_action (action),
    INDEX idx_audit_entity (entityType, entityId),
    INDEX idx_audit_created (createdAt),
    
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- Insert sample audit log entries
INSERT INTO AuditLog (id, userId, action, entityType, entityId, details, ipAddress, createdAt) VALUES
-- User login activities
('audit_001', 'user_admin_001', 'USER_LOGIN', 'USER', 'user_admin_001', '{"loginMethod": "email", "success": true}', '192.168.1.100', '2024-01-15 09:00:00'),
('audit_002', 'user_manager_001', 'USER_LOGIN', 'USER', 'user_manager_001', '{"loginMethod": "email", "success": true}', '192.168.1.101', '2024-01-15 09:15:00'),
('audit_003', 'user_designer_001', 'USER_LOGIN', 'USER', 'user_designer_001', '{"loginMethod": "email", "success": true}', '192.168.1.102', '2024-01-15 09:30:00'),

-- Post creation and workflow activities
('audit_004', 'user_designer_001', 'POST_CREATED', 'POST', 'post_001', '{"title": "New Year Campaign Launch", "type": "PHOTO"}', '192.168.1.102', '2024-01-15 10:00:00'),
('audit_005', 'user_designer_001', 'POST_SUBMITTED', 'POST', 'post_001', '{"previousStatus": "DRAFT", "newStatus": "SUBMITTED"}', '192.168.1.102', '2024-01-15 10:30:00'),
('audit_006', 'user_manager_001', 'POST_APPROVED', 'POST', 'post_001', '{"previousStatus": "SUBMITTED", "newStatus": "APPROVED", "comment": "Looks great!"}', '192.168.1.101', '2024-01-15 11:00:00'),
('audit_007', 'user_manager_001', 'POST_SCHEDULED', 'POST', 'post_001', '{"scheduledAt": "2024-01-20 12:00:00", "platforms": ["INSTAGRAM", "FACEBOOK"]}', '192.168.1.101', '2024-01-15 11:15:00'),

-- Client and project management
('audit_008', 'user_admin_001', 'CLIENT_CREATED', 'CLIENT', 'client_001', '{"name": "TechCorp Solutions", "industry": "Technology"}', '192.168.1.100', '2024-01-15 08:00:00'),
('audit_009', 'user_manager_001', 'PROJECT_CREATED', 'PROJECT', 'project_001', '{"name": "Q1 Marketing Campaign", "clientId": "client_001"}', '192.168.1.101', '2024-01-15 08:30:00'),

-- Comment activities
('audit_010', 'user_manager_001', 'COMMENT_CREATED', 'COMMENT', 'comment_001', '{"postId": "post_001", "content": "Please adjust the color scheme"}', '192.168.1.101', '2024-01-15 14:00:00'),
('audit_011', 'user_designer_001', 'COMMENT_CREATED', 'COMMENT', 'comment_002', '{"postId": "post_001", "content": "Updated as requested"}', '192.168.1.102', '2024-01-15 14:30:00'),

-- Post rejections and revisions
('audit_012', 'user_designer_002', 'POST_CREATED', 'POST', 'post_002', '{"title": "Valentine Day Special", "type": "CAROUSEL"}', '192.168.1.103', '2024-01-16 09:00:00'),
('audit_013', 'user_designer_002', 'POST_SUBMITTED', 'POST', 'post_002', '{"previousStatus": "DRAFT", "newStatus": "SUBMITTED"}', '192.168.1.103', '2024-01-16 09:30:00'),
('audit_014', 'user_manager_001', 'POST_REJECTED', 'POST', 'post_002', '{"previousStatus": "SUBMITTED", "newStatus": "REJECTED", "reason": "Images need higher resolution"}', '192.168.1.101', '2024-01-16 10:00:00'),
('audit_015', 'user_designer_002', 'POST_UPDATED', 'POST', 'post_002', '{"changes": ["Updated images", "Improved resolution"]}', '192.168.1.103', '2024-01-16 11:00:00'),

-- Bulk operations
('audit_016', 'user_manager_001', 'POST_APPROVED', 'POST', 'post_003', '{"bulkOperation": true, "batchId": "batch_001"}', '192.168.1.101', '2024-01-17 15:00:00'),
('audit_017', 'user_manager_001', 'POST_APPROVED', 'POST', 'post_004', '{"bulkOperation": true, "batchId": "batch_001"}', '192.168.1.101', '2024-01-17 15:00:00'),
('audit_018', 'user_manager_001', 'POST_APPROVED', 'POST', 'post_005', '{"bulkOperation": true, "batchId": "batch_001"}', '192.168.1.101', '2024-01-17 15:00:00'),

-- Publishing activities
('audit_019', 'system', 'POST_PUBLISHED', 'POST', 'post_001', '{"platform": "INSTAGRAM", "publishedAt": "2024-01-20 12:00:00", "success": true}', NULL, '2024-01-20 12:00:00'),
('audit_020', 'system', 'POST_PUBLISHED', 'POST', 'post_001', '{"platform": "FACEBOOK", "publishedAt": "2024-01-20 12:01:00", "success": true}', NULL, '2024-01-20 12:01:00');
