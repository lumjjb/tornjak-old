package db

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"

	"github.com/lumjjb/tornjak/tornjak-backend/pkg/agent/types"
)

const (
	initAgentsTable        = "CREATE TABLE IF NOT EXISTS agents (id INTEGER PRIMARY KEY AUTOINCREMENT, spiffeid TEXT, plugin TEXT)" //creates agentdb with fields spiffeid and plugin
	initClustersTable      = "CREATE TABLE IF NOT EXISTS clusters (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, domainName TEXT, PlatformType TEXT, managedBy TEXT, UNIQUE (name))"
	initClusterMemberTable = "CREATE TABLE IF NOT EXISTS clusterMemberships (id INTEGER PRIMARY KEY AUTOINCREMENT, spiffeid TEXT, clusterName TEXT, UNIQUE (spiffeid))"
)

type LocalSqliteDb struct {
	database *sql.DB
}

func createDBTable(database *sql.DB, cmd string) error {
	statement, err := database.Prepare(cmd)
	if err != nil {
		return errors.Errorf("Unable to execute SQL query %v: %v", cmd, err)
	}
	_, err = statement.Exec()
	if err != nil {
		return errors.Errorf("Unable to execute SQL query %v: %v", cmd, err)
	}
	return nil
}

func NewLocalSqliteDB(dbpath string) (AgentDB, error) {
	database, err := sql.Open("sqlite3", dbpath) // TODO close DB upon error?
	if err != nil {
		return nil, errors.New("Unable to open connection to DB")
	}

	// Table for workload selectors
	err = createDBTable(database, initAgentsTable)
	if err != nil {
		return nil, err
	}

	// Table for clusters
	err = createDBTable(database, initClustersTable)
	if err != nil {
		return nil, err
	}

	// Table for clusters-agent membership
	err = createDBTable(database, initClusterMemberTable)
	if err != nil {
		return nil, err
	}

	return &LocalSqliteDb{
		database: database,
	}, nil
}

// AGENT - SELECTOR/PLUGIN HANDLERS

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

// CLUSTER HANDLERS

// GetClusterAgents takes in string cluster name and outputs array of spiffeids of agents assigned to the cluster
func (db *LocalSqliteDb) GetClusterAgents(name string) ([]string, error) {
	rows, err := db.database.Query("SELECT spiffeid FROM clusterMemberships WHERE clusterName=?", name)
	if err != nil {
		return nil, errors.Errorf("Unable to execute SQL query: %v", err)
	}

	spiffeids := []string{}
	var spiffeid string

	for rows.Next() {
		if err = rows.Scan(&spiffeid); err != nil {
			return nil, err
		}
		spiffeids = append(spiffeids, spiffeid)
	}

	return spiffeids, nil
}

// GetAgentClusterName takes in string of spiffeid of agent and outputs the name of the cluster
func (db *LocalSqliteDb) GetAgentClusterName(name string) (string, error) {
	row := db.database.QueryRow("SELECT clusterName FROM clusterMemberships WHERE spiffeid=?", name)

	var clusterName string
	err := row.Scan(&clusterName)
	if err != nil {
		return "", err
	}
	return clusterName, nil
}

// GetClusters outputs a list of ClusterInfo structs with information on currently registered clusters
func (db *LocalSqliteDb) GetClusters() (types.ClusterInfoList, error) {
	rows, err := db.database.Query("SELECT name, domainName, managedBy, platformType from clusters")
	if err != nil {
		return types.ClusterInfoList{}, errors.Errorf("Unable to execute SQL query: %v", err)
	}

	sinfos := []types.ClusterInfo{}
	var (
		name         string
		domainName   string
		managedBy    string
		platformType string
		agentsList   []string
	)
	for rows.Next() {
		if err = rows.Scan(&name, &domainName, &managedBy, &platformType); err != nil {
			return types.ClusterInfoList{}, err
		}

		agentsList, err = db.GetClusterAgents(name)
		if err != nil {
			return types.ClusterInfoList{}, errors.Errorf("Error getting cluster agents: %v", err)
		}
		sinfos = append(sinfos, types.ClusterInfo{
			Name:         name,
			DomainName:   domainName,
			ManagedBy:    managedBy,
			PlatformType: platformType,
			AgentsList:   agentsList,
		})
	}

	return types.ClusterInfoList(sinfos), nil
}

// AssignAgentCluster assigns an agent with SPIFFEID spiffeid to cluster clusterName.  This returns an error if the agent has already been assigned to a cluster.
func (db *LocalSqliteDb) AssignAgentCluster(spiffeid string, clusterName string) error {
	// CHECK IF EXISTS, throw error if it does
	var isMember string
	err := db.database.QueryRow("SELECT clusterName FROM clusterMemberships WHERE spiffeid=?", spiffeid).Scan(&isMember)
	if err == nil {
		return errors.Errorf("Error: agent %v already assigned to %v", spiffeid, isMember)
	}
	if err != sql.ErrNoRows {
		return errors.Errorf("Unable to execute SQL query: %v", err)
	}

	statement, err := db.database.Prepare("INSERT OR REPLACE INTO clusterMemberships (spiffeid, clusterName) VALUES (?,?)")
	if err != nil {
		return errors.Errorf("Unable to execute SQL query: %v", err)
	}
	_, err = statement.Exec(spiffeid, clusterName)
	return err
}

