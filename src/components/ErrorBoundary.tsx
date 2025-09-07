import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center h-full">
          <div className="panel p-8 text-center max-w-md">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
              <p className="text-secondary-dark mb-4">
                An unexpected error occurred. Please refresh the page or restart the application.
              </p>
              {this.state.error && (
                <details className="text-sm text-muted-dark bg-card-dark p-3 rounded text-left">
                  <summary className="cursor-pointer mb-2">Error Details</summary>
                  <pre className="whitespace-pre-wrap break-words">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
            <button 
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary