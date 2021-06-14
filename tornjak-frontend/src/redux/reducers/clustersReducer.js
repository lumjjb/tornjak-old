import {
    GLOBAL_CLUSTERS_LIST,
} from '../actions/types';

const initialState = {
    globalClustersList: [],
};

export default function clustersReducer(state = initialState, action) {
    switch (action.type) {
        case GLOBAL_CLUSTERS_LIST:
            return {
                ...state,
                globalAgentsList: action.payload
            };
        default:
            return state;
    }
}