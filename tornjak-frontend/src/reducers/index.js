import serversReducer from './serversReducer';
import agentsReducer from './agentsReducer';
import entriesReducer from './entriesReducer';
import {combineReducers} from 'redux';

const allReducers = combineReducers({
    servers : serversReducer,
    agents : agentsReducer,
    entries : entriesReducer,
});

export default allReducers;