package types

// ClusterInfo contains the meta-information about clusters
// TODO include details field for extra info/tags in json format (probably a byte array)
type ClusterInfo struct {
	Name         string   `json:"name"`
	DomainName   string   `json:"domainName"`
	ManagedBy    string   `json:"managedBy"`
	PlatformType string   `json:"platformType"`
	AgentsList   []string `json:"agentsList"`
}

// ClusterInfoList contains the meta-information about clusters
type ClusterInfoList []ClusterInfo
