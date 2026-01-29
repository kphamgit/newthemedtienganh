import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const initialState: { value: string | null; } = {
  value: null,
}
export const userSlice = createSlice({
  name: 'liveQuizId',
  initialState,
  reducers: {
 // payload is expected to be a string
    setValue: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    }, 
    reset: (state) => {
      state.value = null;
    }
  },
});

export const { setValue, reset } = userSlice.actions;
export default userSlice.reducer;