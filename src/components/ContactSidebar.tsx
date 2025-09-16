import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../stores/appStore'
import { Contact } from '../types'

function ContactSidebar() {
  const { contacts, selectedContact, selectContact, tags, logout, updateContactTags } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [editingTags, setEditingTags] = useState<string | null>(null)
  const contactRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Scroll to selected contact when it changes
  useEffect(() => {
    if (selectedContact && contactRefs.current[selectedContact.id]) {
      const contactElement = contactRefs.current[selectedContact.id]
      contactElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [selectedContact])

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getContactInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  const getTagColor = (tagName: string) => {
    return tags.find(tag => tag.name === tagName)?.color || '#64748b'
  }

  const getAvatarColor = (name: string) => {
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const handleToggleTag = async (contactId: string, tagName: string) => {
    const contact = contacts.find(c => c.id === contactId)
    if (!contact) return

    const hasTag = contact.tags.includes(tagName)
    const newTags = hasTag
      ? contact.tags.filter(tag => tag !== tagName)
      : [...contact.tags, tagName]

    try {
      await updateContactTags(contactId, newTags)
    } catch (error) {
      console.error('Failed to update contact tags:', error)
    }
  }

  const handleAvatarClick = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent contact selection

    // Extract the contact ID from the resourceName (format: people/c4545270353778401561)
    const contactId = contact.id.startsWith('people/') ? contact.id.substring(7) : contact.id
    const googleContactsUrl = `https://contacts.google.com/person/${contactId}`

    // Use Electron API to open browser if available, otherwise fallback to window.open
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.openOAuthUrl(googleContactsUrl)
    } else {
      window.open(googleContactsUrl, '_blank')
    }
  }

  return (
    <div className="w-80 panel border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Contacts</h2>
          <button
            onClick={logout}
            className="text-xs text-muted-dark hover:text-secondary-dark"
          >
            Sign Out
          </button>
        </div>
        <p className="text-secondary-dark text-sm">
          {contacts.length} contacts in your network
        </p>
        
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input w-full mt-3"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            ref={(el) => (contactRefs.current[contact.id] = el)}
            className={`card p-3 cursor-pointer transition-colors ${
              selectedContact?.id === contact.id ? 'ring-2 ring-blue-600' : 'hover:bg-gray-800/50'
            }`}
            onClick={() => selectContact(contact)}
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                style={{ backgroundColor: getAvatarColor(contact.name) }}
                onClick={(e) => handleAvatarClick(contact, e)}
                title="Open Google Contact page"
              >
                {getContactInitials(contact.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{contact.name}</div>
                {contact.email && (
                  <div className="text-secondary-dark text-xs truncate">{contact.email}</div>
                )}
              </div>
            </div>
            
            <div className="mt-2">
              {editingTags === contact.id ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => {
                      const hasTag = contact.tags.includes(tag.name)
                      return (
                        <button
                          key={tag.name}
                          onClick={() => handleToggleTag(contact.id, tag.name)}
                          className={`px-2 py-1 text-xs rounded border ${
                            hasTag
                              ? 'border-transparent text-white'
                              : 'border-gray-600 text-gray-400 hover:border-gray-500'
                          } transition-colors`}
                          style={hasTag ? { 
                            backgroundColor: tag.color,
                          } : {}}
                        >
                          {tag.name}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingTags(null)}
                      className="text-xs text-green-400 hover:text-green-300"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.length > 0 ? (
                      <>
                        {contact.tags.slice(0, 3).map((tagName) => (
                          <span 
                            key={tagName}
                            className="px-2 py-1 text-xs rounded"
                            style={{ 
                              backgroundColor: `${getTagColor(tagName)}20`,
                              color: getTagColor(tagName)
                            }}
                          >
                            {tagName}
                          </span>
                        ))}
                        {contact.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded">
                            +{contact.tags.length - 3}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-dark italic">No tags</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingTags(contact.id)
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 ml-2"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {filteredContacts.length === 0 && searchTerm && (
          <div className="text-center text-secondary-dark py-8">
            <p>No contacts found matching "{searchTerm}"</p>
          </div>
        )}
        
        {contacts.length === 0 && (
          <div className="text-center text-secondary-dark py-8">
            <p>No contacts loaded yet</p>
            <p className="text-sm mt-1">Connect your Google account to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContactSidebar