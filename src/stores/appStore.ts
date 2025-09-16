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

  // Camera
  cameraTarget: [number, number, number] | null
  
  // Actions
  authenticate: () => Promise<void>
  logout: () => void
  loadContacts: () => Promise<void>
  selectContact: (contact: Contact | null) => void
  toggleTag: (tagName: string) => void
  addTag: (name: string, color: string) => void
  removeTag: (name: string) => void
  updateTagColor: (name: string, color: string) => void
  updateContactTags: (contactId: string, tags: string[]) => Promise<void>
  setShowTagManager: (show: boolean) => void
  refreshTagsFromContacts: () => void
  loadTagSettings: () => { [name: string]: { color: string, visible: boolean } }
  saveTagSettings: () => void
  setCameraTarget: (target: [number, number, number] | null) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  isLoading: false,
  contacts: [],
  selectedContact: null,
  tags: [],
  showTagManager: false,
  cameraTarget: null,

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
        //window.location.href = authUrl
        console.log("meep");
        console.log(window);
        console.log((window as any).electronAPI);
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
    
    // Save settings after toggling
    get().saveTagSettings()
  },

  addTag: (name, color) => {
    set(state => ({
      tags: [...state.tags, { name, color, visible: true, count: 0 }]
    }))
    
    // Save settings after adding
    get().saveTagSettings()
  },

  removeTag: (name) => {
    set(state => ({
      tags: state.tags.filter(tag => tag.name !== name)
    }))
    
    // Save settings after removing
    get().saveTagSettings()
  },

  updateTagColor: (name: string, color: string) => {
    set(state => ({
      tags: state.tags.map(tag =>
        tag.name === name ? { ...tag, color } : tag
      )
    }))
    
    // Save settings after updating color
    get().saveTagSettings()
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
    
    // Load saved tag settings from localStorage
    const savedTagSettings = get().loadTagSettings()
    
    // Generate colors for tags (predefined color palette)
    const colors = [
      '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4',
      '#f97316', '#84cc16', '#ec4899', '#6b7280', '#14b8a6', '#f472b6'
    ]
    
    // Create tags array from extracted tags, preserving saved settings
    const newTags = Array.from(tagMap.entries()).map(([name, count], index) => {
      const savedTag = savedTagSettings[name]
      return {
        name,
        color: savedTag?.color || colors[index % colors.length],
        visible: savedTag?.visible !== undefined ? savedTag.visible : true,
        count
      }
    })
    
    set({ tags: newTags })
    
    // Save updated tag settings
    get().saveTagSettings()
  },

  loadTagSettings: () => {
    try {
      const saved = localStorage.getItem('relation_tag_settings')
      return saved ? JSON.parse(saved) : {}
    } catch (error) {
      console.error('Failed to load tag settings:', error)
      return {}
    }
  },

  saveTagSettings: () => {
    try {
      const { tags } = get()
      const tagSettings: { [name: string]: { color: string, visible: boolean } } = {}

      tags.forEach(tag => {
        tagSettings[tag.name] = {
          color: tag.color,
          visible: tag.visible
        }
      })

      localStorage.setItem('relation_tag_settings', JSON.stringify(tagSettings))
    } catch (error) {
      console.error('Failed to save tag settings:', error)
    }
  },

  setCameraTarget: (target) => {
    set({ cameraTarget: target })
  }
}))

