import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        users: [],
    },
    reducers: {
        registerUser: (state, action) => {
            state.users.push(action.payload);
        },
    },
});

export const { registerUser } = userSlice.actions;
export default userSlice.reducer;
