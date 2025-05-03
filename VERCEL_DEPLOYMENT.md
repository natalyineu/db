# Vercel Deployment Guide

## Required Environment Variables

The following environment variables must be configured in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL` - The URL of your Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - The anonymous API key for your Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` - The service role key for your Supabase project (keep this secure!)
- `NEXT_PUBLIC_SITE_URL` - The URL of your deployed site (for production deployments)

## Optional Environment Variables

- `NEXT_PUBLIC_BYPASS_AUTH` - Set to `true` to bypass authentication (development only, never in production)
- `DEBUG` - Set to `true` for additional debugging information

## Deployment Checklist

1. Ensure all required environment variables are set in Vercel project settings
2. Make sure you have the latest dependencies installed locally
3. Verify the build succeeds locally with `npm run build`
4. Check that all files are committed to Git
5. Push to your repository, which will trigger a Vercel deployment

## Common Deployment Issues

If you encounter build failures in Vercel but not locally, check the following:

1. **Environment Variables**: Ensure all required environment variables are set in Vercel
2. **Node.js Version**: Make sure the Node.js version in Vercel matches your local development environment
3. **Dependency Issues**: Look for issues with npm packages or version mismatches
4. **Memory Limitations**: Vercel has build memory limits; consider optimizing the build process if needed

## Production Checks

For production deployments, verify:

1. All security headers are properly set
2. Authentication flows work correctly
3. API routes are secured properly
4. CSP policies are configured correctly 