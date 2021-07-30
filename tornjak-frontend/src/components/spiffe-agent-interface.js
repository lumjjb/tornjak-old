import { Component } from 'react';

// TODO Combine spiffe-agent-interface and spiffe-entry-interface to reuse 
// helper functions

function isSuperset(set, subset) {
    for (let elem of subset) {
        if (!set.has(elem)) {
            return false
        }
    }
    return true
}

function formatSelectors (s) {
    return s.type + ":" + s.value;
}

class SpiffeAgentInterface extends Component {
    // TODO: Add validate spiffe ID
    getAgentSpiffeid(agent) {
        return "spiffe://" + agent.id.trust_domain + agent.id.path;
    }

    // getAgentEntries provides an agent and a list of entries and returns
    // the list of entries which are associated with this agent
    getAgentEntries (agent, entries) {
        let nodeEntries = entries.filter(e => e.parent_id.path === "/spire/server")
        let agentSelectors = new Set(agent.selectors.map(formatSelectors))
        let isAssocWithAgent = e => {
            let entrySelectors = new Set(e.selectors.map(formatSelectors))
            return isSuperset(agentSelectors, entrySelectors)
        }

        console.log(nodeEntries.filter(isAssocWithAgent))
        return nodeEntries.filter(isAssocWithAgent)
    }

    // getAgentEntries provides list of agents and a list of entries 
    // and returns a dictionary with the fully qualified spiffe ID (as per 
    // getAgentSpiffeid) as keys, and values being the the list of entries 
    // which are associated with that agent.
    //
    // Note(@lumjjb):
    // Not filtering based on each agent with above helper due to the need to
    // go through all the entries multiple times. Since entries are expected to
    // be more, going through entries in one pass to benefit from locality.
    //
    // There is a potential optimization here by creating a lookup table with
    // the selectors and having a backpointer to the agent with that selector
    // since the association with entries and agent selectors are likely to be 
    // n:1, this would reduce the total cost. This may be useful when 
    // performance is impacted.
    getAgentsEntries (agents, entries) {
        let nodeEntries = entries.filter(e => e.parent_id.path === "/spire/server");
        var lambdas = [];
        var agentEntriesDict = {};

        for (let i=0; i < agents.length; i++) {
            let agent = agents[i];
            let agentId = this.getAgentSpiffeid(agent);
            agentEntriesDict[agentId] = [];

            let agentSelectors = new Set(agent.selectors.map(formatSelectors));
            let isAssocWithAgent = e => {
                let entrySelectors = new Set(e.selectors.map(formatSelectors))
                if (isSuperset(agentSelectors, entrySelectors)) {
                    agentEntriesDict[agentId].push(e);
                }
            };
            lambdas.push(isAssocWithAgent);
        }

        for (let i=0; i < nodeEntries.length; i++) {
            for (let j=0; j < lambdas.length; j++) {
                lambdas[j](nodeEntries[i])
            }
        }

        return agentEntriesDict
    }
}

export default SpiffeAgentInterface;
