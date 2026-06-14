import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', padding: '2rem',
          fontFamily: 'sans-serif', textAlign: 'center', background: '#f8fafc'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#64748b', marginBottom: '1rem', maxWidth: '400px' }}>
            JotMinds encountered an unexpected error. Please try refreshing the page.
          </p>
          <pre style={{
            background: '#1e293b', color: '#f1f5f9', padding: '1rem',
            borderRadius: '8px', fontSize: '0.75rem', textAlign: 'left',
            maxWidth: '600px', overflow: 'auto', width: '100%'
          }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5rem', padding: '0.75rem 1.5rem',
              background: '#6B4C9A', color: 'white', border: 'none',
              borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
