import { 
    GLOBAL_SERVER_SELECTED, 
    GLOBAL_ENTRIES_LIST, 
    GLOBAL_AGENTS_LIST, 
    GLOBAL_SERVER_INFO,
    GLOBAL_TORNJAK_SERVER_INFO,
    GLOBAL_SERVERS_LIST,
    GLOBAL_SELECTOR_INFO,
 } from './types';


export function serverSelected(globalServerSelected) {
    return dispatch => {
        dispatch({
            type: GLOBAL_SERVER_SELECTED,
            payload: globalServerSelected
        });
    }   
}

export function tornjakServerInfoUpdate(globalTornjakServerInfo) {
    return dispatch => {
        dispatch({
            type: GLOBAL_TORNJAK_SERVER_INFO,
            payload: globalTornjakServerInfo
        });
    }   
}

export function serverInfoUpdate(globalServerInfo) {
    return dispatch => {
        dispatch({
            type: GLOBAL_SERVER_INFO,
            payload: globalServerInfo
        });
    }   
}

export function serversListUpdate(globalServersList) {
    return dispatch => {
        dispatch({
            type: GLOBAL_SERVERS_LIST,
            payload: globalServersList
        });
    }   
}

export function selectorInfo(globalSelectorInfo) {
    return dispatch => {
        dispatch({
            type: GLOBAL_SELECTOR_INFO,
            payload: globalSelectorInfo
        });
    }   
}

export function entriesListUpdate(globalentriesList) {
    return dispatch => {
        dispatch({
            type: GLOBAL_ENTRIES_LIST,
            payload: globalentriesList
        });
    }   
}

export function agentsListUpdate(globalagentsList) {
    return dispatch => {
        dispatch({
            type: GLOBAL_AGENTS_LIST,
            payload: globalagentsList
        });
    }   
}