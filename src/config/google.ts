// Google API Configuration
// To use this app, you'll need to:
// 1. Go to https://console.developers.google.com/
// 2. Create a new project or select an existing one
// 3. Enable the People API
// 4. Create OAuth 2.0 credentials
// 5. Add http://localhost:3000/auth/callback to authorized redirect URIs
// 6. Replace the placeholder values below with your actual credentials

export const GOOGLE_CONFIG = {
  // Replace with your Google OAuth client ID
  CLIENT_ID: 'your-google-client-id.apps.googleusercontent.com',
  
  // Replace with your Google OAuth client secret
  CLIENT_SECRET: 'your-google-client-secret',
  
  // The redirect URI must match what's configured in Google Console
  REDIRECT_URI: 'http://localhost:3000/auth/callback',
  
  // Required scopes for accessing and modifying contacts
  SCOPES: [
    'https://www.googleapis.com/auth/contacts.readonly',
    'https://www.googleapis.com/auth/contacts',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ]
}

// Instructions for setup:
// 1. Visit the Google Cloud Console: https://console.cloud.google.com/
// 2. Create a new project or select an existing project
// 3. Enable the Google People API:
//    - Go to "APIs & Services" > "Library"
//    - Search for "People API" and enable it
// 4. Create OAuth 2.0 credentials:
//    - Go to "APIs & Services" > "Credentials"
//    - Click "Create Credentials" > "OAuth client ID"
//    - Select "Desktop application"
//    - Add "http://localhost:3000/auth/callback" to authorized redirect URIs
// 5. Copy your Client ID and Client Secret to this file