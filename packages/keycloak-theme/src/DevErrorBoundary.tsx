import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class DevErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[keycloak-theme dev]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            margin: 24,
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
            background: '#1a1a1a',
            color: '#f5f5f5',
            borderRadius: 8,
          }}
        >
          <h1 style={{ marginTop: 0 }}>Theme failed to render</h1>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#fca5a5' }}>
            {this.state.error.message}
          </pre>
          <p style={{ color: '#a3a3a3' }}>
            Check the browser console for the full stack trace.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
