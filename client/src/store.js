import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import productReducer from './features/product/productSlice';
import platformReducer from './features/platform/platformSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        product: productReducer,
        platform: platformReducer,
    },
});

export default store;
