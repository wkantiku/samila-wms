import { Component } from 'react';

/**
 * ErrorBoundary — catches React render errors so one module crash
 * does NOT take down the entire app.
 *
 * Usage:
 *   <ErrorBoundary name="Dashboard">
 *     <Dashboard />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // In production, send to monitoring (Sentry, etc.)
    // e.g. Sentry.captureException(error, { extra: info });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { name = 'Module' } = this.props;
    return (
      <div className="eb-wrapper">
        <div className="eb-box">
          <div className="eb-icon">⚠️</div>
          <h2 className="eb-title">{name} เกิดข้อผิดพลาด</h2>
          <p className="eb-msg">
            {this.state.error?.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด'}
          </p>
          <button
            className="eb-reload"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            🔄 ลองอีกครั้ง
          </button>
        </div>
        <style>{`
          .eb-wrapper{display:flex;align-items:center;justify-content:center;min-height:300px;padding:40px;}
          .eb-box{background:rgba(255,107,107,0.07);border:1px solid rgba(255,107,107,0.25);border-radius:12px;padding:36px 40px;text-align:center;max-width:480px;}
          .eb-icon{font-size:40px;margin-bottom:14px;}
          .eb-title{color:#FF8888;font-size:18px;font-weight:700;margin:0 0 10px;}
          .eb-msg{color:#7a9fb5;font-size:13px;margin:0 0 20px;line-height:1.6;}
          .eb-reload{padding:10px 24px;background:rgba(255,107,107,0.15);border:1px solid rgba(255,107,107,0.3);border-radius:6px;color:#FF8888;font-size:13px;font-weight:700;cursor:pointer;}
          .eb-reload:hover{background:rgba(255,107,107,0.25);}
        `}</style>
      </div>
    );
  }
}

export default ErrorBoundary;
