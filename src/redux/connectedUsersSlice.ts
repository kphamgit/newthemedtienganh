import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Define the type for a single user
interface User {
  id: number;
  name: string;
}

// Define the initial state type
interface ConnectedUsersState {
  list: User[];
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
    addUser: (state, action: PayloadAction<User>) => {
      console.log('Current state:', JSON.parse(JSON.stringify(state)));
      console.log("connectedUsersSlice: Adding user:", action.payload);
      state.list.push(action.payload); // Add the new user to the list
      //console.log("connectedUsersSlice: Adding user:", action.payload);
      console.log('Updated state:', JSON.parse(JSON.stringify(state)));
    },
    removeUser: (state, action: PayloadAction<string>) => { 
        //console.log("connectedUsersSlice: Removing user with name:", action.payload);
        //console.log('Current state before removal:', JSON.parse(JSON.stringify(state)));
        state.list = state.list.filter(user => user.name !== action.payload);
        //onsole.log('Updated state after removal:', JSON.parse(JSON.stringify(state)));
    },
    clear: (state) => {
        state.list = [];
    }
  },
});

// Export the actions
export const { addUser, removeUser , clear} = connectedUsersSlice.actions;

// Export the reducer
export default connectedUsersSlice.reducer;