# Supabase Authentication Setup Guide

## Part 1: Supabase Dashboard Setup

### Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in/create account
2. Click "New Project"
3. Choose your organization
4. Set project name: `vayalcare-auth`
5. Set database password (save this securely)
6. Choose region (closest to your users)
7. Click "Create new project"

### Step 2: Get Project Credentials

1. In your Supabase dashboard, go to **Settings → API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiI`)

### Step 3: Configure Authentication Providers

#### Email Authentication (Already Enabled)

- Go to **Authentication → Settings → Auth Providers**
- Email provider should be enabled by default

#### Google OAuth Setup

1. Go to **Authentication → Settings → Auth Providers**
2. Find "Google" and click to configure
3. Enable Google provider
4. You'll need to create Google OAuth credentials:

**Google Console Setup:**

1. Go to https://console.developers.google.com/
2. Create new project or select existing
3. Enable Google+ API
4. Go to **Credentials → Create Credentials → OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Name: `VayalCare Auth`
7. Authorized redirect URIs: Add `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   (Replace YOUR_PROJECT_REF with your actual project reference from Supabase URL)
8. Copy **Client ID** and **Client Secret**
9. Paste these in Supabase Google provider settings
10. Save configuration

### Step 4: Create Users Profile Table

1. Go to **Table Editor** in Supabase dashboard
2. Click "Create a new table"
3. Table name: `profiles`
4. Columns to add:

```sql
-- This will be automatically created, or you can run this SQL:
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create policy for users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Step 5: Configure Email Templates (Optional)

1. Go to **Authentication → Settings → Email Templates**
2. Customize the confirmation email template if needed
3. Set your app name and customize the styling

## Part 2: Environment Variables Setup

1. Copy the `.env.example` file to `.env` in your project root:

```bash
cp .env.example .env
```

2. Fill in your Supabase credentials in the `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GEMINI_API_KEY=your_existing_gemini_key
```

## Part 3: Test the Authentication

### Testing Email Authentication:

1. Start your development server: `npm run dev`
2. Go to the login page
3. Switch to "Email" tab
4. Try "Sign Up" with a real email
5. Check your email for verification link
6. After verification, try "Login"

### Testing Google Authentication:

1. Click "Sign in with Google" button
2. Complete Google OAuth flow
3. Should redirect back to your app with user logged in

## Part 4: Verification Checklist

- [ ] Supabase project created
- [ ] Project URL and anon key copied to .env file
- [ ] Google OAuth configured with correct redirect URI
- [ ] Profiles table created with RLS policies
- [ ] Email templates configured
- [ ] Environment variables set up correctly
- [ ] App starts without errors
- [ ] Email signup/login works
- [ ] Google OAuth works
- [ ] User profiles are created automatically

## Troubleshooting

### Common Issues:

1. **"Invalid login credentials" error**

   - Make sure email is verified before login
   - Check if user exists in Authentication → Users

2. **Google OAuth redirect error**

   - Verify redirect URI in Google Console matches Supabase exactly
   - Check if Google OAuth is enabled in Supabase Auth settings

3. **Environment variables not loading**

   - Restart development server after adding .env file
   - Make sure .env is in project root, not src folder

4. **Profile not created automatically**
   - Check if the trigger function was created successfully
   - Verify RLS policies are set up correctly

## Database Schema

The authentication system creates these main components:

- `auth.users` - Supabase managed user accounts
- `public.profiles` - Your custom user profile data
- Automatic profile creation on user registration
- Row Level Security for data protection

Your app is now ready with full authentication system!
