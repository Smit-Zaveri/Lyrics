# Firebase Security Setup

## Environment Variables
- Never commit the `.env` file to version control
- Always use `.env.template` as a reference for required environment variables
- For each environment (development/staging/production), maintain separate `.env` files

## Google Services JSON
- Keep `google-services.json` out of version control for production builds
- Store production keys securely (e.g., in a password manager or secure CI/CD environment)
- Use different Firebase projects for development and production

## Security Best Practices
1. Restrict API key usage in Firebase Console:
   - Set up Application restrictions for your API keys
   - Limit API key usage to specific Android applications using package name and SHA-1
   - Enable only necessary APIs for each key

2. Firebase Security Rules:
   - Set up proper Firestore security rules
   - Never allow unrestricted read/write access
   - Use authentication checks
   - Implement data validation

3. CI/CD:
   - Use secrets management in your CI/CD pipeline
   - Never print environment variables in logs
   - Rotate keys periodically

## Production Deployment
Before deploying to production:
1. Create a new Firebase project for production
2. Set up new API keys with appropriate restrictions
3. Configure proper security rules
4. Use separate .env.production file
5. Enable App Check in Firebase Console