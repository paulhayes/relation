import { useEffect } from 'react'
import Layout from './components/Layout'
import NetworkVisualization from './components/NetworkVisualization'
import ContactSidebar from './components/ContactSidebar'
import TagLegend from './components/TagLegend'
import TagManager from './components/TagManager'
import { useAppStore, mockContacts } from './stores/appStore'
import { googleAuthService } from './services/googleAuth'

function App() {
  const { 
    isAuthenticated, 
    isLoading, 
    contacts,
    showTagManager,
    authenticate, 
    loadContacts 
  } = useAppStore()

  useEffect(() => {
    // Check for existing authentication on startup
    const checkExistingAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const authCode = urlParams.get('code')
      
      // Handle OAuth callback if present
      if (authCode && window.location.pathname === '/auth/callback') {
        useAppStore.setState({ isLoading: true })
        
        try {
          await googleAuthService.exchangeCodeForTokens(authCode)
          useAppStore.setState({ isAuthenticated: true, isLoading: false })
          
          // Load contacts after authentication
          try {
            await loadContacts()
          } catch (contactError) {
            console.error('Failed to load contacts:', contactError)
            // Fall back to mock data if contacts loading fails
            useAppStore.setState({ contacts: mockContacts })
            useAppStore.getState().refreshTagsFromContacts()
          }
          
          // Clear the callback URL
          window.history.replaceState({}, document.title, '/')
        } catch (error) {
          console.error('Failed to exchange code for tokens:', error)
          useAppStore.setState({ isLoading: false })
        }
      } else {
        // Check if user is already authenticated (has stored tokens)
        if (googleAuthService.isAuthenticated()) {
          useAppStore.setState({ isLoading: true })
          
          // Validate the stored token
          const isValidToken = await googleAuthService.validateToken()
          
          if (isValidToken) {
            useAppStore.setState({ isAuthenticated: true, isLoading: false })
            
            // Try to load contacts for already authenticated user
            try {
              await loadContacts()
            } catch (contactError) {
              console.error('Failed to load contacts for existing auth:', contactError)
              // Fall back to mock data if contacts loading fails
              useAppStore.setState({ contacts: mockContacts })
              useAppStore.getState().refreshTagsFromContacts()
            }
          } else {
            // Token is invalid, user needs to re-authenticate
            useAppStore.setState({ isAuthenticated: false, isLoading: false })
          }
        }
      }
    }
    
    checkExistingAuth()
  }, [])

  useEffect(() => {
    // Load mock data for development
    if (isAuthenticated && contacts.length === 0) {
      // In development, use mock data
      useAppStore.setState({ contacts: mockContacts })
      useAppStore.getState().refreshTagsFromContacts()
    }
  }, [isAuthenticated, contacts.length])

  const handleAuthentication = async () => {
    try {
      await authenticate()
      // After successful authentication, load contacts
      // await loadContacts() // Uncomment when Google API is configured
    } catch (error) {
      console.error('Authentication failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="dark">
        <Layout>
          <div className="flex items-center justify-center h-full">
            <div className="panel p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-secondary-dark">Connecting to Google...</p>
            </div>
          </div>
        </Layout>
      </div>
    )
  }

  return (
    <div className="dark">
      <Layout>
        {!isAuthenticated ? (
          <div className="flex items-center justify-center h-full">
            <div className="panel p-8 text-center max-w-md">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Welcome to Relation</h1>
                <p className="text-secondary-dark">
                  Visualize your Google contacts as an interactive 3D network graph
                </p>
              </div>
              
              <div className="mb-6 text-sm text-muted-dark bg-card-dark p-4 rounded-lg">
                <p className="mb-2">To get started:</p>
                <ol className="text-left space-y-1">
                  <li>1. Configure Google API credentials</li>
                  <li>2. Connect your Google account</li>
                  <li>3. Add tags to organize contacts</li>
                  <li>4. Explore your network in 3D!</li>
                </ol>
              </div>
              
              <button 
                className="btn-primary w-full"
                onClick={handleAuthentication}
              >
                Connect Google Account
              </button>
              
              <p className="text-xs text-muted-dark mt-4">
                See config/google.ts for setup instructions
              </p>
            </div>
          </div>
        ) : (
          <>
            <ContactSidebar />
            <div className="flex-1 relative">
              <NetworkVisualization />
              <TagLegend />
              {showTagManager && <TagManager />}
            </div>
          </>
        )}
      </Layout>
    </div>
  )
}

export default App