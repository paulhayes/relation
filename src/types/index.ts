export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  tags: string[]
  avatar?: string
  position?: [number, number, number]
}

export interface Tag {
  name: string
  color: string
  visible: boolean
  count: number
}

export interface GoogleAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

export interface GoogleContact {
  resourceName: string
  names?: Array<{
    displayName: string
    givenName?: string
    familyName?: string
  }>
  emailAddresses?: Array<{
    value: string
    type?: string
  }>
  phoneNumbers?: Array<{
    value: string
    type?: string
  }>
  userDefined?: Array<{
    key: string
    value: string
  }>
}