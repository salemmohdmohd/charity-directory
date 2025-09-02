export const initialStore = () => {
  return {
    // UI State
    error: null,
    notification: null,

    // User State
    user: null,
    isAuthenticated: false,

    // Charity Data
    charities: [],
    categories: [
      'Education',
      'Health',
      'Environment',
      'Animals',
      'Poverty',
      'Children',
      'Elderly',
      'Disaster Relief'
    ],

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
        isAuthenticated: false
      };

    // Charity Actions
    case 'SET_CHARITIES':
      return {
        ...store,
        charities: action.payload,
        loading: false
      };

    case 'ADD_CHARITY':
      return {
        ...store,
        charities: [...store.charities, action.payload]
      };

    default:
      throw Error('Unknown action: ' + action.type);
  }
}
