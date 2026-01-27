# Vercel Deployment Guide

This guide helps you deploy your dashboard to Vercel with proper environment variables and configuration.

## Prerequisites

- Vercel account
- GitHub repository connected to Vercel
- Cloud API running at `https://eennback-002-site1.atempurl.com`

## Step 1: Environment Variables Setup in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `dashboardeuro` project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

### Required Environment Variables

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `NEXT_PUBLIC_API_URL` | `https://eennback-002-site1.atempurl.com` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `NEXT_TELEMETRY_DISABLED` | `1` | Production, Preview, Development |

### How to Add Variables:

1. Click **Add New** button
2. Enter **Name**: `NEXT_PUBLIC_API_URL`
3. Enter **Value**: `https://eennback-002-site1.atempurl.com`
4. Select **Environment**: Check all three (Production, Preview, Development)
5. Click **Save**

Repeat for each variable above.

## Step 2: Verify API Accessibility

Your cloud API must be accessible from Vercel's servers. Test the following endpoints:

- `https://eennback-002-site1.atempurl.com/api/Articles`
- `https://eennback-002-site1.atempurl.com/api/Categories`
- `https://eennback-002-site1.atempurl.com/api/BreakingNews`

## Step 3: Deploy

1. Push your changes to GitHub
2. Vercel will automatically detect changes and redeploy
3. Or manually trigger deployment from Vercel dashboard

## Step 4: Verify Deployment

1. Visit your deployed URL (e.g., `https://dashboardeuro.vercel.app`)
2. Check the dashboard loads without "Network Error"
3. Test article creation and image uploads

## Common Issues and Solutions

### Network Error
**Problem**: Getting "Network Error" on deployed site
**Solution**: 
- Verify environment variables are set in Vercel
- Check that `NEXT_PUBLIC_API_URL` is exactly: `https://eennback-002-site1.atempurl.com`
- Ensure no trailing slash in the URL

### Images Not Loading
**Problem**: Article images don't display
**Solution**:
- Check `next.config.ts` has correct remote patterns
- Verify image URLs are accessible: `https://eennback-002-site1.atempurl.com/uploads/images/...`

### API CORS Errors
**Problem**: CORS errors in browser console
**Solution**:
- Ensure your cloud API has proper CORS headers
- Check that API allows requests from your Vercel domain

## Environment Variables Checklist

- [ ] `NEXT_PUBLIC_API_URL` is set to `https://eennback-002-site1.atempurl.com`
- [ ] `NODE_ENV` is set to `production`
- [ ] `NEXT_TELEMETRY_DISABLED` is set to `1`
- [ ] All variables are applied to Production, Preview, and Development environments
- [ ] No trailing slashes in URLs
- [ ] Variables are saved and deployment is triggered

## Testing Your Deployment

After deployment, test these features:
1. Dashboard loads without errors
2. Articles list displays
3. Can create new articles
4. Can upload images
5. Breaking news functions work
6. Categories management works

## Debugging

If issues persist:
1. Check Vercel Function Logs in dashboard
2. Open browser dev tools and check Console and Network tabs
3. Verify API endpoints respond correctly
4. Test API directly: `curl https://eennback-002-site1.atempurl.com/api/Articles`

## Support

If you encounter issues:
1. Check this guide first
2. Review Vercel documentation
3. Check API server logs
4. Verify environment variables are correctly set