package db

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	_ "github.com/mattn/go-sqlite3"
	//"github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"

	"github.com/lumjjb/tornjak/tornjak-backend/pkg/agent/types"
)

const (
	// agent table with fields spiffeid and plugin
	initAgentsTable = `CREATE TABLE IF NOT EXISTS agents 
                            (id INTEGER PRIMARY KEY AUTOINCREMENT, spiffeid TEXT, plugin TEXT)`
	// cluster table with fields name, domainName, platformtype, managedby
	initClustersTable = `CREATE TABLE IF NOT EXISTS clusters 
                            (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, domainName TEXT, 
                            PlatformType TEXT, managedBy TEXT, UNIQUE (name))`
	// cluster - agent relation table specifying by clusterid and spiffeid
	//                                enforces uniqueness of spiffeid
	initClusterMemberTable = `CREATE TABLE IF NOT EXISTS clusterMemberships 
                            (id INTEGER PRIMARY KEY AUTOINCREMENT, spiffeid TEXT, clusterID int,
                            FOREIGN KEY (clusterID) REFERENCES clusters(id), UNIQUE (spiffeid))`
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
	database, err := sql.Open("sqlite3", dbpath)
	if err != nil {
		return nil, errors.New("Unable to open connection to DB")
	}

	initTableList := []string{initAgentsTable, initClustersTable, initClusterMemberTable}

	for i := 0; i < len(initTableList); i++ {
		err = createDBTable(database, initTableList[i])
		if err != nil {
			return nil, err
		}
	}

	return &LocalSqliteDb{
		database: database,
	}, nil
}

// AGENT - SELECTOR/PLUGIN HANDLERS

func (db *LocalSqliteDb) CreateAgentEntry(sinfo types.AgentInfo) error {
	// TODO can there be multiple? plugins per agent?  handle replace
	cmd := `INSERT OR REPLACE INTO agents (spiffeid, plugin) VALUES (?,?)`
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
	cmd := `SELECT spiffeid, plugin FROM agents`
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
	cmd := `SELECT spiffeid, plugin FROM agents WHERE spiffeid=?`
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
	// search in clusterMemberships table
	cmdGetMemberships := `SELECT GROUP_CONCAT(clusterMemberships.spiffeid) 
                        FROM clusters LEFT JOIN clusterMemberships 
                                      ON clusters.id=clusterMemberships.clusterID 
                        WHERE clusters.name=? 
                        GROUP BY clusters.name`
	row := db.database.QueryRow(cmdGetMemberships, name)

	spiffeidList := []string{}
	var spiffeids sql.NullString

	err := row.Scan(&spiffeids)
	if err == sql.ErrNoRows {
		return nil, GetError{fmt.Sprintf("Cluster %v not registered", name)}
	} else if err != nil {
		return nil, SQLError{cmdGetMemberships, err}
	}
	if spiffeids.Valid {
		spiffeidList = strings.Split(spiffeids.String, ",")
	} else {
		spiffeidList = []string{}
	}

	return spiffeidList, nil

}

// GetAgentClusterName takes in string of spiffeid of agent and outputs the name of the cluster
func (db *LocalSqliteDb) GetAgentClusterName(spiffeid string) (string, error) {
	var clusterName sql.NullString
	cmdGetName := `SELECT clusters.name 
                 FROM clusterMemberships LEFT JOIN clusters 
                 ON clusters.id=clusterMemberships.clusterID 
                 WHERE clusterMemberships.spiffeid=?`
	row := db.database.QueryRow(cmdGetName, spiffeid)
	err := row.Scan(&clusterName)
	if err == sql.ErrNoRows {
		return "", GetError{fmt.Sprintf("Agent %v unassigned to any cluster", spiffeid)}
	} else if err != nil {
		return "", SQLError{cmdGetName, err}
	}
	if clusterName.Valid {
		return clusterName.String, nil
	} else {
		return "", GetError{fmt.Sprintf("Agent %v assinged to unregistered cluster", spiffeid)}
	}
}

