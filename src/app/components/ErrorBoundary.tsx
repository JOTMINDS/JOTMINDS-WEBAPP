import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleClearSession = () => {
    try {
      // Clear local temporary assessment and error states
      const keysToClear = Object.keys(localStorage).filter(k => 
        k.startsWith('jotminds_temp_') || 
        k.startsWith('jotminds_assessment_') || 
        k.startsWith('jotminds_active_')
      );
      keysToClear.forEach(k => localStorage.removeItem(k));
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', padding: '2rem',
          fontFamily: 'sans-serif', textAlign: 'center', background: '#f8fafc'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '2.5rem',
            maxWidth: '650px', width: '100%', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧠</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.925rem', lineHeight: '1.5' }}>
              JotMinds encountered an unexpected error. Please try refreshing the page or clearing the temporary session.
            </p>
            
            <pre style={{
              background: '#0f172a', color: '#f8fafc', padding: '1rem',
              borderRadius: '8px', fontSize: '0.75rem', textAlign: 'left',
              overflow: 'auto', width: '100%', maxHeight: '180px', marginBottom: '1.5rem'
            }}>
              {this.state.error?.message || 'Unknown error'}
              {this.state.error?.stack ? `\n\n${this.state.error.stack}` : ''}
            </pre>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#6B4C9A', color: 'white', border: 'none',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
                  transition: 'background 0.2s'
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleClearSession}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600
                }}
              >
                Reset Session & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
