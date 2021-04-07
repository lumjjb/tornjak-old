import {
    GLOBAL_SERVER_SELECTED,
    GLOBAL_SERVER_INFO,
    GLOBAL_SERVERS_LIST,
} from '../actions/types';

const initialState = {
    globalServerSelected: "",
    globalServerInfo: [],
    globalServersList: [],
};

export default function serversReducer(state = initialState, action) {
    switch (action.type) {
        case GLOBAL_SERVER_SELECTED:
            return {
                ...state,
                globalServerSelected: action.payload
            };
        case GLOBAL_SERVER_INFO:
            return {
                ...state,
                globalServerInfo: action.payload
            };
        case GLOBAL_SERVERS_LIST:
            return {
                ...state,
                globalServersList: action.payload
            };
        default:
            return state;
    }
}
