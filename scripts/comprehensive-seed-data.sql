-- Creating comprehensive seed data for all tables

-- Clear existing data (in reverse order of dependencies)
DELETE FROM notifications;
DELETE FROM comments;
DELETE FROM assets;
DELETE FROM post_platforms;
DELETE FROM posts;
DELETE FROM projects;
DELETE FROM clients;
DELETE FROM users;

-- Insert Users with different roles
INSERT INTO users (id, email, name, role, avatar, createdAt, updatedAt) VALUES
-- Admins
('admin1', 'admin@agency.com', 'Sarah Johnson', 'ADMIN', '/avatars/sarah.jpg', NOW(), NOW()),
('admin2', 'john.admin@agency.com', 'John Smith', 'ADMIN', '/avatars/john.jpg', NOW(), NOW()),

-- Managers/Team Leads
('manager1', 'manager1@agency.com', 'Emily Davis', 'MANAGER', '/avatars/emily.jpg', NOW(), NOW()),
('manager2', 'manager2@agency.com', 'Michael Brown', 'MANAGER', '/avatars/michael.jpg', NOW(), NOW()),
('manager3', 'lisa.manager@agency.com', 'Lisa Wilson', 'MANAGER', '/avatars/lisa.jpg', NOW(), NOW()),

-- Designers
('designer1', 'designer1@agency.com', 'Alex Rodriguez', 'DESIGNER', '/avatars/alex.jpg', NOW(), NOW()),
('designer2', 'designer2@agency.com', 'Maya Patel', 'DESIGNER', '/avatars/maya.jpg', NOW(), NOW()),
('designer3', 'designer3@agency.com', 'Chris Lee', 'DESIGNER', '/avatars/chris.jpg', NOW(), NOW()),
('designer4', 'designer4@agency.com', 'Jordan Taylor', 'DESIGNER', '/avatars/jordan.jpg', NOW(), NOW()),
('designer5', 'designer5@agency.com', 'Sam Chen', 'DESIGNER', '/avatars/sam.jpg', NOW(), NOW()),

-- Clients
('client1', 'contact@techstartup.com', 'David Wilson', 'CLIENT', '/avatars/david.jpg', NOW(), NOW()),
('client2', 'marketing@fashionbrand.com', 'Jessica Martinez', 'CLIENT', '/avatars/jessica.jpg', NOW(), NOW()),
('client3', 'owner@localcafe.com', 'Robert Garcia', 'CLIENT', '/avatars/robert.jpg', NOW(), NOW()),
('client4', 'ceo@fitnessapp.com', 'Amanda Thompson', 'CLIENT', '/avatars/amanda.jpg', NOW(), NOW()),
('client5', 'founder@ecostore.com', 'Kevin Park', 'CLIENT', '/avatars/kevin.jpg', NOW(), NOW());

-- Insert Clients
INSERT INTO clients (id, name, email, phone, company, avatar, createdAt, updatedAt) VALUES
('client_tech', 'TechStartup Inc', 'contact@techstartup.com', '+1-555-0101', 'TechStartup Inc', '/logos/techstartup.png', NOW(), NOW()),
('client_fashion', 'Fashion Forward', 'marketing@fashionbrand.com', '+1-555-0102', 'Fashion Forward LLC', '/logos/fashionforward.png', NOW(), NOW()),
('client_cafe', 'Local Cafe', 'owner@localcafe.com', '+1-555-0103', 'Local Cafe & Bistro', '/logos/localcafe.png', NOW(), NOW()),
('client_fitness', 'FitLife App', 'ceo@fitnessapp.com', '+1-555-0104', 'FitLife Technologies', '/logos/fitlife.png', NOW(), NOW()),
('client_eco', 'EcoStore', 'founder@ecostore.com', '+1-555-0105', 'EcoStore Sustainable Goods', '/logos/ecostore.png', NOW(), NOW()),
('client_restaurant', 'Bella Vista Restaurant', 'info@bellavista.com', '+1-555-0106', 'Bella Vista Fine Dining', '/logos/bellavista.png', NOW(), NOW()),
('client_beauty', 'Glow Beauty', 'hello@glowbeauty.com', '+1-555-0107', 'Glow Beauty Products', '/logos/glowbeauty.png', NOW(), NOW()),
('client_travel', 'Wanderlust Travel', 'bookings@wanderlust.com', '+1-555-0108', 'Wanderlust Travel Agency', '/logos/wanderlust.png', NOW(), NOW());

