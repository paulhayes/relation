import { GoogleAuthConfig } from '../types'

class GoogleAuthService {
  private config: GoogleAuthConfig = {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'demo-client-id',
    clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || 'demo-client-secret',
    redirectUri: 'http://localhost:3001/auth/callback',
    scopes: [
      'https://www.googleapis.com/auth/contacts.readonly',
      'https://www.googleapis.com/auth/contacts',
      'profile',
      'email'
    ]
  }
  
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor() {
    // Load tokens from localStorage synchronously
    this.loadTokensFromStorageSync()
  }

  private loadTokensFromStorageSync() {
    try {
      const storedAccessToken = localStorage.getItem('google_access_token')
      const storedRefreshToken = localStorage.getItem('google_refresh_token')
      
      if (storedAccessToken) {
        this.accessToken = storedAccessToken
      }
      if (storedRefreshToken) {
        this.refreshToken = storedRefreshToken
      }
    } catch (error) {
      console.error('Failed to load tokens from storage:', error)
    }
  }


  private saveTokensToStorage() {
    try {
      if (this.accessToken) {
        localStorage.setItem('google_access_token', this.accessToken)
      }
      if (this.refreshToken) {
        localStorage.setItem('google_refresh_token', this.refreshToken)
      }
    } catch (error) {
      console.error('Failed to save tokens to storage:', error)
    }
  }

  private clearTokensFromStorage() {
    try {
      localStorage.removeItem('google_access_token')
      localStorage.removeItem('google_refresh_token')
    } catch (error) {
      console.error('Failed to clear tokens from storage:', error)
    }
  }

  generateAuthUrl(): string {
    // Check if credentials are configured
    if (!this.config.clientId || this.config.clientId === 'demo-client-id') {
      throw new Error('Google OAuth credentials not configured. Please set VITE_GOOGLE_CLIENT_ID in .env file.')
    }
    
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    })
    
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  async exchangeCodeForTokens(authCode: string): Promise<{ access_token: string, refresh_token?: string }> {
    // Check if we're in Electron
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      // Use Electron's token exchange
      const tokens = await (window as any).electronAPI.exchangeOAuthCode(
        authCode, 
        this.config.clientId, 
        this.config.clientSecret
      )
      
      this.accessToken = tokens.access_token
      if (tokens.refresh_token) {
        this.refreshToken = tokens.refresh_token
      }
      
      // Save tokens to localStorage as well
      this.saveTokensToStorage()
      
      return tokens
    } else {
      // Fallback to direct fetch for web version
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code: authCode,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to exchange code for tokens')
      }

      const tokens = await response.json()
      this.accessToken = tokens.access_token
      if (tokens.refresh_token) {
        this.refreshToken = tokens.refresh_token
      }
      
      // Save tokens to localStorage
      this.saveTokensToStorage()
      
      return tokens
    }
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh access token')
    }

    const tokens = await response.json()
    this.accessToken = tokens.access_token
    
    // Save updated token to localStorage
    this.saveTokensToStorage()
    
    return tokens.access_token
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  setTokens(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken
    if (refreshToken) {
      this.refreshToken = refreshToken
    }
    
    // Save tokens to localStorage
    this.saveTokensToStorage()
  }

  async validateToken(): Promise<boolean> {
    if (!this.accessToken) {
      return false
    }

    try {
      // Test the token by making a request to Google's tokeninfo endpoint
      // const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${this.accessToken}`)
      
      // if (response.ok) {
      //   const tokenInfo = await response.json()
      //   // Check if token has enough time left (more than 5 minutes)
      //   const expiresIn = parseInt(tokenInfo.expires_in || '0')
      //   return expiresIn > 300
      // }
      
      // Token is invalid, try to refresh if we have a refresh token
      if (this.refreshToken) {
        try {
          await this.refreshAccessToken()
          return true
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError)
          // Clear invalid tokens
          this.logout()
          return false
        }
      }
      
      return false
    } catch (error) {
      console.error('Token validation failed:', error)
      return false
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  async checkElectronTokens() {
    // Check if we're in Electron and try to get tokens from main process
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      try {
        const electronTokens = await (window as any).electronAPI.getOAuthTokens()
        if (electronTokens?.access_token) {
          this.accessToken = electronTokens.access_token
          if (electronTokens.refresh_token) {
            this.refreshToken = electronTokens.refresh_token
          }
          // Sync to localStorage
          this.saveTokensToStorage()
          return true
        }
      } catch (error) {
        console.log('No tokens in Electron storage yet')
      }
    }
    return false
  }

  logout() {
    this.accessToken = null
    this.refreshToken = null
    
    // Clear tokens from localStorage
    this.clearTokensFromStorage()
    
    // Clear tokens from Electron if available
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.clearOAuthTokens().catch(console.error)
    }
  }
}

export const googleAuthService = new GoogleAuthService()