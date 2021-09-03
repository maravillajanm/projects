import { combineReducers } from 'redux';
import { productReducer, selectedProductReducer } from "./producteReducer"

const reducers = combineReducers(
    {
        allProducts: productReducer,
        product: selectedProductReducer,
    }
)

export default reducers;