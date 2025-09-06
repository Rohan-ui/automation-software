USE bldxzmkp_socialmanager;

-- Create password_resets table
CREATE TABLE IF NOT EXISTS password_resets (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    email VARCHAR(191) NOT NULL,
    token VARCHAR(191) NOT NULL UNIQUE,
    expiresAt DATETIME(3) NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

-- Create invites table
CREATE TABLE IF NOT EXISTS invites (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    email VARCHAR(191) NOT NULL,
    token VARCHAR(191) NOT NULL UNIQUE,
    role ENUM('ADMIN', 'MANAGER', 'DESIGNER', 'CLIENT') NOT NULL,
    expiresAt DATETIME(3) NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    invitedBy VARCHAR(191) NOT NULL,
    FOREIGN KEY (invitedBy) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_email ON password_resets(email);
CREATE INDEX idx_invites_token ON invites(token);
CREATE INDEX idx_invites_email ON invites(email);
