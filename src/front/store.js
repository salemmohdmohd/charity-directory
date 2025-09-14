export const initialStore = () => {
  return {
    // UI State
    loading: false,
    error: null,
    notification: null,

    // User State
    user: null,
    isAuthenticated: false,
    userBookmarks: [],
    searchHistory: [],

    // Organization Data
    organizations: [],
    selectedOrganization: null,
    categories: [], // Will be fetched from API

    // Location State
    locations: [],
    selectedLocation: null,
    availableStates: [],

    // Notifications
    notifications: {
      list: [],
      unreadCount: 0,
      preferences: {}
    },

    // Form State
    formErrors: {},

    // Modal State
    modals: {
      isLoginOpen: false,
      isSignupOpen: false,
      isListCharityOpen: false
    }
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    // UI Actions
    case 'SET_LOADING':
      return {
        ...store,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...store,
        error: action.payload
      };

    case 'CLEAR_ERROR':
      return {
        ...store,
        error: null
      };

    case 'SET_NOTIFICATION':
      return {
        ...store,
        notification: action.payload
      };

    case 'CLEAR_NOTIFICATION':
      return {
        ...store,
        notification: null
      };

    // Modal Actions
    case 'TOGGLE_MODAL':
      return {
        ...store,
        modals: {
          ...store.modals,
          [action.payload]: !store.modals[action.payload]
        }
      };

    // User Actions
    case 'SET_USER':
      return {
        ...store,
        user: action.payload,
        isAuthenticated: !!action.payload
      };

    case 'UPDATE_USER':
      return {
        ...store,
        user: action.payload,
        isAuthenticated: !!action.payload
      };

    case 'LOGOUT':
      return {
        ...store,
        user: null,
        isAuthenticated: false,
        userBookmarks: [],
        searchHistory: []
      };

    // Organization Actions
    case 'SET_ORGANIZATIONS':
      return {
        ...store,
        organizations: action.payload,
        loading: false
      };

    case 'SET_SELECTED_ORGANIZATION':
      return {
        ...store,
        selectedOrganization: action.payload,
        loading: false
      };

    case 'ADD_ORGANIZATION':
      return {
        ...store,
        organizations: [...store.organizations, action.payload]
      };

    case 'SET_CATEGORIES':
      return {
        ...store,
        categories: action.payload
      };

    // Location Actions
    case 'SET_LOCATIONS':
      return {
        ...store,
        locations: action.payload
      };

    case 'SET_SELECTED_LOCATION':
      return {
        ...store,
        selectedLocation: action.payload
      };

    case 'SET_AVAILABLE_STATES':
      return {
        ...store,
        availableStates: action.payload
      };

    case 'CLEAR_LOCATION_FILTER':
      return {
        ...store,
        selectedLocation: null
      };

    // User-specific data
    case 'SET_BOOKMARKS':
      return {
        ...store,
        userBookmarks: action.payload
      };

    case 'SET_SEARCH_HISTORY':
      return {
        ...store,
        searchHistory: action.payload
      };

    // Notifications
    case 'SET_NOTIFICATIONS':
      return {
        ...store,
        notifications: {
          ...store.notifications,
          list: action.payload.notifications,
          unreadCount: action.payload.unreadCount || store.notifications.unreadCount
        }
      };

    case 'SET_NOTIFICATION_PREFERENCES':
      return {
        ...store,
        notifications: {
          ...store.notifications,
          preferences: action.payload
        }
      };

    default:
      throw Error('Unknown action: ' + action.type);
  }
}
