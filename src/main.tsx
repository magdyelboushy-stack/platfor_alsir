// ============================================================
// App Entry Point
// ============================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './app/App';
import './styles/colors.css';
import './styles/globals.css';

// Create React Query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    },
});

import { HelmetProvider } from 'react-helmet-async';

// Render app
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <App />
                </BrowserRouter>
            </QueryClientProvider>
        </HelmetProvider>
    </StrictMode>
);