-- Insert Projects
INSERT INTO projects (id, name, description, startDate, endDate, isActive, clientId, managerId, createdAt, updatedAt) VALUES
('proj_tech_launch', 'App Launch Campaign', 'Social media campaign for new mobile app launch', '2024-01-15', '2024-03-15', true, 'client_tech', 'manager1', NOW(), NOW()),
('proj_fashion_spring', 'Spring Collection 2024', 'Promote new spring fashion collection across social platforms', '2024-02-01', '2024-04-30', true, 'client_fashion', 'manager2', NOW(), NOW()),
('proj_cafe_grand', 'Grand Opening Campaign', 'Social media buzz for cafe grand opening', '2024-01-01', '2024-02-28', false, 'client_cafe', 'manager1', NOW(), NOW()),
('proj_fitness_challenge', '30-Day Fitness Challenge', 'Monthly fitness challenge content series', '2024-03-01', '2024-03-31', true, 'client_fitness', 'manager3', NOW(), NOW()),
('proj_eco_awareness', 'Sustainability Awareness', 'Educational content about sustainable living', '2024-01-10', NULL, true, 'client_eco', 'manager2', NOW(), NOW()),
('proj_restaurant_menu', 'New Menu Launch', 'Showcase new seasonal menu items', '2024-02-15', '2024-04-15', true, 'client_restaurant', 'manager1', NOW(), NOW()),
('proj_beauty_tutorial', 'Beauty Tutorial Series', 'Weekly makeup and skincare tutorials', '2024-01-20', NULL, true, 'client_beauty', 'manager3', NOW(), NOW()),
('proj_travel_summer', 'Summer Destinations', 'Promote summer travel packages', '2024-03-01', '2024-06-30', true, 'client_travel', 'manager2', NOW(), NOW());

-- Insert Posts with various types and statuses
INSERT INTO posts (id, title, caption, type, status, scheduledAt, postedAt, projectId, createdById, assignedToId, createdAt, updatedAt) VALUES
-- TechStartup Posts
('post_tech_1', 'App Launch Teaser', 'Get ready for something amazing! Our new app is launching soon. #TechStartup #AppLaunch #Innovation', 'PHOTO', 'POSTED', '2024-01-20 10:00:00', '2024-01-20 10:00:00', 'proj_tech_launch', 'designer1', 'designer1', NOW(), NOW()),
('post_tech_2', 'Feature Showcase Reel', 'Check out the amazing features of our new app! Swipe to see what makes us different. #Features #TechLife', 'REEL', 'SCHEDULED', '2024-01-25 14:00:00', NULL, 'proj_tech_launch', 'designer2', 'designer1', NOW(), NOW()),
('post_tech_3', 'Behind the Scenes Story', 'A peek behind the curtain of our development process', 'STORY', 'APPROVED', NULL, NULL, 'proj_tech_launch', 'designer1', 'designer2', NOW(), NOW()),

-- Fashion Posts
('post_fashion_1', 'Spring Collection Preview', 'Spring is in the air! ✨ Check out our latest collection featuring vibrant colors and sustainable fabrics. #SpringFashion #Sustainable', 'CAROUSEL', 'POSTED', '2024-02-05 12:00:00', '2024-02-05 12:00:00', 'proj_fashion_spring', 'designer3', 'designer3', NOW(), NOW()),
('post_fashion_2', 'Style Tips Video', 'How to style our new spring pieces for any occasion', 'REEL', 'SUBMITTED', NULL, NULL, 'proj_fashion_spring', 'designer4', 'designer3', NOW(), NOW()),
('post_fashion_3', 'Model Photoshoot', 'Professional photoshoot showcasing spring collection', 'PHOTO', 'DRAFT', NULL, NULL, 'proj_fashion_spring', 'designer3', NULL, NOW(), NOW()),

-- Cafe Posts
('post_cafe_1', 'Grand Opening Announcement', 'We are officially open! Come join us for the best coffee in town ☕ #GrandOpening #LocalCafe #CoffeeLovers', 'PHOTO', 'POSTED', '2024-01-15 08:00:00', '2024-01-15 08:00:00', 'proj_cafe_grand', 'designer2', 'designer2', NOW(), NOW()),
('post_cafe_2', 'Barista Skills Reel', 'Watch our talented baristas create coffee art', 'REEL', 'POSTED', '2024-01-18 16:00:00', '2024-01-18 16:00:00', 'proj_cafe_grand', 'designer1', 'designer2', NOW(), NOW()),

