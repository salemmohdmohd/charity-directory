// Import necessary hooks and functions from React.
import { useContext, useReducer, createContext, useMemo, useEffect } from "react";
import storeReducer, { initialStore } from "../store"  // Import the reducer and the initial state.
import { categoryService } from "../Services/axios";

// Create a context to hold the global state of the application
// We will call this global state the "store" to avoid confusion while using local states
const StoreContext = createContext()

// Define a provider component that encapsulates the store and warps it in a context provider to
// broadcast the information throught all the app pages and components.
export function StoreProvider({ children }) {
    // Initialize reducer with the initial state.
    const [store, dispatch] = useReducer(storeReducer, initialStore())

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getCategories();
                // The API returns a direct array of categories
                dispatch({ type: 'SET_CATEGORIES', payload: response.data });
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                dispatch({ type: 'SET_ERROR', payload: 'Failed to load categories.' });
            }
        };

        fetchCategories();
    }, [dispatch]);

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(() => ({ store, dispatch }), [store]);

    // Provide the store and dispatch method to all child components.
    return <StoreContext.Provider value={value}>
        {children}
    </StoreContext.Provider>
}

// Custom hook to access the global state and dispatch function.
export default function useGlobalReducer() {
    const { dispatch, store } = useContext(StoreContext)
    return { dispatch, store };
}