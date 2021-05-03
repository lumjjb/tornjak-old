import {
    GLOBAL_AGENTS_LIST,
    GLOBAL_AGENTS_WORKLOADATTESTOR_INFO,
} from '../actions/types';

const initialState = {
    globalagentsList: [],
    globalagentsworkloadattestorinfo: [],
};

export default function agentsReducer(state = initialState, action) {
    switch (action.type) {
        case GLOBAL_AGENTS_LIST:
            return {
                ...state,
                globalagentsList: action.payload
            };
        case GLOBAL_AGENTS_WORKLOADATTESTOR_INFO:
            return {
                ...state,
                globalagentsworkloadattestorinfo: action.payload
            };
        default:
            return state;
    }
}