-- Fitness Posts
('post_fitness_1', '30-Day Challenge Intro', 'Ready to transform your life? Join our 30-day fitness challenge! 💪 #FitnessChallenge #Transformation #HealthyLife', 'REEL', 'SCHEDULED', '2024-03-01 06:00:00', NULL, 'proj_fitness_challenge', 'designer4', 'designer4', NOW(), NOW()),
('post_fitness_2', 'Day 1 Workout', 'Day 1 of our fitness challenge - lets start strong!', 'PHOTO', 'APPROVED', NULL, NULL, 'proj_fitness_challenge', 'designer5', 'designer4', NOW(), NOW()),
('post_fitness_3', 'Nutrition Tips', 'Fuel your body right with these nutrition tips', 'CAROUSEL', 'SUBMITTED', NULL, NULL, 'proj_fitness_challenge', 'designer4', 'designer5', NOW(), NOW()),

-- Eco Store Posts
('post_eco_1', 'Sustainable Living Tips', 'Small changes, big impact! Here are 5 ways to live more sustainably 🌱 #Sustainability #EcoFriendly #GreenLiving', 'CAROUSEL', 'POSTED', '2024-01-22 11:00:00', '2024-01-22 11:00:00', 'proj_eco_awareness', 'designer5', 'designer5', NOW(), NOW()),
('post_eco_2', 'Product Spotlight', 'Spotlight on our bamboo product line', 'PHOTO', 'REJECTED', NULL, NULL, 'proj_eco_awareness', 'designer1', 'designer5', NOW(), NOW()),
('post_eco_3', 'Eco Challenge', 'Take our weekly eco challenge!', 'STORY', 'DRAFT', NULL, NULL, 'proj_eco_awareness', 'designer5', NULL, NOW(), NOW()),

-- Restaurant Posts
('post_restaurant_1', 'New Menu Reveal', 'Exciting news! Our new seasonal menu is here featuring fresh, local ingredients 🍽️ #NewMenu #LocalIngredients #FineDining', 'CAROUSEL', 'SCHEDULED', '2024-02-20 18:00:00', NULL, 'proj_restaurant_menu', 'designer2', 'designer2', NOW(), NOW()),
('post_restaurant_2', 'Chef Special', 'Tonight special from our head chef', 'PHOTO', 'APPROVED', NULL, NULL, 'proj_restaurant_menu', 'designer3', 'designer2', NOW(), NOW()),

-- Beauty Posts
('post_beauty_1', 'Skincare Routine Tutorial', 'Your complete morning skincare routine in 60 seconds ✨ #SkincareRoutine #BeautyTips #GlowUp', 'REEL', 'POSTED', '2024-01-25 09:00:00', '2024-01-25 09:00:00', 'proj_beauty_tutorial', 'designer1', 'designer1', NOW(), NOW()),
('post_beauty_2', 'Product Review', 'Honest review of our new foundation line', 'PHOTO', 'SUBMITTED', NULL, NULL, 'proj_beauty_tutorial', 'designer4', 'designer1', NOW(), NOW()),

-- Travel Posts
('post_travel_1', 'Summer Destination Guide', 'Top 10 summer destinations that will take your breath away 🏖️ #SummerTravel #Wanderlust #TravelGoals', 'CAROUSEL', 'DRAFT', NULL, NULL, 'proj_travel_summer', 'designer3', NULL, NOW(), NOW()),
('post_travel_2', 'Travel Tips Reel', 'Packing hacks for your summer vacation', 'REEL', 'SUBMITTED', NULL, NULL, 'proj_travel_summer', 'designer5', 'designer3', NOW(), NOW());

-- Insert Post Platforms (Many-to-many relationship)
INSERT INTO post_platforms (id, postId, platform) VALUES
-- TechStartup posts on both platforms
('pp_tech_1_ig', 'post_tech_1', 'INSTAGRAM'),
('pp_tech_1_fb', 'post_tech_1', 'FACEBOOK'),
('pp_tech_2_ig', 'post_tech_2', 'INSTAGRAM'),
('pp_tech_3_ig', 'post_tech_3', 'INSTAGRAM'),

