import { createStore, applyMiddleware, compose } from 'redux';
// import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const initialState = {}
const middlware = [thunk]

// //if the brower does not have redux dev tools extension 
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

//create the store
const store = createStore(
  rootReducer,
  initialState,
  composeEnhancers(applyMiddleware(...middlware))
);

export default store;