import {
    GLOBAL_SERVER_SELECTED,
    GLOBAL_ENTRIES_LIST,
    GLOBAL_AGENTS_LIST,
    GLOBAL_SERVER_INFO,
    GLOBAL_TORNJAK_SERVER_INFO,
    GLOBAL_SERVERS_LIST,
    GLOBAL_SELECTOR_INFO,
    GLOBAL_MESSEGE,
} from './types';

//Expected input - "Error Messege/ Success Messege"
//Function - Sets the Error Messege/ Success Messege of an executed function
export function tornjakMessege(globalErrorMessege) {
    return dispatch => {
        dispatch({
            type: GLOBAL_MESSEGE,
            payload: globalErrorMessege
        });
    }
}

//Expected input - "ServerName"
//Function - Sets the server selected in the redux state
export function serverSelected(globalServerSelected) {
    return dispatch => {
        dispatch({
            type: GLOBAL_SERVER_SELECTED,
            payload: globalServerSelected
        });
    }
}

//Expected input - "TornjakServerInfo" [Saved as a large String]
//Function - Sets the torjak server info of the selected server
export function tornjakServerInfoUpdate(globalTornjakServerInfo) {
    return dispatch => {
        dispatch({
            type: GLOBAL_TORNJAK_SERVER_INFO,
            payload: globalTornjakServerInfo
        });
    }
}

//Expected input - 
// {
//     "data": 
//     {
//       "trustDomain": trustDomain,
//       "nodeAttestorPlugin": nodeAttestorPlugin
//     }
// }
//Function - Sets the server trust domain and nodeAttestorPlugin
export function serverInfoUpdate(globalServerInfo) {
    return dispatch => {
        dispatch({
            type: GLOBAL_SERVER_INFO,
            payload: globalServerInfo
        });
    }
}

//Expected input - 
// [
//     "server1": 
//     {
//       "name": Server1Name,
//       "address": Server1Address,
//       "tls": false/true,
//       "mtls": false/true,
//     },
//     "server2": 
//     {
//       "name": Server2Name,
//       "address": Server2Address,
//       "tls": false/true,
//       "mtls": false/true,
//     }
// ]
//Function - Sets the list of available servers and their basic info
export function serversListUpdate(globalServersList) {
    return dispatch => {
        dispatch({
            type: GLOBAL_SERVERS_LIST,
            payload: globalServersList
        });
    }
}

//Expected input - 
//[
// "selector1": [
//     {
//       "label": "selector1:...."
//     },
//     {
//       "label": "selector1:...."
//     },
//   ],
//   "selector2": [
//     {
//       "label": "selector2:...."
//     },
//     {
//       "label": "selector2:...."
//     },
//   ]
//]
//Function - Sets the list of available selectors and their options
export function selectorInfo(globalSelectorInfo) {
    return dispatch => {
        dispatch({
            type: GLOBAL_SELECTOR_INFO,
            payload: globalSelectorInfo
        });
    }
}

//Expected input - List of entries with their info
//json representation from SPIFFE golang documentation - https://github.com/spiffe/spire/blob/v0.12.0/proto/spire/types/entry.pb.go#L28-L67
//Function - Sets/ updates the list of entries with their info
export function entriesListUpdate(globalentriesList) {
    return dispatch => {
        dispatch({
            type: GLOBAL_ENTRIES_LIST,
            payload: globalentriesList
        });
    }
}

//Expected input - List of agents with their info
//json representation from SPIFFE golang documentation - https://github.com/spiffe/spire/blob/v0.12.0/proto/spire/types/agent.pb.go#L28-L45
//Function - Sets/ updates the list of agents with their info
export function agentsListUpdate(globalagentsList) {
    return dispatch => {
        dispatch({
            type: GLOBAL_AGENTS_LIST,
            payload: globalagentsList
        });
    }
}