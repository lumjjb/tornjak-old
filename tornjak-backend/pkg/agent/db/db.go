package db

import (
	"github.com/lumjjb/tornjak/tornjak-backend/pkg/agent/types"
)

type AgentDB interface {
	CreateAgentEntry(sinfo types.AgentInfo) error
	GetAgents() (types.AgentInfoList, error)
	GetAgentPluginInfo(name string) (types.AgentInfo, error)
	GetClusters() (types.ClusterInfoList, error)
	CreateClusterEntry(cinfo types.ClusterInfo) error
  GetAgentClusterName(spiffeid string) (string, error)
  GetClusterAgents(name string) ([]string, error)
  AssignAgentCluster(spiffeid string, clusterName string) error
}
