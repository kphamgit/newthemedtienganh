import { type PayloadAction, createSlice } from '@reduxjs/toolkit'

type UserState = 
{
    id?: number | null,
    name: string | null,
    full_name?: string,
    role?: string
    level?: string
    classId?: number
    message?: string
  
};

const initialState:UserState = {name: null}

export const UserSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      //console.log("Setting user in redux:"+action.payload.name)
      state.name = action.payload.name
    },
  },
});

// Action creators are generated for each case reducer function
export const { setUser } = UserSlice.actions

export default UserSlice.reducer
/*

*/