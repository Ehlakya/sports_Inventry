import { createSlice } from '@reduxjs/toolkit';

// Read initial state from localStorage if it exists
const initialToken = localStorage.getItem('accessToken') || null;
const initialRefreshToken = localStorage.getItem('refreshToken') || null;
const initialRole = localStorage.getItem('userRole') || null;
let initialUser = null;

try {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    initialUser = JSON.parse(userStr);
  }
} catch (e) {
  console.error('Error parsing user from localStorage:', e);
}

const initialState = {
  user: initialUser,
  accessToken: initialToken,
  refreshToken: initialRefreshToken,
  role: initialRole,
  isAuthenticated: !!initialToken,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.loading = false;
      state.isAuthenticated = true;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.role = user.role;
      state.error = null;

      // Sync with localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('user', JSON.stringify(user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
