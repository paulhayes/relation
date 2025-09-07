import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Electron API
Object.defineProperty(window, 'electronAPI', {
  writable: true,
  value: {
    openOAuthUrl: vi.fn(),
    onGoogleAuthCallback: vi.fn()
  }
})

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_GOOGLE_CLIENT_ID: 'test-client-id',
    VITE_GOOGLE_CLIENT_SECRET: 'test-client-secret'
  }
})