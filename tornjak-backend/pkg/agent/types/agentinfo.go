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