-- Fashion posts mainly on Instagram
('pp_fashion_1_ig', 'post_fashion_1', 'INSTAGRAM'),
('pp_fashion_1_fb', 'post_fashion_1', 'FACEBOOK'),
('pp_fashion_2_ig', 'post_fashion_2', 'INSTAGRAM'),
('pp_fashion_3_ig', 'post_fashion_3', 'INSTAGRAM'),

-- Cafe posts on both platforms
('pp_cafe_1_ig', 'post_cafe_1', 'INSTAGRAM'),
('pp_cafe_1_fb', 'post_cafe_1', 'FACEBOOK'),
('pp_cafe_2_ig', 'post_cafe_2', 'INSTAGRAM'),

-- Fitness posts on Instagram
('pp_fitness_1_ig', 'post_fitness_1', 'INSTAGRAM'),
('pp_fitness_2_ig', 'post_fitness_2', 'INSTAGRAM'),
('pp_fitness_3_ig', 'post_fitness_3', 'INSTAGRAM'),

-- Eco posts on both platforms
('pp_eco_1_ig', 'post_eco_1', 'INSTAGRAM'),
('pp_eco_1_fb', 'post_eco_1', 'FACEBOOK'),
('pp_eco_2_ig', 'post_eco_2', 'INSTAGRAM'),
('pp_eco_3_ig', 'post_eco_3', 'INSTAGRAM'),

-- Restaurant posts
('pp_restaurant_1_ig', 'post_restaurant_1', 'INSTAGRAM'),
('pp_restaurant_1_fb', 'post_restaurant_1', 'FACEBOOK'),
('pp_restaurant_2_ig', 'post_restaurant_2', 'INSTAGRAM'),

-- Beauty posts on Instagram
('pp_beauty_1_ig', 'post_beauty_1', 'INSTAGRAM'),
('pp_beauty_2_ig', 'post_beauty_2', 'INSTAGRAM'),

-- Travel posts
('pp_travel_1_ig', 'post_travel_1', 'INSTAGRAM'),
('pp_travel_1_fb', 'post_travel_1', 'FACEBOOK'),
('pp_travel_2_ig', 'post_travel_2', 'INSTAGRAM');

-- Insert Assets for posts
INSERT INTO assets (id, filename, url, type, size, `order`, postId, createdAt) VALUES
-- TechStartup assets
('asset_tech_1_1', 'app-launch-hero.jpg', '/uploads/techstartup/app-launch-hero.jpg', 'image', 2048576, 0, 'post_tech_1', NOW()),
('asset_tech_2_1', 'feature-demo.mp4', '/uploads/techstartup/feature-demo.mp4', 'video', 15728640, 0, 'post_tech_2', NOW()),
('asset_tech_3_1', 'behind-scenes.jpg', '/uploads/techstartup/behind-scenes.jpg', 'image', 1536000, 0, 'post_tech_3', NOW()),

-- Fashion assets
('asset_fashion_1_1', 'spring-collection-1.jpg', '/uploads/fashion/spring-collection-1.jpg', 'image', 3072000, 0, 'post_fashion_1', NOW()),
('asset_fashion_1_2', 'spring-collection-2.jpg', '/uploads/fashion/spring-collection-2.jpg', 'image', 2856000, 1, 'post_fashion_1', NOW()),
('asset_fashion_1_3', 'spring-collection-3.jpg', '/uploads/fashion/spring-collection-3.jpg', 'image', 2944000, 2, 'post_fashion_1', NOW()),
('asset_fashion_2_1', 'style-tips-video.mp4', '/uploads/fashion/style-tips-video.mp4', 'video', 25165824, 0, 'post_fashion_2', NOW()),
('asset_fashion_3_1', 'model-photoshoot.jpg', '/uploads/fashion/model-photoshoot.jpg', 'image', 4194304, 0, 'post_fashion_3', NOW()),

-- Cafe assets
('asset_cafe_1_1', 'grand-opening.jpg', '/uploads/cafe/grand-opening.jpg', 'image', 2621440, 0, 'post_cafe_1', NOW()),
('asset_cafe_2_1', 'barista-skills.mp4', '/uploads/cafe/barista-skills.mp4', 'video', 18874368, 0, 'post_cafe_2', NOW()),

