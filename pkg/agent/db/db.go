package db

import (
	"github.com/lumjjb/tornjak/pkg/agent/types"
)

type AgentDB interface {
	CreateAgentEntry(sinfo types.SelectorInfo) error
	GetAgents() (types.SelectorInfoList, error)
	GetAgentSelectorInfo(name string) (types.SelectorInfo, error)
}
