# Post Management MVP

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/querkydeva-9342s-projects/v0-post-management-mvp)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/2Pv6LDULrOb)

## 🎯 MVP Flow (Post Management System)

### 1. Project / Campaign Creation
Manager creates a Project/Campaign (e.g. September Campaign, Diwali 2025) with:
- **Date Range**: Campaign timeline
- **Platform**: Instagram, Facebook, LinkedIn, YouTube
- **Content Types**: Story, Reel, Post, Carousel, Video
- **Post Details**: Title, Occasion, Brief, Content requirements

### 2. Designer Task View
Designer gets a **Weekly Calendar** with assigned tasks:
- **This Week**: Current tasks (e.g., 5 posts: 2 Reels, 1 Story, 2 Normal Posts)
- **Next Week**: Upcoming festive posts and pre-planned content
- **Task Cards**: Upload design files, add captions, suggest hashtags

### 3. Review & Approval (Manager / Team Lead)
Manager/TL receives notifications when designs are uploaded:
- ✅ **Approve**: Post gets scheduled automatically
- ❌ **Reject**: Reason required, goes back to designer
- ⏳ **Pending**: Keep for later review

### 4. Publish / Schedule
Approved posts are locked with scheduled dates:
- **Not Scheduled**: Approved but no date set
- **Scheduled**: Date/time confirmed
- **Published**: Live on platforms

## 👥 User Roles

### Admin/Manager
- Create clients and projects
- Define posts and assign to designers
- Approve/reject designs with feedback
- Track campaign progress and schedules

### Designer
- View assigned posts in weekly calendar
- Upload creative files and assets
- Add captions and hashtag suggestions
- Track approval status

### Client (Phase-2)
- Preview content before publishing
- Approve final posts
- View campaign progress

## 📊 Status Tracking

### Post Status Pipeline
`Draft` → `Submitted` → `Approved/Rejected` → `Scheduled` → `Published`

### Approval Status
- **Pending**: Awaiting manager review
- **Approved**: Ready for scheduling
- **Rejected**: Needs revision (reason provided)

### Schedule Status
- **Not Scheduled**: No publish date set
- **Scheduled**: Date/time confirmed
- **Published**: Live on social platforms

## 🏗️ Technical Architecture

**Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS + shadcn/ui
**Backend**: NextAuth.js authentication, Prisma ORM
**Database**: PostgreSQL with comprehensive schema
**Features**: Role-based access, real-time notifications, audit logging

## 🚀 Key Features

- **Project Management**: Campaign creation with multi-platform support
- **Task Assignment**: Weekly designer calendars with clear task cards
- **Approval Workflow**: Manager review with approve/reject/pending options
- **Asset Management**: File uploads with validation and organization
- **Calendar Scheduling**: Visual timeline for content planning
- **Notification System**: Real-time alerts for task updates
- **Audit Trail**: Complete activity logging for accountability

## 📱 Dashboard Views

### Manager Dashboard
- Project overview and statistics
- Pending approvals and notifications
- Team performance metrics
- Campaign progress tracking

### Designer Dashboard
- Weekly task calendar (This Week / Next Week)
- Task cards with upload functionality
- Approval status tracking
- Asset library access

### Client Dashboard (Phase-2)
- Campaign preview and approval
- Content calendar view
- Performance insights

## 🔄 Workflow Example

1. **Manager** creates "Diwali 2025 Campaign" project
2. **Manager** defines 10 posts across Instagram/Facebook for October
3. **Designer** sees weekly tasks: "This week: 3 Diwali posts due"
4. **Designer** uploads designs to task cards with captions
5. **Manager** gets notification, reviews and approves/rejects
6. **Approved posts** automatically move to scheduled status
7. **Calendar** shows all scheduled content for the campaign

## Deployment

Your project is live at: **[Vercel Deployment](https://vercel.com/querkydeva-9342s-projects/v0-post-management-mvp)**

Continue building: **[v0.app Project](https://v0.app/chat/projects/2Pv6LDULrOb)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface  
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