-- Fitness assets
('asset_fitness_1_1', 'challenge-intro.mp4', '/uploads/fitness/challenge-intro.mp4', 'video', 31457280, 0, 'post_fitness_1', NOW()),
('asset_fitness_2_1', 'day1-workout.jpg', '/uploads/fitness/day1-workout.jpg', 'image', 1843200, 0, 'post_fitness_2', NOW()),
('asset_fitness_3_1', 'nutrition-tip-1.jpg', '/uploads/fitness/nutrition-tip-1.jpg', 'image', 1638400, 0, 'post_fitness_3', NOW()),
('asset_fitness_3_2', 'nutrition-tip-2.jpg', '/uploads/fitness/nutrition-tip-2.jpg', 'image', 1740800, 1, 'post_fitness_3', NOW()),

-- Eco assets
('asset_eco_1_1', 'sustainable-tip-1.jpg', '/uploads/eco/sustainable-tip-1.jpg', 'image', 2097152, 0, 'post_eco_1', NOW()),
('asset_eco_1_2', 'sustainable-tip-2.jpg', '/uploads/eco/sustainable-tip-2.jpg', 'image', 1966080, 1, 'post_eco_1', NOW()),
('asset_eco_2_1', 'bamboo-products.jpg', '/uploads/eco/bamboo-products.jpg', 'image', 2359296, 0, 'post_eco_2', NOW()),
('asset_eco_3_1', 'eco-challenge.jpg', '/uploads/eco/eco-challenge.jpg', 'image', 1572864, 0, 'post_eco_3', NOW()),

-- Restaurant assets
('asset_restaurant_1_1', 'new-menu-1.jpg', '/uploads/restaurant/new-menu-1.jpg', 'image', 3145728, 0, 'post_restaurant_1', NOW()),
('asset_restaurant_1_2', 'new-menu-2.jpg', '/uploads/restaurant/new-menu-2.jpg', 'image', 2883584, 1, 'post_restaurant_1', NOW()),
('asset_restaurant_2_1', 'chef-special.jpg', '/uploads/restaurant/chef-special.jpg', 'image', 2621440, 0, 'post_restaurant_2', NOW()),

-- Beauty assets
('asset_beauty_1_1', 'skincare-routine.mp4', '/uploads/beauty/skincare-routine.mp4', 'video', 22020096, 0, 'post_beauty_1', NOW()),
('asset_beauty_2_1', 'foundation-review.jpg', '/uploads/beauty/foundation-review.jpg', 'image', 2097152, 0, 'post_beauty_2', NOW()),

-- Travel assets
('asset_travel_1_1', 'destination-1.jpg', '/uploads/travel/destination-1.jpg', 'image', 4194304, 0, 'post_travel_1', NOW()),
('asset_travel_1_2', 'destination-2.jpg', '/uploads/travel/destination-2.jpg', 'image', 3932160, 1, 'post_travel_1', NOW()),
('asset_travel_2_1', 'packing-hacks.mp4', '/uploads/travel/packing-hacks.mp4', 'video', 28311552, 0, 'post_travel_2', NOW());

-- Insert Comments
INSERT INTO comments (id, content, postId, userId, createdAt) VALUES
-- Comments on TechStartup posts
('comment_1', 'Great work on the app launch campaign! The visuals are stunning.', 'post_tech_1', 'manager1', NOW()),
('comment_2', 'Love the energy in this reel! Can we add more call-to-action text?', 'post_tech_2', 'manager1', NOW()),
('comment_3', 'The behind-the-scenes content is perfect for building trust with users.', 'post_tech_3', 'client1', NOW()),

-- Comments on Fashion posts
('comment_4', 'The spring collection looks amazing! The colors are perfect for the season.', 'post_fashion_1', 'manager2', NOW()),
('comment_5', 'Could we adjust the lighting in the second image? It seems a bit dark.', 'post_fashion_2', 'manager2', NOW()),
('comment_6', 'This needs more brand consistency. Please use our brand colors.', 'post_fashion_3', 'client2', NOW()),

-- Comments on Cafe posts
('comment_7', 'Perfect timing for the grand opening! The community response was great.', 'post_cafe_1', 'client3', NOW()),
('comment_8', 'The barista skills video went viral! Great job capturing the artistry.', 'post_cafe_2', 'manager1', NOW()),

