import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: any) {
        // Optionally log to a monitoring service
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? (
                <div style={{ padding: 24 }}>
                    <h2 style={{ fontWeight: 800 }}>حدث خطأ أثناء تحميل الصفحة</h2>
                    <p style={{ opacity: 0.8 }}>يرجى تحديث الصفحة أو الرجوع للخلف.</p>
                </div>
            );
        }
        return this.props.children;
    }
}