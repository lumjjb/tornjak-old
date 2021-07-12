package types

// AgentInfo contains the information about agents workload attestor plugin
type AgentInfo struct {
	Spiffeid string `json:"spiffeid"`
	Plugin   string `json:"plugin"`
	Cluster  string `json:"cluster"`
}

// AgentInfoList contains the information about agents workload attestor plugin
type AgentInfoList struct {
	Agents []AgentInfo `json:"agents"`
}

// AgentEntries contains agent spiffeid and list of spiffeids of Entries
type AgentEntries struct {
	Spiffeid    string   `json:"spiffeid"`
	EntriesList []string `json:"entriesList"`
}

type AllAgentEntries struct {
	Agents []AgentEntries `json:"agents"`
}
