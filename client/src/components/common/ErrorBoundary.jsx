import React from 'react';

/**
 * React Error Boundary
 * Catches runtime errors in child component trees and shows a fallback UI.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 *   Or with a custom fallback:
 *   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // Log to console in dev; swap for a real error reporter (e.g. Sentry) in prod
        console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 px-4">
                    <div className="text-center max-w-md">
                        <div className="text-6xl mb-4">😵</div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
                        <p className="text-slate-600 mb-6">
                            An unexpected error occurred. Please try again or go back to the home page.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                                Try Again
                            </button>
                            <a
                                href="/"
                                className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                Go Home
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
