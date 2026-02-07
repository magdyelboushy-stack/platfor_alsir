import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        include: [
            'zustand',
            'clsx',
            'react-is',
            'use-sync-external-store/shim/with-selector'
        ]
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api': {
                target: 'http://localhost:8001',
                changeOrigin: true,
                secure: false,
            },
            '/avatars': {
                target: 'http://localhost:8001',
                changeOrigin: true,
                secure: false,
            },
            '/thumbnails': {
                target: 'http://localhost:8001',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-ui': ['framer-motion', 'lucide-react', 'clsx'],
                    'vendor-utils': ['axios', 'zustand', 'immer'],
                    'vendor-charts': ['recharts'],
                    'vendor-video': ['hls.js'],
                }
            }
        }
    },
});
