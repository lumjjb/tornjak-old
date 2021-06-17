package types

// AgentInfo contains the information about agents workload attestor plugin
type AgentInfo struct {
	Spiffeid string `json:"spiffeid"`
	Plugin   string `json:"plugin"`
}

// AgentInfoList contains the information about agents workload attestor plugin
type AgentInfoList struct {
	Agents []AgentInfo `json:"agents"`
}

// ClusterInfo contains the meta-information about clusters
type ClusterInfo struct {
  Name string `json:"name"`
  Details string `json:"details"`
}

// ClusterInfoList contains the meta-information about clusters
type ClusterInfoList struct {
  Clusters []ClusterInfo `json:"clusters"`
}
