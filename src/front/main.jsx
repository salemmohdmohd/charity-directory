import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'  // Global styles for your application
import { RouterProvider } from "react-router-dom";  // Import RouterProvider to use the router
import { HelmetProvider } from 'react-helmet-async';  // Import HelmetProvider for SEO
import { router } from "./routes";  // Import the router configuration
import { StoreProvider } from './hooks/useGlobalReducer';  // Import the StoreProvider for global state management
import AuthProvider from './components/AuthProvider';  // Import the AuthProvider for authentication initialization

const Main = () => {
    return (
        <React.StrictMode>
            {/* Provide SEO capabilities to all components */}
            <HelmetProvider>
                {/* Provide global state to all components */}
                <StoreProvider>
                    {/* Initialize authentication state */}
                    <AuthProvider>
                        {/* Set up routing for the application */}
                        <RouterProvider router={router}>
                        </RouterProvider>
                    </AuthProvider>
                </StoreProvider>
            </HelmetProvider>
        </React.StrictMode>
    );
}

// Render the Main component into the root DOM element.
ReactDOM.createRoot(document.getElementById('root')).render(<Main />)
