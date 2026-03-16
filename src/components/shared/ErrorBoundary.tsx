/**
 * ENG-029: React error boundary — catches render crashes and shows a friendly recovery screen.
 */

import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught render error:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
            padding: 16,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 24,
              maxWidth: 400,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              textAlign: 'center',
            }}
          >
            <div
              aria-hidden
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#4A90D9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
              }}
            >
              🧙
            </div>
            <h2 style={{ margin: 0, fontSize: 20, color: '#2C3E50' }}>
              Oops! Something went wrong with the workspace.
            </h2>
            <p style={{ margin: 0, fontSize: 15, color: '#555', lineHeight: 1.5 }}>
              Don't worry — your progress has been saved. Let's try again!
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                minWidth: 44,
                minHeight: 44,
                padding: '12px 32px',
                fontSize: 16,
                fontWeight: 600,
                color: '#fff',
                backgroundColor: '#4A90D9',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(74,144,217,0.3)',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
