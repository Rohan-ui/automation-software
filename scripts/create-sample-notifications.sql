-- Create sample notifications for demo users
INSERT INTO notifications (id, title, message, userId, isRead, createdAt) VALUES
('notif-1', 'Post approved', 'Your post "Summer Campaign Launch" has been approved and is ready for scheduling.', 'designer-1', false, NOW() - INTERVAL 1 HOUR),
('notif-2', 'New comment on your post', 'Project Manager commented on "Tech Startup Announcement".', 'designer-1', false, NOW() - INTERVAL 2 HOUR),
('notif-3', 'Post published successfully', 'Your post "Acme Product Launch" has been published to Instagram.', 'designer-1', true, NOW() - INTERVAL 1 DAY),
('notif-4', 'Post submitted for review', 'Creative Designer submitted "Holiday Campaign" for your review.', 'manager-1', false, NOW() - INTERVAL 30 MINUTE),
('notif-5', 'Post rejected', 'Your post "Brand Awareness Campaign" needs revision. Check the comments for feedback.', 'designer-1', false, NOW() - INTERVAL 3 HOUR);
