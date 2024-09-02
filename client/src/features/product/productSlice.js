import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    products: [],
};

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setProducts(state, action) {
            state.products = action.payload;
        },
        clearProducts(state) {
            state.products = [];
        },
    },
});

export const { setProducts, clearProducts } = productSlice.actions;
export default productSlice.reducer;
