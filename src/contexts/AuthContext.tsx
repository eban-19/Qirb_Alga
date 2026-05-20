import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';

// Types
interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'user' | 'manager' | 'owner' | 'customer';
  created_at: string;
  approved?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<any>;
  otpLogin: (phone: string, code: string, fullName?: string) => Promise<any>;
  register: (userData: RegisterData) => Promise<any>;
  logout: () => Promise<void>;
  clearError: () => void;
  isAdmin: () => boolean;
  isPensionOwner: () => boolean;
  isUser: () => boolean;
  updateProfile: (profileData: any) => Promise<any>;
  changePassword: (passwords: any) => Promise<any>;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  message?: string;
}

// Auth action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
} as const;

type AuthAction = 
  | { type: typeof AUTH_ACTIONS.LOGIN_START }
  | { type: typeof AUTH_ACTIONS.LOGIN_SUCCESS; payload: { user: User; token: string } }
  | { type: typeof AUTH_ACTIONS.LOGIN_FAILURE; payload: string }
  | { type: typeof AUTH_ACTIONS.LOGOUT }
  | { type: typeof AUTH_ACTIONS.REGISTER_START }
  | { type: typeof AUTH_ACTIONS.REGISTER_SUCCESS; payload: { user: User; token: string } }
  | { type: typeof AUTH_ACTIONS.REGISTER_FAILURE; payload: string }
  | { type: typeof AUTH_ACTIONS.LOAD_USER_START }
  | { type: typeof AUTH_ACTIONS.LOAD_USER_SUCCESS; payload: { user: User; token: string } }
  | { type: typeof AUTH_ACTIONS.LOAD_USER_FAILURE; payload: string }
  | { type: typeof AUTH_ACTIONS.UPDATE_USER; payload: User }
  | { type: typeof AUTH_ACTIONS.CLEAR_ERROR };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
      if (action.payload.user) {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.user,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      if (action.payload.user) {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        return {
          ...state,
          user: action.payload.user,
          token: action.payload.token,
          isAuthenticated: true,
          loading: false,
          error: null,
        };
      } else {
        return {
          ...state,
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        };
      }

    case AUTH_ACTIONS.UPDATE_USER:
      localStorage.setItem('user', JSON.stringify(action.payload));
      return {
        ...state,
        user: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          // Verify token with API
          const response: ApiResponse = await apiService.getProfile();
          if (response.success && response.data) {
            dispatch({
              type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
              payload: {
                user: response.data.user,
                token,
              },
            });
          } else {
            // Token invalid, clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({
              type: AUTH_ACTIONS.LOAD_USER_FAILURE,
              payload: 'Session expired',
            });
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_FAILURE,
            payload: 'Session expired',
          });
        }
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: {
            user: null,
            token: '',
          },
        });
      }
    };

    loadUser();
  }, []);

  // Login action
  const login = async (email: string, password: string): Promise<ApiResponse> => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response: ApiResponse = await apiService.login(email, password);

      if (response.success && response.data) {
        // Mark user as approved in localStorage for future suspension detection
        const key = `user_${email}_approved`;
        localStorage.setItem(key, 'true');
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        });
        return response;
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: response.message || 'Login failed',
        });
        return response;
      }
    } catch (error: any) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || 'Login failed',
      });
      throw error;
    }
  };

  // OTP Login action
  const otpLogin = async (phone: string, code: string, fullName?: string): Promise<ApiResponse> => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response: ApiResponse = await apiService.otpLogin(phone, code, fullName);

      if (response.success && response.data) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        });
        return response;
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: response.message || 'OTP Login failed',
        });
        return response;
      }
    } catch (error: any) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || 'OTP Login failed',
      });
      throw error;
    }
  };

  // Register action
  const register = async (userData: RegisterData): Promise<ApiResponse> => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const response: ApiResponse = await apiService.register(userData);

      if (response.success && response.data) {
        // If registration returned a token (auto-login for pension owners)
        if (response.data.token) {
          dispatch({
            type: AUTH_ACTIONS.REGISTER_SUCCESS,
            payload: {
              user: response.data.user,
              token: response.data.token,
            },
          });
          return response;
        } else {
          // For regular users who need admin approval
          dispatch({
            type: AUTH_ACTIONS.REGISTER_FAILURE,
            payload: 'Registration successful. Please wait for admin approval.',
          });
          return response;
        }
      } else {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_FAILURE,
          payload: response.message || 'Registration failed',
        });
        return response;
      }
    } catch (error: any) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: error.message || 'Registration failed',
      });
      throw error;
    }
  };

  // Logout action
  const logout = async () => {
    try {
      // Call API logout (don't log failure since we proceed with local cleanup anyway)
      await apiService.logout();
    } catch {
      // Ignore API failure and proceed with local logout
    }
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Dispatch logout action
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Clear error action
  const clearError = (): void => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check user role
  const isAdmin = (): boolean => {
    return state.user?.role === 'admin';
  };

  const isPensionOwner = (): boolean => {
    return state.user?.role?.toLowerCase() === 'owner' || state.user?.role?.toLowerCase() === 'user' || state.user?.role?.toLowerCase() === 'manager';
  };

  const isUser = (): boolean => {
    return state.user?.role === 'user';
  };

  const updateProfile = async (profileData: any) => {
    try {
      if (!state.user) throw new Error('Not authenticated');
      const response = await apiService.updateUserProfile(state.user.id, profileData);
      if (response.success) {
        // Fetch fresh profile data to ensure local state matches backend exactly
        const profileRes = await apiService.getProfile();
        if (profileRes.success && profileRes.data) {
          dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: profileRes.data.user });
        } else {
          // Fallback if getProfile fails
          const updatedUser = { ...state.user, ...profileData };
          dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: updatedUser });
        }
        return response;
      }
      throw new Error(response.message || 'Update failed');
    } catch (error: any) {
      throw error;
    }
  };

  const changePassword = async (passwords: any) => {
    try {
      const response = await apiService.changePassword(passwords.currentPassword, passwords.newPassword);
      if (response.success) return response;
      throw new Error(response.message || 'Password change failed');
    } catch (error: any) {
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    otpLogin,
    register,
    logout,
    clearError,
    isAdmin,
    isPensionOwner,
    isUser,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
