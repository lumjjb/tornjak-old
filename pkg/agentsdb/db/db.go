package db

import (
	"github.com/lumjjb/tornjak/pkg/agentsdb/types"
)

type AgentDB interface {
	CreateAgentEntry(sinfo types.SelectorInfo) error
	GetAgents() (types.SelectorInfoList, error)
	GetAgentSelectorInfo(name string) (types.SelectorInfo, error)
}
