package db

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"

	"github.com/lumjjb/tornjak/tornjak-backend/pkg/agent/types"
)

// TO DO: DELETE deleted agents from the db
const (
	initAgentsTable   = "CREATE TABLE IF NOT EXISTS agents (spiffeid TEXT PRIMARY KEY, plugin TEXT)"                                                       //creates agentdb with fields spiffeid and plugin
	initClustersTable = "CREATE TABLE IF NOT EXISTS clusters (name TEXT PRIMARY KEY, domainName TEXT, PlatformType TEXT, managedBy TEXT, agentsList TEXT)" //TODO need other fields?
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

	// Table for clusters
	statement, err = database.Prepare(initClustersTable)
	if err != nil {
		return nil, errors.Errorf("Unable to execute SQL query :%v", initClustersTable)
	}
	_, err = statement.Exec()
	if err != nil {
		return nil, errors.Errorf("Unable to execute SQL query :%v", initClustersTable)
	}

	return &LocalSqliteDb{
		database: database,
	}, nil
}

func (db *LocalSqliteDb) CreateAgentEntry(sinfo types.AgentInfo) error {
	statement, err := db.database.Prepare("INSERT OR REPLACE INTO agents (spiffeid, plugin) VALUES (?,?)")
	if err != nil {
		return errors.Errorf("Unable to execute SQL query: %v", err)
	}
	_, err = statement.Exec(sinfo.Spiffeid, sinfo.Plugin)

	return err
}

func (db *LocalSqliteDb) GetAgents() (types.AgentInfoList, error) {
	rows, err := db.database.Query("SELECT spiffeid, plugin FROM agents")
	if err != nil {
		return types.AgentInfoList{}, errors.New("Unable to execute SQL query")
	}

	sinfos := []types.AgentInfo{}
	var (
		spiffeid string
		plugin   string
	)
	for rows.Next() {
		if err = rows.Scan(&spiffeid, &plugin); err != nil {
			return types.AgentInfoList{}, err
		}

		sinfos = append(sinfos, types.AgentInfo{
			Spiffeid: spiffeid,
			Plugin:   plugin,
		})
	}

	return types.AgentInfoList{
		Agents: sinfos,
	}, nil
}

func (db *LocalSqliteDb) GetAgentPluginInfo(name string) (types.AgentInfo, error) {
	row := db.database.QueryRow("SELECT spiffeid, plugin FROM agents WHERE spiffeid=?", name)

	sinfo := types.AgentInfo{}
	err := row.Scan(&sinfo.Spiffeid, &sinfo.Plugin)
	if err != nil {
		return types.AgentInfo{}, err
	}
	return sinfo, nil
}

func (db *LocalSqliteDb) GetClusters() (types.ClusterInfoList, error) {
	//rows, err := db.database.Query("SELECT name, details FROM clusters, json_each(clusters.details, '$.foo1')")
	rows, err := db.database.Query("SELECT name, domainName, managedBy, platformType, agentsList from clusters")
	if err != nil {
		return types.ClusterInfoList{}, errors.Errorf("Unable to execute SQL query: %v", err)
	}

	sinfos := []types.ClusterInfo{}
	var (
		name         string
		domainName   string
		managedBy    string
		platformType string
		agentsList   string
	)
	for rows.Next() {
		if err = rows.Scan(&name, &domainName, &managedBy, &platformType, &agentsList); err != nil {
			return types.ClusterInfoList{}, err
		}

		sinfos = append(sinfos, types.ClusterInfo{
			Name:         name,
			DomainName:   domainName,
			ManagedBy:    managedBy,
			PlatformType: platformType,
			AgentsList:   agentsList,
		})
	}

	return types.ClusterInfoList{
		Clusters: sinfos,
	}, nil
}

func (db *LocalSqliteDb) CreateClusterEntry(cinfo types.ClusterInfo) error {
	statement, err := db.database.Prepare("INSERT OR REPLACE INTO clusters (name, domainName, managedBy, platformType, agentsList) VALUES (?,?,?,?,?)")
	if err != nil {
		return errors.Errorf("Unable to execute SQL query: %v", err)
	}
	_, err = statement.Exec(cinfo.Name, cinfo.DomainName, cinfo.ManagedBy, cinfo.PlatformType, cinfo.AgentsList)
	return err
}
