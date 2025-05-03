# Git Commit Checklist for Vercel Deployment

The following files should be committed to ensure a successful Vercel deployment:

## Critical Files to Commit

- [x] `vercel.json` - Contains Vercel-specific deployment configuration
- [x] `VERCEL_DEPLOYMENT.md` - Documents environment variables needed for deployment
- [ ] `src/lib/supabase/index.ts` - Crucial for Supabase imports to work correctly
- [ ] `src/lib/supabase/utils.ts` - Contains utility functions for Supabase
- [ ] `src/lib/supabase/README.md` - Documentation for the Supabase integration
- [ ] `src/lib/index.ts` - Re-exports from the lib directory
- [ ] `src/components/home/*` - Required for the homepage to render properly
- [ ] `src/components/ui/AiInsightsSection.tsx` - Component used in the UI
- [ ] `src/components/ui/CampaignMetrics.tsx` - Component used in the UI
- [ ] `src/services/brief-service.ts` - Service for handling briefs
- [ ] `src/utils/mock-data.ts` - Contains mock data for development/testing
- [ ] `src/utils/__tests__/*` - Test files

## Modified Files to Review and Commit

- [ ] `.eslintrc.js` - Updated ESLint configuration
- [ ] `src/features/profile/hooks/useProfile.ts` - Fixed dependency array issues
- [ ] Other modified files as needed for the application to function properly

## Before Committing

1. Run `npm run lint` to ensure there are no linting errors
2. Run `npm run build` to verify the build succeeds locally
3. Check that no sensitive information is being committed (API keys, secrets, etc.)
4. Make sure all path references in import statements are correct

## After Committing

1. Push to your repository
2. Monitor the Vercel build logs
3. Check for environment variable issues in the Vercel dashboard
4. Verify the deployed application works as expected 