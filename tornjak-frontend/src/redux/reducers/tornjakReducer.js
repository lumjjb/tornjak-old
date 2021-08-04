import {
    GLOBAL_MESSAGE,
    GLOBAL_CLICKED_DASHBOARD_TABLE,
    GLOBAL_SELECTED_DASHBOARD_DATA,
} from '../actions/types';

const initialState = {
    globalErrorMessage: "",
    globalClickedDashboardTable: "",
    globalSelectedDashboardData: [],
};

export default function tornjakReducer(state = initialState, action) {
    switch (action.type) {
        case GLOBAL_MESSAGE:
            return {
                ...state,
                globalErrorMessage: action.payload
            };
        case GLOBAL_CLICKED_DASHBOARD_TABLE:
            return {
                ...state,
                globalClickedDashboardTable: action.payload
            };
        case GLOBAL_SELECTED_DASHBOARD_DATA:
            return {
                ...state,
                globalSelectedDashboardData: action.payload
            };
        default:
            return state;
    }
}