import React from 'react'

type Props = { children: React.ReactNode }
type State = { error?: any }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }
  static getDerivedStateFromError(error: any): State {
    return { error }
  }
  componentDidCatch(err: any, info: any) {
    console.error('ErrorBoundary caught:', err, info)
  }
  render() {
    if (this.state.error) {
      return <pre style={{ padding: 16, color: '#b00', whiteSpace: 'pre-wrap' }}>
        {String(this.state.error?.stack || this.state.error)}
      </pre>
    }
    return this.props.children
  }
}
