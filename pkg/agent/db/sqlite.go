package db

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"

	"github.com/lumjjb/tornjak/pkg/agent/types"
)

const (
	initAgentsTable = "CREATE TABLE IF NOT EXISTS agents (agentid TEXT PRIMARY KEY, spiffeid TEXT, plugin TEXT)" //creates agentdb with fields agentid, spiffeid and plugin
)

type LocalSqliteDb struct {
	database *sql.DB
}

func NewLocalSqliteDB(dbpath string) (AgentDB, error) {
	database, err := sql.Open("sqlite3", dbpath)
	if err != nil {
		return nil, errors.New("Unable to open connection to DB")
	}

	// Table for workload selectors
	statement, err := database.Prepare(initAgentsTable)
	if err != nil {
		return nil, errors.Errorf("Unable to execute SQL query :%v", initAgentsTable)
	}
	_, err = statement.Exec()
	if err != nil {
		return nil, errors.Errorf("Unable to execute SQL query :%v", initAgentsTable)
	}

	return &LocalSqliteDb{
		database: database,
	}, nil
}

func (db *LocalSqliteDb) CreateAgentEntry(sinfo types.AgentInfo) error {
	statement, err := db.database.Prepare("INSERT OR REPLACE INTO agents (agentid, spiffeid, plugin) VALUES (?,?,?)")
	if err != nil {
		return errors.Errorf("Unable to execute SQL query: %v", err)
	}
	_, err = statement.Exec(sinfo.Id, sinfo.Spiffeid, sinfo.Plugin)

	return err
}

func (db *LocalSqliteDb) GetAgents() (types.AgentInfoList, error) {
	rows, err := db.database.Query("SELECT agentid, spiffeid, plugin FROM agents")
	if err != nil {
		return types.AgentInfoList{}, errors.New("Unable to execute SQL query")
	}

	sinfos := []types.AgentInfo{}
	var (
		id       string
		spiffeid string
		plugin   string
	)
	for rows.Next() {
		if err = rows.Scan(&id, &spiffeid, &plugin); err != nil {
			return types.AgentInfoList{}, err
		}

		sinfos = append(sinfos, types.AgentInfo{
			Id:       id,
			Spiffeid: spiffeid,
			Plugin:   plugin,
		})
	}

	return types.AgentInfoList{
		Plugin: sinfos,
	}, nil
}

func (db *LocalSqliteDb) GetAgentPluginInfo(name string) (types.AgentInfo, error) {
	row := db.database.QueryRow("SELECT agentid, spiffeid, plugin FROM agents WHERE agentid=?", name)

	sinfo := types.AgentInfo{}
	err := row.Scan(&sinfo.Id, &sinfo.Spiffeid, &sinfo.Plugin)
	if err != nil {
		return types.AgentInfo{}, err
	}
	return sinfo, nil
}
