import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const HOST = 'http://localhost:3000/';

export const registerUser = createAsyncThunk(
    'user/registerUser',
    async (userData, thunkAPI) => {
        try {
            const response = await axios.post(`${HOST}users`, userData);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const checkUsernameAvailability = createAsyncThunk(
    'user/checkUsernameAvailability',
    async (username, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${HOST}users/check-availability`,
                {
                    params: { username },
                }
            );
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data.message);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

export const checkEmailAvailability = createAsyncThunk(
    'user/checkEmailAvailability',
    async (email, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${HOST}users/check-availability`,
                {
                    params: { email },
                }
            );
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data.message);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);
