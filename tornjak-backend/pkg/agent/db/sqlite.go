package db

import (
	"database/sql"
	"fmt"

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
		return SQLError{cmd, err}
	}
	_, err = statement.Exec()
	if err != nil {
		return SQLError{cmd, err}
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
	// TODO can there be multiple? plugins per agent?  handle replace
	cmd := "INSERT OR REPLACE INTO agents (spiffeid, plugin) VALUES (?,?)"
	statement, err := db.database.Prepare(cmd)
	if err != nil {
		return SQLError{cmd, err}
	}
	_, err = statement.Exec(sinfo.Spiffeid, sinfo.Plugin)
	if err != nil {
		return SQLError{cmd, err}
	}
	return nil
}

func (db *LocalSqliteDb) GetAgents() (types.AgentInfoList, error) {
	cmd := "SELECT spiffeid, plugin FROM agents"
	rows, err := db.database.Query(cmd)
	if err != nil {
		return types.AgentInfoList{}, SQLError{cmd, err}
	}

	sinfos := []types.AgentInfo{}
	var (
		spiffeid string
		plugin   string
	)
	for rows.Next() {
		if err = rows.Scan(&spiffeid, &plugin); err != nil {
			return types.AgentInfoList{}, SQLError{cmd, err}
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

func (db *LocalSqliteDb) GetAgentPluginInfo(spiffeid string) (types.AgentInfo, error) {
	cmd := "SELECT spiffeid, plugin FROM agents WHERE spiffeid=?"
	row := db.database.QueryRow(cmd, spiffeid)

	sinfo := types.AgentInfo{}
	err := row.Scan(&sinfo.Spiffeid, &sinfo.Plugin)
	if err == sql.ErrNoRows {
		return types.AgentInfo{}, GetError{fmt.Sprintf("Agent %v has no assigned plugin", spiffeid)}
	} else if err != nil {
		return types.AgentInfo{}, SQLError{cmd, err}
	}
	return sinfo, nil
}

// CLUSTER HANDLERS

// GetClusterAgents takes in string cluster name and outputs array of spiffeids of agents assigned to the cluster
func (db *LocalSqliteDb) GetClusterAgents(name string) ([]string, error) {
	// test for cluster existence
	cmdCheckExistence := "SELECT name FROM clusters WHERE name=?"
	row := db.database.QueryRow(cmdCheckExistence, name)
	var thisName string
	err := row.Scan(&thisName)
	if err == sql.ErrNoRows {
		return nil, GetError{fmt.Sprintf("Cluster %v not registered", name)}
	} else if err != nil {
		return nil, SQLError{cmdCheckExistence, err}
	}

	// search in clusterMemberships table
	cmdGetMemberships := "SELECT spiffeid FROM clusterMemberships WHERE clusterName=?"
	rows, err := db.database.Query(cmdGetMemberships, name)
	if err != nil {
		return nil, SQLError{cmdGetMemberships, err}
	}

	spiffeids := []string{}
	var spiffeid string

	for rows.Next() {
		if err = rows.Scan(&spiffeid); err != nil {
			return nil, SQLError{cmdGetMemberships, err}
		}
		spiffeids = append(spiffeids, spiffeid)
	}

	return spiffeids, nil
}

// GetAgentClusterName takes in string of spiffeid of agent and outputs the name of the cluster
func (db *LocalSqliteDb) GetAgentClusterName(spiffeid string) (string, error) {
	cmd := "SELECT clusterName FROM clusterMemberships WHERE spiffeid=?"
	row := db.database.QueryRow(cmd, spiffeid)

	var clusterName string
	err := row.Scan(&clusterName)
	if err == sql.ErrNoRows {
		return "", GetError{fmt.Sprintf("Agent %v unassigned to any cluster", spiffeid)}
	} else if err != nil {
		return "", SQLError{cmd, err}
	}
	return clusterName, nil
}

// GetClusters outputs a list of ClusterInfo structs with information on currently registered clusters
func (db *LocalSqliteDb) GetClusters() (types.ClusterInfoList, error) {
	cmd := "SELECT name, domainName, managedBy, platformType FROM clusters"
	rows, err := db.database.Query(cmd)
	if err != nil {
		return types.ClusterInfoList{}, SQLError{cmd, err}
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
			return types.ClusterInfoList{}, SQLError{cmd, err}
		}

		agentsList, err = db.GetClusterAgents(name)
		if err != nil {
			return types.ClusterInfoList{}, SQLError{"Getting cluster agents", err}
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

// AssignAgentCluster assigns an agent with SPIFFEID spiffeid to cluster clusterName.  This returns an error if the agent has already been assigned to a cluster.
func (db *LocalSqliteDb) AssignAgentCluster(spiffeid string, clusterName string) error {
	// TODO check if cluster clusterName exists
	// CHECK IF EXISTS, throw error if it does
	_, err := db.GetAgentClusterName(spiffeid)
	if err == nil {
		return PostFailure{fmt.Sprintf("Error: Agent %v already assigned", spiffeid)}
	} else {
		serr, ok := err.(GetError)
		if !ok {
			return SQLError{"Could not check if agent is assigned", serr}
		}
	}

	cmdInsert := "INSERT OR REPLACE INTO clusterMemberships (spiffeid, clusterName) VALUES (?,?)"
	statement, err := db.database.Prepare(cmdInsert)
	if err != nil {
		return SQLError{cmdInsert, err}
	}
	_, err = statement.Exec(spiffeid, clusterName)
	if err != nil {
		return SQLError{cmdInsert, err}
	}
	return nil
}

// RemoveClusterAgents clears all agents from assignment to cluster name.
func (db *LocalSqliteDb) RemoveClusterAgents(name string) error { // TODO check if cluster exists
	cmdDelete := "DELETE FROM clusterMemberships WHERE clusterName=?"
	statement, err := db.database.Prepare(cmdDelete)
	if err != nil {
		return SQLError{cmdDelete, err}
	}
	_, err = statement.Exec(name)
	if err != nil {
		return SQLError{cmdDelete, err}
	}
	return nil
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
	if errorAcc != nil {
		return PostPartialFailure{errorAcc.Error()}
	}
	return nil
}

// CreateClusterEntry takes in struct cinfo of type ClusterInfo.  If a cluster with cinfo.Name already registered, returns error.
func (db *LocalSqliteDb) CreateClusterEntry(cinfo types.ClusterInfo) error {
	var name string
	cmdFindCluster := "SELECT name FROM clusters WHERE name=?"
	err := db.database.QueryRow(cmdFindCluster, cinfo.Name).Scan(&name)
	if err == nil { // existence throws error
		return PostFailure{fmt.Sprintf("Error, cluster %v already exists", cinfo.Name)}
	}
	if err != sql.ErrNoRows {
		return SQLError{cmdFindCluster, err}
	}

	cmdInsert := "INSERT INTO clusters (name, domainName, managedBy, platformType) VALUES (?,?,?,?)"
	statement, err := db.database.Prepare(cmdInsert)
	if err != nil {
		return SQLError{cmdInsert, err}
	}
	_, err = statement.Exec(cinfo.Name, cinfo.DomainName, cinfo.ManagedBy, cinfo.PlatformType)
	if err != nil {
		return SQLError{cmdInsert, err}
	}

	err = db.AssignAgentsCluster(cinfo.AgentsList, cinfo.Name)
	if err != nil {
		return PostPartialFailure{err.Error()}
	}
	return nil
}

// EditClusterEntry takes in struct cinfo of type ClusterInfo.  If cluster with cinfo.Name does not exist, throws error.
func (db *LocalSqliteDb) EditClusterEntry(cinfo types.ClusterInfo) error {
	var name string
	cmdFindCluster := "SELECT name FROM clusters WHERE name=?"
	err := db.database.QueryRow(cmdFindCluster, cinfo.Name).Scan(&name)
	if err == sql.ErrNoRows {
		return PostFailure{fmt.Sprintf("Error: cluster %v does not exist", cinfo.Name)}
	} else if err != nil {
		return SQLError{cmdFindCluster, err}
	}

	cmdUpdate := "UPDATE clusters SET domainName=?, managedBy=?, platformType=? WHERE name=?"
	statement, err := db.database.Prepare(cmdUpdate)
	if err != nil {
		return SQLError{cmdUpdate, err}
	}
	_, err = statement.Exec(cinfo.DomainName, cinfo.ManagedBy, cinfo.PlatformType, cinfo.Name)
	if err != nil {
		return SQLError{cmdUpdate, err}
	}

	err = db.RemoveClusterAgents(cinfo.Name)
	if err != nil {
		return PostPartialFailure{fmt.Sprintf("Error clearing previous cluster agents: %v", err.Error())}
	}

	err = db.AssignAgentsCluster(cinfo.AgentsList, cinfo.Name)
	if err != nil {
		return PostPartialFailure{fmt.Sprintf("Error assigning cluster agents: %v", err.Error())}
	}
	return nil
}

// DeleteClusterEntry takes in string name of cluster and removes cluster information and agent membership of cluster from the database.  If not all agents can be removed from the cluster, cluster information remains in the database.
func (db *LocalSqliteDb) DeleteClusterEntry(clusterName string) error {
	// check existence
	var name string
	cmdFindCluster := "SELECT name FROM clusters WHERE name=?"
	err := db.database.QueryRow(cmdFindCluster, clusterName).Scan(&name)
	if err == sql.ErrNoRows {
		return PostFailure{fmt.Sprintf("Error: cluster %v does not exist", clusterName)}
	} else if err != nil {
		return SQLError{cmdFindCluster, err}
	}

	err = db.RemoveClusterAgents(clusterName)
	if err != nil {
		return PostPartialFailure{fmt.Sprintf("Error: Unable to remove all cluster agents from cluster: %v", err)}
	}

	cmdDelete := "DELETE FROM clusters WHERE name=?"
	statement, err := db.database.Prepare(cmdDelete)
	if err != nil {
		return SQLError{cmdDelete, err}
	}
	_, err = statement.Exec(clusterName)
	if err != nil {
		return PostPartialFailure{fmt.Sprintf("Error: Unable to remove cluster metadata: %v", err.Error())}
	}
	return nil
}
