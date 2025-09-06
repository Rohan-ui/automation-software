-- Insert demo users
INSERT INTO users (id, email, name, role, createdAt, updatedAt) VALUES
('admin-1', 'admin@example.com', 'Admin User', 'ADMIN', NOW(), NOW()),
('manager-1', 'manager@example.com', 'Project Manager', 'MANAGER', NOW(), NOW()),
('designer-1', 'designer@example.com', 'Creative Designer', 'DESIGNER', NOW(), NOW()),
('client-1', 'client@example.com', 'Client User', 'CLIENT', NOW(), NOW());

-- Insert demo clients
INSERT INTO clients (id, name, email, company, createdAt, updatedAt) VALUES
('client-comp-1', 'Acme Corp', 'contact@acme.com', 'Acme Corporation', NOW(), NOW()),
('client-comp-2', 'Tech Startup', 'hello@techstartup.com', 'Tech Startup Inc', NOW(), NOW());

-- Insert demo projects
INSERT INTO projects (id, name, description, startDate, clientId, managerId, createdAt, updatedAt) VALUES
('project-1', 'Acme Social Campaign', 'Q1 social media campaign for Acme Corp', '2024-01-01', 'client-comp-1', 'manager-1', NOW(), NOW()),
('project-2', 'Tech Startup Launch', 'Product launch social media strategy', '2024-02-01', 'client-comp-2', 'manager-1', NOW(), NOW());