// RemoveClusterAgents clears all agents from assignment to cluster name.
func (db *LocalSqliteDb) RemoveClusterAgents(name string) error {
	statement, err := db.database.Prepare("DELETE FROM clusterMemberships WHERE clusterName=?")
	if err != nil {
		return errors.Errorf("Unable to execute SQL query: %v", err)
	}
	_, err = statement.Exec(name)
	return err
}

// AssignAgentsCluster takes in array of spiffeids and a clustername, and assigns each spiffeid to the cluster.  This attempts all assignments and returns all errors on failure of assigning all spiffeids.
func (db *LocalSqliteDb) AssignAgentsCluster(spiffeids []string, clusterName string) error {
	var errorAcc error
	for i := 0; i < len(spiffeids); i++ {
		err := db.AssignAgentCluster(spiffeids[i], clusterName)
		if err != nil {
			if errorAcc == nil {
				errorAcc = errors.Errorf("Unable to add to cluster: %v [%v]", spiffeids[i], err)
			} else {
				errorAcc = errors.Errorf("%v, %v [%v]", errorAcc, spiffeids[i], err)
			}
		}
	}
	return errorAcc
}

// CreateClusterEntry takes in struct cinfo of type ClusterInfo.  If a cluster with cinfo.Name already registered, returns error.
func (db *LocalSqliteDb) CreateClusterEntry(cinfo types.ClusterInfo) error {
	var name string
	err := db.database.QueryRow("SELECT name FROM clusters WHERE name=?", cinfo.Name).Scan(&name)
	if err == nil { // existence throws error
		return errors.Errorf("Error: cluster %v already exists", cinfo.Name)
	}
	if err != sql.ErrNoRows {
		return errors.Errorf("Unable to execute SQL query: %v", err)
	}

	statement, err := db.database.Prepare("INSERT INTO clusters (name, domainName, managedBy, platformType) VALUES (?,?,?,?)")
	if err != nil {
		return errors.Errorf("Unable to execute SQL query: %v", err)
	}
	_, err = statement.Exec(cinfo.Name, cinfo.DomainName, cinfo.ManagedBy, cinfo.PlatformType)
	if err != nil {
		return errors.Errorf("Error creating cluster: %v", err)
	}

	err = db.RemoveClusterAgents(cinfo.Name)
	if err != nil {
		return errors.Errorf("Error clearing agents from cluster: %v", err)
	}
	err = db.AssignAgentsCluster(cinfo.AgentsList, cinfo.Name)
	return err
}

// EditClusterEntry takes in struct cinfo of type ClusterInfo.  If cluster with cinfo.Name does not exist, throws error.
func (db *LocalSqliteDb) EditClusterEntry(cinfo types.ClusterInfo) error {
	var name string
	err := db.database.QueryRow("SELECT name FROM clusters WHERE name=?", cinfo.Name).Scan(&name)
	if err != nil {
		if err == sql.ErrNoRows { // lack of existence throws error
			return errors.Errorf("Error: cluster %v does not exist", cinfo.Name)
		} else {
			return errors.Errorf("Unable to execute SQL query: %v", err)
		}
	}

	statement, err := db.database.Prepare("UPDATE clusters SET domainName=?, managedBy=?, platformType=? WHERE name=?")
	if err != nil {
		return errors.Errorf("Unable to execute SQL query: %v", err)
	}
	_, err = statement.Exec(cinfo.DomainName, cinfo.ManagedBy, cinfo.PlatformType, cinfo.Name)
	if err != nil {
		return errors.Errorf("Error creating cluster: %v", err)
	}

	err = db.RemoveClusterAgents(cinfo.Name)
	if err != nil {
		return errors.Errorf("Error clearing agents from cluster: %v", err)
	}

	err = db.AssignAgentsCluster(cinfo.AgentsList, cinfo.Name)
	return err
}

// DeleteClusterEntry takes in string name of cluster and removes cluster information and agent membership of cluster from the database.  If not all agents can be removed from the cluster, cluster information remains in the database.
func (db *LocalSqliteDb) DeleteClusterEntry(clusterName string) error {
	err := db.RemoveClusterAgents(clusterName)
	if err != nil {
		return errors.Errorf("Error: Unable to remove all cluster agents from cluster: %v", err)
	}

	statement, err := db.database.Prepare("DELETE FROM clusters WHERE name=?")
	if err != nil {
		return errors.Errorf("Unable to execute SQL query: %v", err)
	}
	_, err = statement.Exec(clusterName)
	if err != nil {
		return errors.Errorf("Error deleting cluster: %v", err)
	}
	return nil
}
