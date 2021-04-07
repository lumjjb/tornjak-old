import {
    GLOBAL_SERVER_SELECTED,
    GLOBAL_SERVER_INFO,
} from '../actions/types';

const initialState = {
    globalServerSelected: "",
    globalServerInfo: [],
};

export default function serverReducer(state = initialState, action) {
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
        default:
            return state;
    }
}
