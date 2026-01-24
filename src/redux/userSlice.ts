import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const initialState: { name: string | null; isLoggedIn: boolean } = {
  name: null,
  isLoggedIn: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
 // payload is expected to be a string
    setUser: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
      state.isLoggedIn = true;
    }, 
    logout: (state) => {
      state.name = null;
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;