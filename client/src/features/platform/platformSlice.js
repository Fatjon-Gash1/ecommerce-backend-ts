import { createSlice } from '@reduxjs/toolkit';
import {
    getUserRatings,
    getUserRating,
    getRandomFiveStarUserRating,
} from '../../actions/platformActions';

const initialState = {
    ratingLoading: false,
    fullName: '',
    profession: '',
    rating: '',
    review: '',
    date: '',
    ratingError: null,
};

const platformSlice = createSlice({
    name: 'platform',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getRandomFiveStarUserRating.pending, (state) => {
                state.ratingLoading = true;
                state.fullName = '';
                state.profession = '';
                state.rating = '';
                state.review = '';
                state.date = '';
                state.ratingError = null;
            })
            .addCase(getRandomFiveStarUserRating.fulfilled, (state, action) => {
                state.ratingLoading = false;
                state.fullName = `${action.payload.firstName} ${action.payload.lastName}`;
                state.profession = action.payload.userProfession;
                state.rating = action.payload.rating;
                state.review = action.payload.review;
                state.date = action.payload.date;
                state.ratingError = null;
            })
            .addCase(getRandomFiveStarUserRating.rejected, (state, action) => {
                state.ratingLoading = false;
                state.fullName = '';
                state.profession = '';
                state.rating = '';
                state.review = '';
                state.date = '';
                state.ratingError = action.payload || 'Something went wrong';
            });
    },
});
export { getUserRatings, getUserRating, getRandomFiveStarUserRating };
export default platformSlice.reducer;
