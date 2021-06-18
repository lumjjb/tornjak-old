package types

import (
  "encoding/json"
)

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
// TODO include details field for extra info/tags in json format (probably a byte array)
type ClusterInfo struct {
  Name string `json:"name"`
  DomainName string `json:"domainName"`
  ManagedBy string `json:"managedBy"`
  Platform string `json:"platform"`
  AgentsList []string `json:"agentsList"`
}

// ClusterInfoList contains the meta-information about clusters
type ClusterInfoList struct {
  Clusters []ClusterInfo `json:"clusters"`
}
