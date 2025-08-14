# Production Deployment Guide

## Environment Variables Required

Create a `.env` file in the Backend directory with the following variables:

```env
# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_key_here

# Server Configuration
PORT=3000
NODE_ENV=production

# AWS S3 Configuration (if using file uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-frontend-domain-2.com
```

## Production Checklist

### Backend
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Configure MongoDB connection string
- [ ] Set up AWS S3 credentials (if using file uploads)
- [ ] Update CORS origins to your production domains
- [ ] Ensure all environment variables are set

### Frontend
- [ ] Set `VITE_API_BASE_URL` to your production backend URL
- [ ] Build the project with `npm run build`
- [ ] Deploy to your hosting platform

## Security Considerations

1. **JWT Secret**: Use a strong, random string (32+ characters)
2. **HTTPS**: Ensure your production domain uses HTTPS
3. **CORS**: Only allow your production domains
4. **Environment Variables**: Never commit .env files to version control
5. **Database**: Use a production MongoDB instance (Atlas recommended)

## Deployment Platforms

### Backend Options:
- Railway (recommended)
- Heroku
- DigitalOcean
- AWS EC2
- Google Cloud Platform

### Frontend Options:
- Vercel (recommended)
- Netlify
- Railway
- GitHub Pages

## Example Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

## Example Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch
