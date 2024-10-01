import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const HOST = 'http://localhost:3000/';

export const getUserRatings = createAsyncThunk(
    'platform/userRatings',
    async (thunkAPI) => {
        try {
            const response = await axios.get(`${HOST}platform/ratings`);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const getUserRating = createAsyncThunk(
    'platform/userRating',
    async (_id, thunkAPI) => {
        try {
            const response = await axios.get(`${HOST}platform/ratings/${_id}`);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const getRandomFiveStarUserRating = createAsyncThunk(
    'platform/randomFiveStarUserRating',
    async (_, thunkAPI) => {
        try {
            const result = await thunkAPI.dispatch(getUserRatings()).unwrap();
            console.log('User ratings:', result.ratings);

            const topRatings = result.ratings.filter(
                (rating) => rating.rating === 5
            );
            console.log('top ratings:', topRatings);

            if (topRatings.length === 0) {
                return thunkAPI.rejectWithValue('No 5-star ratings found');
            }

            const randomRating = Math.floor(Math.random() * topRatings.length);
            const selectedRating = await thunkAPI
                .dispatch(getUserRating(topRatings[randomRating]._id))
                .unwrap();

            return selectedRating.rating;
        } catch (error) {
            console.error('Error in getRandomFiveStarUserRating:', error);
            return thunkAPI.rejectWithValue(
                error.message || 'Error fetching random rating'
            );
        }
    }
);
