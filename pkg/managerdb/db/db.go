package db

import (
	"github.com/lumjjb/tornjak/pkg/managerdb/types"
)

type ManagerDB interface {
	CreateServerEntry(sinfo types.ServerInfo) error
	GetServers() (types.ServerInfoList, error)
	GetServer(name string) (types.ServerInfo, error)
}
