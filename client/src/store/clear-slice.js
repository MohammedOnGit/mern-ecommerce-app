import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cleared: false
};

const clearSlice = createSlice({
  name: "clear",
  initialState,
  reducers: {
    clearAllUserData: (state) => {
      // This action is dispatched to trigger clearing in other reducers
      state.cleared = !state.cleared; // Toggle to trigger
    },
    resetClearState: (state) => {
      state.cleared = false;
    }
  }
});

export const { clearAllUserData, resetClearState } = clearSlice.actions;
export default clearSlice.reducer;