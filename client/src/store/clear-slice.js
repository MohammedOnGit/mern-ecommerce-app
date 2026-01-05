// store/clear-slice.js 
import { createSlice } from '@reduxjs/toolkit';

const clearSlice = createSlice({
  name: 'clear',
  initialState: {},
  reducers: {
    clearAllUserData: () => {
      // ⚠️ WARNING: This should NOT clear auth data!
      // This action should only clear non-auth user data
      return {};
    },
    clearNonAuthUserData: () => {
      // NEW: Clear only non-authentication data
      return {};
    }
  }
});

export const { clearAllUserData, clearNonAuthUserData } = clearSlice.actions;
export default clearSlice.reducer;