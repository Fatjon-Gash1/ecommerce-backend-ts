import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import productReducer from './features/product/productSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        product: productReducer,
    },
});

export default store;
