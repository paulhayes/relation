import { googleAuthService } from './googleAuth'
import { GoogleContact, Contact } from '../types'

class GoogleContactsService {
  private baseUrl = 'https://people.googleapis.com/v1'

  async fetchContacts(): Promise<Contact[]> {
    const accessToken = googleAuthService.getAccessToken()
    if (!accessToken) {
      throw new Error('Not authenticated')
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/people/me/connections?personFields=names,emailAddresses,phoneNumbers,userDefined&pageSize=1000`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          await googleAuthService.refreshAccessToken()
          return this.fetchContacts() // Retry with new token
        }
        throw new Error(`Failed to fetch contacts: ${response.statusText}`)
      }

      const data = await response.json()
      return this.transformGoogleContacts(data.connections || [])
    } catch (error) {
      console.error('Error fetching contacts:', error)
      throw error
    }
  }

  private transformGoogleContacts(googleContacts: GoogleContact[]): Contact[] {
    return googleContacts.map((contact, index) => {
      const name = contact.names?.[0]?.displayName || 'Unknown'
      const email = contact.emailAddresses?.[0]?.value
      const phone = contact.phoneNumbers?.[0]?.value
      
      // Extract tags from userDefined fields
      const tags = contact.userDefined
        ?.filter(field => field.key === 'relation_tags')
        .map(field => field.value.split(',').map(tag => tag.trim()))
        .flat() || []

      return {
        id: contact.resourceName || `contact_${index}`,
        name,
        email,
        phone,
        tags,
        position: this.generateRandomPosition()
      }
    })
  }

  private generateRandomPosition(): [number, number, number] {
    const radius = 5
    return [
      (Math.random() - 0.5) * radius * 2,
      (Math.random() - 0.5) * radius * 2,
      (Math.random() - 0.5) * radius * 2,
    ]
  }

  async updateContactTags(contactId: string, tags: string[]): Promise<void> {
    const accessToken = googleAuthService.getAccessToken()
    if (!accessToken) {
      throw new Error('Not authenticated')
    }

    try {
      // First, get the current contact data
      const response = await fetch(
        `${this.baseUrl}/${contactId}?personFields=userDefined`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch contact for update')
      }

      const contactData = await response.json()
      const currentUserDefined = contactData.userDefined || []
      
      // Remove existing relation_tags and add new ones
      const updatedUserDefined = [
        ...currentUserDefined.filter((field: any) => field.key !== 'relation_tags'),
        {
          key: 'relation_tags',
          value: tags.join(',')
        }
      ]

      // Update the contact
      const updateResponse = await fetch(
        `${this.baseUrl}/${contactId}:updateContact?updatePersonFields=userDefined`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userDefined: updatedUserDefined,
            etag: contactData.etag
          }),
        }
      )

      if (!updateResponse.ok) {
        throw new Error('Failed to update contact tags')
      }
    } catch (error) {
      console.error('Error updating contact tags:', error)
      throw error
    }
  }
}

export const googleContactsService = new GoogleContactsService()