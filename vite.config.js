import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        host: '0.0.0.0',  // Required for Docker containers
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
                ws: true,  // Enable WebSocket proxying
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                }
            }
        },
        cors: true,  // Enable CORS for development
        strictPort: true,  // Exit if port 3000 is already in use
    },
    build: {
        outDir: 'dist',
        sourcemap: true,  // Generate source maps for debugging
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    router: ['react-router-dom']
                }
            }
        }
    },
    define: {
        // Define environment variables for the frontend
        __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
        __API_URL__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000')
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom']
    }
})