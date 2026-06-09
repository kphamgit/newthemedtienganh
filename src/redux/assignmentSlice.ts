import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AssignmentState {
  message: string | null;
  targetUser: string | null;
}

const initialState: AssignmentState = {
  message: null,
  targetUser: null,
};

export const assignmentSlice = createSlice({
  name: 'assignment',
  initialState,
  reducers: {
    setAssignment: (state, action: PayloadAction<{ message: string; targetUser: string }>) => {
      state.message = action.payload.message;
      state.targetUser = action.payload.targetUser;
    },
    clearAssignment: (state) => {
      state.message = null;
      state.targetUser = null;
    },
  },
});

export const { setAssignment, clearAssignment } = assignmentSlice.actions;
export default assignmentSlice.reducer;
