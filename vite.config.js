import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    // Load env variables based on the current mode
    const env = loadEnv(mode, process.cwd(), '');

    // Ensure the required environment variable is set
    if (!env.VITE_API_URL) {
        throw new Error('VITE_API_URL is not defined. Please set it in your .env file.');
    }

    return {
        root: 'src/front',
        plugins: [react()],
        server: {
            port: 3000,
            host: '0.0.0.0',  // Required for Docker containers
            proxy: {
                '/api': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, '/api')
                }
            },
            cors: true,  // Enable CORS for development
            strictPort: true,  // Exit if port 3000 is already in use
        },
        build: {
            outDir: '../../dist',
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
            __DEV__: JSON.stringify(mode === 'development'),
            __API_URL__: JSON.stringify(env.VITE_API_URL) // Use the environment variable directly
        },
        optimizeDeps: {
            include: ['react', 'react-dom', 'react-router-dom']
        }
    }
})