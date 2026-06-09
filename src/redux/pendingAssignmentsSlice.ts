import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Assignment {
  assignment_id: number;
  quiz_id: number;
  quiz_name: string;
  category_id: number;
  assigned_at: string;
}

interface PendingAssignmentsState {
  assignments: Assignment[];
}

const initialState: PendingAssignmentsState = { assignments: [] };

export const pendingAssignmentsSlice = createSlice({
  name: 'pendingAssignments',
  initialState,
  reducers: {
    setPendingAssignments: (state, action: PayloadAction<Assignment[]>) => {
      state.assignments = action.payload;
    },
    removeAssignment: (state, action: PayloadAction<number>) => {
      state.assignments = state.assignments.filter(a => a.quiz_id !== action.payload);
    },
    clearPendingAssignments: (state) => {
      state.assignments = [];
    },
  },
});

export const { setPendingAssignments, removeAssignment, clearPendingAssignments } = pendingAssignmentsSlice.actions;
export default pendingAssignmentsSlice.reducer;
