# Personal Account System

A robust MVP for a personal account system using Next.js, Tailwind CSS, and Supabase.

## Features

- Simple landing page with login/signup flow
- Email & password authentication with Supabase
- User profile management
- Protected dashboard page with user data
- Error handling for common scenarios
- Webhook integration for automatic profile creation

## Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Cryptotechno/db.git
cd db
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Create a new table named `profiles` with the following schema:

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Create policies
create policy "Users can view their own profile" 
  on profiles for select 
  using (auth.uid() = id);

create policy "Users can insert their own profile" 
  on profiles for insert 
  with check (auth.uid() = id);

create policy "Users can update their own profile" 
  on profiles for update 
  using (auth.uid() = id);
```

3. Get your Supabase URL, anon key, and service role key from the project settings (API section)

### 4. Setup Supabase Webhook for User Confirmation

1. In your Supabase dashboard, go to **Project Settings** > **API** > **Webhooks**
2. Click **Create a new webhook**
3. Configure the webhook:
   - **Name**: `user-confirmed`
   - **HTTP Method**: `POST`
   - **URL**: `https://your-deployed-domain.com/api/user-confirmed`
   - **Events**: Select `user.confirmed` from the dropdown
   - **Payload Format**: Keep the default JSON format
4. Click **Create webhook**

This webhook will automatically create a profile in the profiles table when a user confirms their email.

### 5. Setup environment variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

**Important:** The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges. Make sure to:
- Never expose this key in client-side code
- Add `SUPABASE_SERVICE_ROLE_KEY` to your deployment environment variables
- Ensure `.env.local` is in your `.gitignore` file

### 6. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment on Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add all environment variables to your Vercel project
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!
5. Once deployed, update your Supabase webhook URL to point to your live domain

## Additional Considerations

- For production use, add additional security measures and data validation
- Consider implementing a more robust error handling system
- Add user profile customization options

## Recent Improvements

- **Improved Error Handling**: Enhanced error handling with contextual error objects that preserve stack traces and original errors
- **Code Reusability**: Reduced code duplication in profile mapping with utility functions
- **Environment Variables**: Added environment variable control for auth bypass in development mode with `NEXT_PUBLIC_BYPASS_AUTH`
- **Consistent Error Handling**: Standardized error handling across API client and services

# AI-Vertise Platform

## Admin Panel Removed

The admin panel functionality has been removed. Instead, please use the Supabase UI directly to manage plans, users, and campaigns. See the [Supabase Management Guide](./SUPABASE_MANAGEMENT.md) for detailed instructions.

## Database Management

All database management is now done directly through the Supabase UI:

1. Log in to Supabase dashboard
2. Navigate to Table Editor
3. Select the table you want to manage (plans, profiles, campaigns)
4. Use the UI to add, edit, or delete records

This approach provides more direct control over your data without requiring additional admin interfaces.