// GetClusters outputs a list of ClusterInfo structs with information on currently registered clusters
func (db *LocalSqliteDb) GetClusters() (types.ClusterInfoList, error) {
	// BEGIN transaction
	ctx := context.Background()
	tx, err := db.database.BeginTx(ctx, nil)
	if err != nil {
		return types.ClusterInfoList{}, errors.Errorf("Error initializing context: %v", err)
	}

	cmd := `SELECT clusters.name, clusters.domainName, clusters.managedBy, 
                 clusters.platformType, GROUP_CONCAT(clusterMemberships.spiffeid) 
          FROM clusters LEFT JOIN clusterMemberships 
                        ON clusters.id=clusterMemberships.clusterID 
          GROUP BY clusters.name`

	rows, err := tx.QueryContext(ctx, cmd)
	if err != nil {
		tx.Rollback()
		return types.ClusterInfoList{}, SQLError{cmd, err}
	}

	sinfos := []types.ClusterInfo{}
	var (
		name                string
		domainName          string
		managedBy           string
		platformType        string
		agentsListConcatted sql.NullString
		agentsList          []string
	)
	for rows.Next() {
		if err = rows.Scan(&name, &domainName, &managedBy, &platformType, &agentsListConcatted); err != nil {
			tx.Rollback()
			return types.ClusterInfoList{}, SQLError{cmd, err}
		}
		if agentsListConcatted.Valid { // handle clusters with no assigned agents
			agentsList = strings.Split(agentsListConcatted.String, ",")
		} else {
			agentsList = []string{}
		}
		sinfos = append(sinfos, types.ClusterInfo{
			Name:         name,
			DomainName:   domainName,
			ManagedBy:    managedBy,
			PlatformType: platformType,
			AgentsList:   agentsList,
		})
	}

	err = tx.Commit()
	if err != nil {
		return types.ClusterInfoList{}, err
	}
	return types.ClusterInfoList{
		Clusters: sinfos,
	}, nil
}

// CreateClusterEntry takes in struct cinfo of type ClusterInfo.  If a cluster with cinfo.Name already registered, returns error.
func (db *LocalSqliteDb) CreateClusterEntry(cinfo types.ClusterInfo) error {
	// BEGIN transaction
	ctx := context.Background()
	tx, err := db.database.BeginTx(ctx, nil)
	if err != nil {
		return errors.Errorf("Error initializing context: %v", err)
	}
	txHelper := getTornjakTxHelper(ctx, tx)

	// INSERT cluster metadata
	err = txHelper.insertClusterMetadata(cinfo)
	if err != nil {
		tx.Rollback()
		return err
	}

	// ADD agents to cluster
	err = txHelper.addAgentBatchToCluster(cinfo.Name, cinfo.AgentsList)
	if err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit()
}

// EditClusterEntry takes in struct cinfo of type ClusterInfo.  If cluster with cinfo.Name does not exist, throws error.
func (db *LocalSqliteDb) EditClusterEntry(cinfo types.ClusterInfo) error {
	// BEGIN transaction
	ctx := context.Background()
	tx, err := db.database.BeginTx(ctx, nil)
	if err != nil {
		return errors.Errorf("Error initializing context: %v", err)
	}
	txHelper := getTornjakTxHelper(ctx, tx)

	// UPDATE cluster metadata
	err = txHelper.updateClusterMetadata(cinfo)
	if err != nil {
		tx.Rollback()
		return err
	}

	// REMOVE all currently assigned cluster agents
	err = txHelper.deleteClusterAgents(cinfo.Name)
	if err != nil {
		tx.Rollback()
		return err
	}

	// ADD agents to cluster
	err = txHelper.addAgentBatchToCluster(cinfo.Name, cinfo.AgentsList)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

// DeleteClusterEntry takes in string name of cluster and removes cluster information and agent membership of cluster from the database.  If not all agents can be removed from the cluster, cluster information remains in the database.
func (db *LocalSqliteDb) DeleteClusterEntry(clusterName string) error {
	// BEGIN transaction
	ctx := context.Background()
	tx, err := db.database.BeginTx(ctx, nil)
	if err != nil {
		return errors.Errorf("Error initializing context: %v", err)
	}
	txHelper := getTornjakTxHelper(ctx, tx)

	// REMOVE cluster metadata
	err = txHelper.deleteClusterMetadata(clusterName)
	if err != nil {
		tx.Rollback()
		return err
	}

	// REMOVE all currently assigned cluster agents
	err = txHelper.deleteClusterAgents(clusterName)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}
