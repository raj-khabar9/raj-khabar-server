# Firebase Setup for Production

## Overview
The Firebase notification system requires authentication credentials to send push notifications. These credentials should **never** be committed to version control.

## Setup Options

### Option 1: Environment Variable (Recommended for Production)

1. **Get your Firebase Service Account Key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (`raj-khabar`)
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

2. **Set Environment Variable:**
   ```bash
   # On your production server, set this environment variable:
   export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"raj-khabar",...}'
   ```

   Or in Railway/Heroku/etc., add it as an environment variable in your deployment platform.

3. **The JSON should be minified and contain all the fields from the downloaded file.**

### Option 2: File-based (For Development)

1. **Create the service account file locally:**
   ```bash
   cp serviceAccountJson/serviceAccountKey.json.template serviceAccountJson/serviceAccountKey.json
   ```

2. **Replace the template values with your actual Firebase credentials.**

3. **The file is gitignored, so it won't be committed to version control.**

## How the Code Works

The application will:
1. **First** try to use the `FIREBASE_SERVICE_ACCOUNT` environment variable
2. **Fallback** to reading from `serviceAccountJson/serviceAccountKey.json` file (for development)
3. **Log errors** if neither method provides valid credentials

## Production Deployment

### Railway/Heroku:
1. Add the `FIREBASE_SERVICE_ACCOUNT` environment variable in your dashboard
2. Set the value to the entire JSON content (minified)

### Manual Server:
```bash
export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"raj-khabar","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"...","universe_domain":"googleapis.com"}'
```

## Verification

Check your server logs for:
- ✅ `"Firebase Admin SDK initialized successfully"`
- ❌ `"Firebase service account not configured"`
- ❌ `"Error parsing FIREBASE_SERVICE_ACCOUNT environment variable"`

## Security Notes

- **Never** commit the actual service account JSON to git
- Use environment variables in production
- Rotate your service account keys periodically
- Limit the service account permissions to only what's needed for Firebase messaging
