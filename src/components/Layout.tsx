import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen w-screen flex bg-app-dark text-primary-dark overflow-hidden">
      {children}
    </div>
  )
}

export default Layout