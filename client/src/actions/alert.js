import { v4 as uuidv4 } from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types'

//action setAlert that will dispatch the type of SET_ALERT to the reducer and add 
//the alert to the state which initially is an empty array
export const setAlert = (msg, alertType, timeout = 5000) => dispatch => {
  //generate random id
  const id = uuidv4();
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id }
  });
  
  //set timeout to remove the alert displayed 
  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id}), timeout);
}