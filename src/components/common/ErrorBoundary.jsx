import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[SpeakBetter] UI error:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50 p-6 text-center dark:bg-slate-950">
        <div className="max-w-sm">
          <p className="text-4xl" aria-hidden="true">😕</p>
          <h1 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Sorry about that. Your progress is saved on this device. Try reloading the page.</p>
          <button type="button" onClick={() => window.location.assign('/')} className="mt-5 h-11 rounded-xl bg-indigo-600 px-5 font-semibold text-white">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }
}