-- Comments on Fitness posts
('comment_9', 'This challenge intro is motivating! Ready to see the engagement.', 'post_fitness_1', 'manager3', NOW()),
('comment_10', 'Can we add more detailed workout instructions in the caption?', 'post_fitness_2', 'client4', NOW()),
('comment_11', 'The nutrition tips are helpful, but lets fact-check the information.', 'post_fitness_3', 'manager3', NOW()),

-- Comments on Eco posts
('comment_12', 'Love the educational approach! This aligns perfectly with our mission.', 'post_eco_1', 'client5', NOW()),
('comment_13', 'The product images need better lighting. Can we reshoot?', 'post_eco_2', 'manager2', NOW()),

-- Comments on Restaurant posts
('comment_14', 'The new menu looks delicious! Great food photography.', 'post_restaurant_1', 'manager1', NOW()),
('comment_15', 'This chef special post needs to go live tonight during dinner rush.', 'post_restaurant_2', 'client1', NOW()),

-- Comments on Beauty posts
('comment_16', 'The skincare routine is clear and easy to follow. Great tutorial!', 'post_beauty_1', 'manager3', NOW()),
('comment_17', 'We need to include more diverse skin tones in our content.', 'post_beauty_2', 'client2', NOW()),

-- Comments on Travel posts
('comment_18', 'These destinations look incredible! Perfect for summer marketing.', 'post_travel_1', 'manager2', NOW()),
('comment_19', 'The packing tips are practical and engaging. Love the quick format.', 'post_travel_2', 'client4', NOW());

-- Insert Notifications
INSERT INTO notifications (id, title, message, isRead, userId, createdAt) VALUES
-- Admin notifications
('notif_1', 'New Post Submitted', 'Maya Patel submitted "Style Tips Video" for Fashion Forward project for review.', false, 'admin1', NOW()),
('notif_2', 'Project Deadline Approaching', 'Spring Collection 2024 project deadline is in 5 days.', false, 'admin1', NOW()),
('notif_3', 'Client Feedback Received', 'TechStartup Inc provided feedback on the app launch campaign.', true, 'admin2', NOW()),

-- Manager notifications
('notif_4', 'Post Needs Approval', 'Alex Rodriguez submitted "Behind the Scenes Story" for approval.', false, 'manager1', NOW()),
('notif_5', 'Comment Added', 'David Wilson commented on "App Launch Teaser" post.', true, 'manager1', NOW()),
('notif_6', 'Post Scheduled Successfully', '"Grand Opening Announcement" has been scheduled for tomorrow at 8 AM.', true, 'manager1', NOW()),
('notif_7', 'New Post Submitted', 'Jordan Taylor submitted "Nutrition Tips" for FitLife App project.', false, 'manager3', NOW()),
('notif_8', 'Post Rejected', '"Product Spotlight" post was rejected. Please review feedback.', false, 'manager2', NOW()),

-- Designer notifications
('notif_9', 'Post Approved', 'Your post "Spring Collection Preview" has been approved and scheduled.', true, 'designer3', NOW()),
('notif_10', 'Feedback Received', 'Manager provided feedback on your "Style Tips Video" submission.', false, 'designer4', NOW()),
('notif_11', 'New Assignment', 'You have been assigned to work on "Summer Destinations" project.', false, 'designer3', NOW()),
('notif_12', 'Post Published', 'Your "Skincare Routine Tutorial" post has been published successfully.', true, 'designer1', NOW()),
('notif_13', 'Revision Requested', 'Please revise the "Product Spotlight" post based on client feedback.', false, 'designer5', NOW()),

-- Client notifications
('notif_14', 'Post Published', 'Your "Grand Opening Announcement" post is now live on Instagram and Facebook.', true, 'client1', NOW()),
('notif_15', 'Weekly Report Ready', 'Your weekly social media performance report is ready for review.', false, 'client2', NOW()),
('notif_16', 'New Post Preview', 'Preview your upcoming "New Menu Reveal" post before it goes live.', false, 'client3', NOW()),
('notif_17', 'Campaign Milestone', 'Your 30-Day Fitness Challenge campaign reached 10K impressions!', true, 'client4', NOW()),
('notif_18', 'Content Calendar Updated', 'Your content calendar for March has been updated with new posts.', false, 'client5', NOW());

-- Success message
SELECT 'Comprehensive seed data inserted successfully!' as message;
