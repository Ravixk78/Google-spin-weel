import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught Error Boundary Catch:", error, errorInfo);
    try { localStorage.clear(); } catch (e) {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-[#FAF8F5] via-[#FFFDF9] to-[#F5F0E6] text-slate-900 font-sans">
          <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-xl border border-amber-200 text-center">
            <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">Majlis Al Oud Rewards</h2>
            <p className="text-xs text-slate-600 mb-6">Application resources updated. Please reload the page.</p>
            <button
              onClick={() => {
                try { localStorage.clear(); } catch (e) {}
                window.location.href = '/?branch=kalba';
              }}
              className="w-full py-3.5 px-6 rounded-full font-bold text-sm bg-gradient-to-r from-[#F9E498] via-[#E6C687] to-[#C5A059] text-slate-950 shadow-md hover:scale-105 transition-transform"
            >
              Reload Reward Wheel App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
