package types

// AgentInfo contains the information about agents workload attestor plugin
type AgentInfo struct {
	Id       string `json:"id"`
	Spiffeid string `json:"spiffeid"`
	Plugin   string `json:"plugin"`
}

// AgentInfoList contains the information about agents workload attestor plugin
type AgentInfoList struct {
	Plugin []AgentInfo `json:"plugin"`
}
