import { create } from 'zustand'
import { Contact, Tag } from '../types'
import { googleContactsService } from '../services/googleContacts'
import { googleAuthService } from '../services/googleAuth'

interface AppState {
  // Authentication
  isAuthenticated: boolean
  isLoading: boolean
  
  // Contacts
  contacts: Contact[]
  selectedContact: Contact | null
  
  // Tags
  tags: Tag[]
  
  // UI State
  showTagManager: boolean
  
  // Actions
  authenticate: () => Promise<void>
  logout: () => void
  loadContacts: () => Promise<void>
  selectContact: (contact: Contact | null) => void
  toggleTag: (tagName: string) => void
  addTag: (name: string, color: string) => void
  removeTag: (name: string) => void
  updateContactTags: (contactId: string, tags: string[]) => Promise<void>
  setShowTagManager: (show: boolean) => void
  refreshTagsFromContacts: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  isLoading: false,
  contacts: [],
  selectedContact: null,
  tags: [],
  showTagManager: false,

  // Actions
  authenticate: async () => {
    set({ isLoading: true })
    
    try {
      const authUrl = googleAuthService.generateAuthUrl()
      
      // Use Electron API to open browser
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        await (window as any).electronAPI.openOAuthUrl(authUrl)
      } else {
        // Redirect to Google OAuth in the same window
        window.location.href = authUrl
      }
    } catch (error) {
      console.error('Authentication failed:', error)
      set({ isLoading: false })
    }
  },

  logout: () => {
    googleAuthService.logout()
    set({ 
      isAuthenticated: false, 
      contacts: [], 
      selectedContact: null 
    })
  },

  loadContacts: async () => {
    set({ isLoading: true })
    
    try {
      const contacts = await googleContactsService.fetchContacts()
      
      set({ contacts, isLoading: false })
      
      // Rebuild tags from contacts
      get().refreshTagsFromContacts()
    } catch (error) {
      console.error('Failed to load contacts:', error)
      set({ isLoading: false })
    }
  },

  selectContact: (contact) => {
    set({ selectedContact: contact })
  },

  toggleTag: (tagName) => {
    set(state => ({
      tags: state.tags.map(tag =>
        tag.name === tagName ? { ...tag, visible: !tag.visible } : tag
      )
    }))
  },

  addTag: (name, color) => {
    set(state => ({
      tags: [...state.tags, { name, color, visible: true, count: 0 }]
    }))
  },

  removeTag: (name) => {
    set(state => ({
      tags: state.tags.filter(tag => tag.name !== name)
    }))
  },

  updateContactTags: async (contactId, tags) => {
    try {
      await googleContactsService.updateContactTags(contactId, tags)
      
      // Update local state
      set(state => ({
        contacts: state.contacts.map(contact =>
          contact.id === contactId ? { ...contact, tags } : contact
        )
      }))
      
      // Refresh tags from updated contacts
      get().refreshTagsFromContacts()
    } catch (error) {
      console.error('Failed to update contact tags:', error)
      throw error
    }
  },

  setShowTagManager: (show) => {
    set({ showTagManager: show })
  },

  refreshTagsFromContacts: () => {
    const { contacts } = get()
    const tagMap = new Map<string, number>()
    
    // Extract all unique tags from contacts and count occurrences
    contacts.forEach(contact => {
      contact.tags.forEach(tagName => {
        tagMap.set(tagName, (tagMap.get(tagName) || 0) + 1)
      })
    })
    
    // Generate colors for tags (predefined color palette)
    const colors = [
      '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4',
      '#f97316', '#84cc16', '#ec4899', '#6b7280', '#14b8a6', '#f472b6'
    ]
    
    // Create tags array from extracted tags
    const newTags = Array.from(tagMap.entries()).map(([name, count], index) => ({
      name,
      color: colors[index % colors.length],
      visible: true,
      count
    }))
    
    set({ tags: newTags })
  }
}))

// Mock data for development/testing
export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-555-0101',
    tags: ['work', 'colleague'],
    position: [0, 0, 0]
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1-555-0102',
    tags: ['family'],
    position: [2, 1, 0]
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '+1-555-0103',
    tags: ['work', 'friend'],
    position: [-2, -1, 1]
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    phone: '+1-555-0104',
    tags: ['friend'],
    position: [1, -2, -1]
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    phone: '+1-555-0105',
    tags: ['family', 'friend'],
    position: [-1, 2, 1]
  }
]