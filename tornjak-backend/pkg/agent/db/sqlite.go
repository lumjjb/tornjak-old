package db

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"

	"github.com/lumjjb/tornjak/tornjak-backend/pkg/agent/types"
)

const (
	initAgentsTable        = "CREATE TABLE IF NOT EXISTS agents (id INTEGER PRIMARY KEY AUTOINCREMENT, spiffeid TEXT, plugin TEXT)"                                                     //creates agentdb with fields spiffeid and plugin
	initClustersTable      = "CREATE TABLE IF NOT EXISTS clusters (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, domainName TEXT, PlatformType TEXT, managedBy TEXT, UNIQUE (name))"
	initClusterMemberTable = "CREATE TABLE IF NOT EXISTS clusterMemberships (id INTEGER PRIMARY KEY AUTOINCREMENT, spiffeid TEXT, clusterName TEXT, UNIQUE (spiffeid))"
)

type LocalSqliteDb struct {
	database *sql.DB
}

func createDBTable(database *sql.DB, cmd string)(error){
  statement, err := database.Prepare(cmd)
  if err != nil {
    return errors.Errorf("Unable to execute SQL query: %v", cmd)
  }
  _, err = statement.Exec()
  if err != nil {
    return errors.Errorf("Unable to execute SQL query: %v", cmd)
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

func (db *LocalSqliteDb) GetAgentClusterName(name string) (string, error) {
	row := db.database.QueryRow("SELECT clusterName FROM clusterMemberships WHERE spiffeid=?", name)

	var clusterName string
	err := row.Scan(&clusterName)
	if err != nil {
		return "", err
	}
	return clusterName, nil
}

func (db *LocalSqliteDb) GetClusters() (types.ClusterInfoList, error) {
	//rows, err := db.database.Query("SELECT name, details FROM clusters, json_each(clusters.details, '$.foo1')")
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

func (db *LocalSqliteDb) AssignAgentCluster(spiffeid string, clusterName string) error {
  // CHECK IF EXISTS, throw error if it does
  var isMember string
  err := db.database.QueryRow("SELECT clusterName FROM clusterMemberships WHERE spiffeid=?", spiffeid).Scan(&isMember)
  if err == nil {
    return errors.Errorf("Error: agent %v already assigned to %v", spiffeid, isMember)
  }
  if err != sql.ErrNoRows{
    return errors.Errorf("Error checking query: %v", err)
  }

	statement, err := db.database.Prepare("INSERT OR REPLACE INTO clusterMemberships (spiffeid, clusterName) VALUES (?,?)")
	if err != nil {
		return errors.Errorf("Unable to execute SQL query: %v", err)
	}
	_, err = statement.Exec(spiffeid, clusterName)
	return err
}

func (db *LocalSqliteDb) RemoveClusterAgents(name string) error {
	statement, err := db.database.Prepare("DELETE FROM clusterMemberships WHERE clusterName=?")
	if err != nil {
		return errors.Errorf("Unable to execute SQL query: $v", err)
	}
	_, err = statement.Exec(name)
	return err
}

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

func (db *LocalSqliteDb) CreateClusterEntry(cinfo types.ClusterInfo) error {
	// CHECK IF EXISTS, throw error if it does
	var name string
	err := db.database.QueryRow("SELECT name FROM clusters WHERE name=?", cinfo.Name).Scan(&name)
	if err == nil {
		return errors.Errorf("Error: cluster %v already exists", cinfo.Name)
	}
	if err != sql.ErrNoRows {
		return errors.Errorf("Error checking query: %v", err)
	}

	statement, err := db.database.Prepare("INSERT INTO clusters (name, domainName, managedBy, platformType) VALUES (?,?,?,?)")
	if err != nil {
		return errors.Errorf("Unable to execute SQL query: %v", err)
	}
	_, err = statement.Exec(cinfo.Name, cinfo.DomainName, cinfo.ManagedBy, cinfo.PlatformType) // TODO add error handler here
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

func (db *LocalSqliteDb) EditClusterEntry(cinfo types.ClusterInfo) error {
	// CHECK IF EXISTS, throw error if doesn't
	var name string
	err := db.database.QueryRow("SELECT name FROM clusters WHERE name=?", cinfo.Name).Scan(&name)
	if err != nil {
		if err == sql.ErrNoRows {
			return errors.Errorf("Error: cluster %v does not exist", cinfo.Name)
		} else {
			return errors.Errorf("Error checking query: %v", err)
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

