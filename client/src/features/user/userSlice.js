import { createSlice } from '@reduxjs/toolkit';
import {
    registerUser,
    checkUsernameAvailability,
    checkEmailAvailability,
} from '../../actions/userActions';

const initialState = {
    usernameLoading: false,
    emailLoading: false,
    loadingRegistration: false,
    usernameAvailable: null,
    usernameMessage: '',
    emailAvailable: null,
    emailMessage: '',
    error: null,
    userInfo: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        resetUsernameAvailability: (state) => {
            state.usernameLoading = false;
            state.usernameAvailable = null;
            state.usernameMessage = '';
            state.error = null;
        },
        resetEmailAvailability: (state) => {
            state.emailLoading = false;
            state.emailAvailable = null;
            state.emailMessage = '';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loadingRegistration = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loadingRegistration = false;
                state.userInfo = action.payload;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loadingRegistration = false;
                state.error = action.payload;
            })
            .addCase(checkUsernameAvailability.pending, (state) => {
                state.usernameLoading = true;
                state.usernameAvailable = null;
                state.usernameMessage = '';
                state.error = null;
            })
            .addCase(checkUsernameAvailability.fulfilled, (state, action) => {
                state.usernameLoading = false;
                state.usernameAvailable = action.payload.available;
                state.usernameMessage = action.payload.message;
                state.error = null;
            })
            .addCase(checkUsernameAvailability.rejected, (state, action) => {
                state.usernameLoading = false;
                state.usernameAvailable = null;
                state.usernameMessage = '';
                state.error = action.payload || 'Something went wrong';
            })
            .addCase(checkEmailAvailability.pending, (state) => {
                state.emailLoading = true;
                state.emailAvailable = null;
                state.emailMessage = '';
                state.error = null;
            })
            .addCase(checkEmailAvailability.fulfilled, (state, action) => {
                state.emailLoading = false;
                state.emailAvailable = action.payload.available;
                state.emailMessage = action.payload.message;
                state.error = null;
            })
            .addCase(checkEmailAvailability.rejected, (state, action) => {
                state.emailLoading = false;
                state.emailAvailable = null;
                state.emailMessage = '';
                state.error = action.payload || 'Something went wrong';
            });
    },
});
export { registerUser, checkUsernameAvailability, checkEmailAvailability };
export const { resetUsernameAvailability, resetEmailAvailability } =
    userSlice.actions;
export default userSlice.reducer;
