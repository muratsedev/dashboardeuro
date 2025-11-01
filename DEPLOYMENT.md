# Dashboard Deployment Guide for Netlify

This guide will help you deploy your Next.js dashboard application to Netlify for production use.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git repository (GitHub, GitLab, or Bitbucket)
- Production API server URL

## Environment Setup

### 1. Environment Variables

Before deployment, you need to set up your environment variables:

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update the API URL in `.env.local`:**
   ```env
   NEXT_PUBLIC_API_URL=https://your-production-api-server.com
   NODE_ENV=development
   ```

3. **For production deployment, create `.env.production`:**
   ```env
   NEXT_PUBLIC_API_URL=https://your-production-api-server.com
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   ```

### 2. Install Dependencies

```bash
npm install
```

## Local Testing

Test your application locally before deployment:

```bash
# Development mode
npm run dev

# Production build test
npm run build
npm run start
```

## Netlify Deployment

### Option 1: Git-based Deployment (Recommended)

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Connect to Netlify:**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your Git provider
   - Select your repository

3. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next` (automatic with Netlify Next.js plugin)
   - Node version: `18` or higher

4. **Set environment variables in Netlify:**
   - Go to Site Settings > Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-production-api-server.com`
   - Add: `NODE_ENV` = `production`
   - Add: `NEXT_TELEMETRY_DISABLED` = `1`

5. **Deploy:** Click "Deploy site"

### Option 2: Manual Deployment via Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Build your application:**
   ```bash
   npm run build
   ```

4. **Deploy:**
   ```bash
   # First deployment
   netlify deploy

   # Production deployment
   netlify deploy --prod
   ```

### Option 3: Drag & Drop Deployment

1. **Build your application locally:**
   ```bash
   npm run build
   ```

2. **Go to Netlify dashboard** and drag the `.next` folder to the deploy area

## Configuration Files

### netlify.toml
The project includes a `netlify.toml` file with optimized settings:
- Static file caching
- SPA routing redirects
- Security headers
- Build configuration

### next.config.ts
Configured for static export with:
- Image optimization disabled (required for static export)
- Proper remote patterns for production images
- Asset optimization settings

## Post-Deployment Checklist

1. **Verify the deployment:**
   - Check that all pages load correctly
   - Test API connections
   - Verify image loading
   - Test navigation and routing

2. **Update API server CORS settings:**
   - Add your Netlify domain to allowed origins
   - Update any domain restrictions in your API server

3. **Configure custom domain (optional):**
   - Go to Site Settings > Domain Management
   - Add your custom domain
   - Configure DNS settings

4. **Set up monitoring:**
   - Enable Netlify Analytics if needed
   - Set up error tracking
   - Configure performance monitoring

## Important Notes

### API Configuration
- The application uses `NEXT_PUBLIC_API_URL` environment variable for API calls
- Make sure your production API server is accessible from the browser
- Update CORS settings on your API server to allow your Netlify domain

### Netlify Next.js Features
- Full support for server-side API routes
- Automatic serverless function creation
- Image optimization with Netlify
- Dynamic routing support

### Security Considerations
- All environment variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Never put sensitive information in `NEXT_PUBLIC_` variables
- Use proper HTTPS for your API server
- Configure Content Security Policy headers (included in netlify.toml)

## Troubleshooting

### Common Issues

1. **404 errors on refresh:**
   - The `netlify.toml` includes SPA redirects to handle this

2. **API connection errors:**
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Verify API server CORS settings
   - Ensure API server is accessible via HTTPS

3. **Images not loading:**
   - Check image URLs and paths
   - Verify remote image domains in `next.config.ts`
   - Ensure images are properly uploaded to your server

4. **Build failures:**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

### Debug Steps

1. **Check build logs** in Netlify dashboard
2. **Test locally** with production build: `npm run build && npm run start`
3. **Verify environment variables** in Netlify settings
4. **Check browser console** for JavaScript errors
5. **Verify API calls** in browser network tab

## Continuous Deployment

Once connected to Git, Netlify will automatically:
- Deploy on every push to main branch
- Run build checks
- Update the live site
- Provide deploy previews for pull requests

## Performance Optimization

The deployment is optimized with:
- Static file caching (1 year for immutable assets)
- Gzip compression
- SWC minification
- Optimized fonts
- Security headers

## Support

For deployment issues:
- Check Netlify documentation: https://docs.netlify.com
- Review build logs in Netlify dashboard
- Check Next.js static export documentation
- Verify API server connectivity and CORS settings