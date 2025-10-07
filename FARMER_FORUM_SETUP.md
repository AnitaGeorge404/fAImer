# Farmer Forum - Live Integration Setup

This document explains how to set up the live farmer forum with Supabase integration.

## Features Added

✅ **Dynamic Posts & Alerts**: Create, read, and interact with real posts and alerts
✅ **Voting System**: Upvote/downvote posts, alerts, and comments for authenticity
✅ **Comments System**: Full commenting system like Stack Overflow
✅ **User Authentication**: Integrated with existing Firebase auth
✅ **Real-time Data**: Live data from Supabase database
✅ **Dummy Data Fallback**: Keeps existing dummy alerts for demonstration

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Run SQL Schema

Copy and paste the following SQL in your Supabase SQL editor:

```sql
-- Posts table for discussions
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  is_answered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table for community alerts
CREATE TABLE alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('danger', 'warning', 'info')),
  location TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('high', 'medium', 'low')),
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table for both posts and alerts
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT comment_parent_check CHECK (
    (post_id IS NOT NULL AND alert_id IS NULL) OR
    (post_id IS NULL AND alert_id IS NOT NULL)
  )
);

-- Votes table for tracking user votes on posts, alerts, and comments
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id, alert_id, comment_id),
  CONSTRAINT vote_target_check CHECK (
    (post_id IS NOT NULL AND alert_id IS NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND alert_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND alert_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Indexes for better performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_urgency ON alerts(urgency);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_alert_id ON comments(alert_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_post_id ON votes(post_id);
CREATE INDEX idx_votes_alert_id ON votes(alert_id);
CREATE INDEX idx_votes_comment_id ON votes(comment_id);

-- Functions to update reply/response counts
CREATE OR REPLACE FUNCTION update_post_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET reply_count = reply_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET reply_count = reply_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_alert_response_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE alerts SET response_count = response_count + 1 WHERE id = NEW.alert_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE alerts SET response_count = response_count - 1 WHERE id = OLD.alert_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_post_reply_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_reply_count();

CREATE TRIGGER trigger_update_alert_response_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_response_count();
```

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Update `src/lib/supabase.ts` with your actual credentials if not using environment variables.

## Features Overview

### 🗣️ **Stack Overflow for Farmers**

- **Posts**: Farmers can ask questions categorized by crops, diseases, market, technology, weather
- **Alerts**: Community alerts for urgent issues (pests, weather, market changes)
- **Voting**: Upvote/downvote system for authenticity (like Stack Overflow)
- **Comments**: Full commenting system on posts and alerts
- **Real-time**: Live updates from Supabase database

### 📊 **Voting System**

- **Upvote/Downvote**: Posts, alerts, and comments can be voted on
- **User-specific**: Each user can only vote once per item
- **Visual Feedback**: Voted buttons show different colors
- **Authenticity**: Community-driven content validation

### 💬 **Comments System**

- **Threaded Replies**: Comment on posts and alerts
- **Voting on Comments**: Comments can also be upvoted/downvoted
- **Real-time Updates**: New comments appear immediately

### 🔐 **Authentication**

- **Firebase Integration**: Uses existing Firebase authentication
- **User Context**: Posts/alerts/comments linked to authenticated users
- **Graceful Fallback**: Dummy data when not connected

## Usage

1. **View Forum**: Navigate to Farmer Forum from home screen
2. **Switch Tabs**: Toggle between "Alerts" and "Discussions"
3. **Filter**: Use category dropdown to filter posts
4. **Create Content**: Use + button to create posts or alerts
5. **Vote**: Click thumbs up/down to vote on content
6. **Comment**: Click on any post/alert title to open detailed view
7. **Add Comments**: Type and send comments in detailed view

## Error Handling

- **Offline Support**: Falls back to dummy data if Supabase is unavailable
- **Authentication**: Features gracefully disable if user not logged in
- **Loading States**: Proper loading indicators during operations
- **Error Messages**: Console logging for debugging

## Database Schema

- **posts**: Discussion posts with voting and reply counts
- **alerts**: Community alerts with urgency levels
- **comments**: Comments for both posts and alerts
- **votes**: User voting records with constraints
- **Indexes**: Optimized for performance
- **Triggers**: Auto-update reply/response counts

The forum is now a fully functional Stack Overflow-like system for farmers with real-time data, voting, and commenting features!
