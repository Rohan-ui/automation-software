-- Create utilities table for dynamic platform and post type management
CREATE TABLE IF NOT EXISTS utilities (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    values JSON NOT NULL,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- Insert default platform utilities
INSERT INTO utilities (id, name, type, values) VALUES 
('util_platforms_1', 'Social Media Platforms', 'PLATFORM', JSON_ARRAY('Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'Twitter', 'TikTok'));

-- Insert default post type utilities  
INSERT INTO utilities (id, name, type, values) VALUES 
('util_post_types_1', 'Content Types', 'POST_TYPE', JSON_ARRAY('Photo Post', 'Story', 'Reel', 'Carousel', 'Video', 'Live Stream', 'IGTV', 'Other'));

-- Insert additional utility categories
INSERT INTO utilities (id, name, type, values) VALUES 
('util_industries_1', 'Industry Categories', 'INDUSTRY', JSON_ARRAY('Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Food & Beverage', 'Travel', 'Fashion', 'Real Estate', 'Entertainment'));

INSERT INTO utilities (id, name, type, values) VALUES 
('util_content_themes_1', 'Content Themes', 'THEME', JSON_ARRAY('Product Showcase', 'Behind the Scenes', 'User Generated Content', 'Educational', 'Promotional', 'Seasonal', 'Trending', 'Community', 'Brand Story'));
