import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Define the type for a single user
interface ConnectedUserProps {
  id: number;
  name: string;
  live_question_number?: string;
  live_score?: number;
  total_score?: number;
}

// Define the initial state type
interface ConnectedUsersState {
  list: ConnectedUserProps[];
}

// Initial state
const initialState: ConnectedUsersState = {
  list: [], // Start with an empty array of users
};

// Create the slice
const connectedUsersSlice = createSlice({
  name: 'connectedUsers',
  initialState,
  reducers: {
    // Reducer to add a user to the list
    addUser: (state, action: PayloadAction<ConnectedUserProps>) => {
     //console.log('Current state:', JSON.parse(JSON.stringify(state)));
     //console.log("connectedUsersSlice: Adding user:", action.payload);
      state.list.push(action.payload); // Add the new user to the list
      //console.log("connectedUsersSlice: Adding user:", action.payload);
     //console.log('Updated state:', JSON.parse(JSON.stringify(state)));
    },
    removeUser: (state, action: PayloadAction<string>) => { 
        //console.log("connectedUsersSlice: Removing user with name:", action.payload);
        //console.log('Current state before removal:', JSON.parse(JSON.stringify(state)));
        state.list = state.list.filter(user => user.name !== action.payload);
        //onsole.log('Updated state after removal:', JSON.parse(JSON.stringify(state)));
    },
    updateLiveScore: (state, action: PayloadAction<{name: string, live_score: number}>) => {
       //console.log("connectedUsersSlice: Updating live score for user:", action.payload);
        const { name, live_score } = action.payload;
        const user = state.list.find(user => user.name === name);
        if (user) {
           //console.log("connectedUsersSlice: Found user. Updating live score to:", live_score);
            user.live_score = live_score;
        }
        // update total score as well
        if (user) {
         //console.log("connectedUsersSlice: before updating,  total score =", user.total_score);
         //console.log("connectedUsersSlice: live score to add =", live_score);
            user.total_score = (user.total_score || 0) + live_score;
           //console.log("connectedUsersSlice: After Updated,  total score is:", user.total_score);
        }
    },
    updateLiveQuestionNumber: (state, action: PayloadAction<{name: string, question_number: string}>) => {
       //console.log("connectedUsersSlice: Updating question number for user:", action.payload);
        const { name, question_number } = action.payload;
        const user = state.list.find(user => user.name === name);
        if (user) {
           //console.log("connectedUsersSlice: Found user. Updating question number to:", question_number);
            user.live_question_number = question_number;
            // also reset live score when question number is updated
            user.live_score = 0;
        }
    },
    clear: (state) => {
        state.list = [];
    },
   
  },
});

// Export the actions
export const { addUser, removeUser , updateLiveScore, updateLiveQuestionNumber, clear} = connectedUsersSlice.actions;

// Export the reducer
export default connectedUsersSlice.reducer;

/*
 clearLiveTotalScores: (state) => {
      console.log("connectedUsersSlice: Clearing total scores for all users.");
      state.list.forEach(user => {
        user.total_score = 0;
      });
    }
*/
