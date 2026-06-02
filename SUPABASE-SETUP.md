# Supabase Setup Guide

## Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in/up with GitHub
4. Create a new project with your desired name

## Step 2: Get Environment Variables
1. In your Supabase dashboard, go to Project Settings → API
2. Copy your:
   - Project URL
   - anon (public) key

## Step 3: Configure Environment
1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 4: Set Up Database
1. In Supabase dashboard, go to SQL Editor
2. Copy and run the SQL from `supabase-setup.sql`
3. This creates the tables and security policies

## Step 5: Test Authentication
After setup, the app will have:
- Sign up / Sign in functionality
- User profiles with avatars
- "Join Community" action
- Real-time predictions
- Dynamic community picks

## Features Implemented
- ✅ Authentication (sign up, sign in, sign out)
- ✅ User profiles with display names and avatars
- ✅ Explicit join action for "Who's Joined"
- ✅ Real prediction tracking
- ✅ Dynamic community picks calculation
- ✅ Real-time updates via subscriptions

## Next Steps
1. Set up your Supabase project
2. Configure environment variables
3. Run the SQL setup
4. Start the dev server
5. Test authentication and features