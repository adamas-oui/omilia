import {
  REGISTER_SUCCESS,
  REGISTER_FAIL
} from '../actions/types';

const initialState = {
  //store the token in local storage
  token: localStorage.getItem('token'),
  //auth by default 
  isAuthenticated: null,
  //make sure the loading of a user is finished; set to false after finished 
  loading: true,
  user: null
}

export default function(state = initialState, action){
  const { type, payload } = action;
  switch(type){
    case REGISTER_SUCCESS:
      localStorage.setItem('token', payload.token);
      return {
        ...state, 
        ...payload,
        isAuthenticated:true,
        loading: false
      }
    case REGISTER_FAIL:
      localStorage.removeItem('token');
      return {
        ...state, 
        token: null,
        isAuthenticated: false,
        loading: false
      }
    default: 
      return state;
  }
}