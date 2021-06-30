package db

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/mattn/go-sqlite3"

  "github.com/lumjjb/tornjak/tornjak-backend/pkg/agent/types"
)

type tornjakTxHelper struct {
	ctx context.Context
	tx  *sql.Tx
}

func getTornjakTxHelper(ctx context.Context, tx *sql.Tx) *tornjakTxHelper {
	return &tornjakTxHelper{ctx, tx}
}

// insertClusterMetadata attempts insert into table clusters
// returns SQLError upon failure and PostFailure on cluster existence
func (t *tornjakTxHelper) insertClusterMetadata(cinfo types.ClusterInfo)(error){
  cmdInsert := `INSERT INTO clusters (name, domainName, managedBy, platformType) VALUES (?,?,?,?)`
  statement, err := t.tx.PrepareContext(t.ctx, cmdInsert)
  if err != nil {
    return SQLError{cmdInsert, err}
  }
  defer statement.Close()
  _, err = statement.ExecContext(t.ctx, cinfo.Name, cinfo.DomainName, cinfo.ManagedBy, cinfo.PlatformType)
  if err != nil {
    if serr, ok := err.(sqlite3.Error); ok {
      if serr.Code == sqlite3.ErrConstraint{
        return PostFailure{fmt.Sprintf("Cluster already exists; use Edit Cluster")}
      }
    }
    return SQLError{cmdInsert, err}
  }
  return nil
}

// updateClusterMetadata attempts update of entry in table clusters
// returns SQLError on failure and PostFailure on cluster non-existence
func (t *tornjakTxHelper) updateClusterMetadata(cinfo types.ClusterInfo)(error){
  cmdUpdate := `UPDATE clusters SET domainName=?, managedBy=?, platformType=? WHERE name=?`
  statement, err := t.tx.PrepareContext(t.ctx, cmdUpdate)
  if err != nil {
    return SQLError{cmdUpdate, err}
  }
  defer statement.Close()
  res, err := statement.ExecContext(t.ctx, cinfo.DomainName, cinfo.ManagedBy, cinfo.PlatformType, cinfo.Name)
  if err != nil {
    return SQLError{cmdUpdate, err}
  }

  // check if update was successful
  numRows, err := res.RowsAffected()
  if err != nil {
    return SQLError{cmdUpdate, err}
  }
  if numRows != 1 {
    return PostFailure{fmt.Sprintf("Cluster does not exist; use Create Cluster")}
  }

  return nil
}

// deleteClusterMetadata attemps delete of entry in table clusters
// returns SQLError on failure and PostFailure on cluster non-existence
func (t *tornjakTxHelper) deleteClusterMetadata(name string) (error){
  cmdDelete := `DELETE FROM clusters WHERE name=?`
  statement, err := t.tx.PrepareContext(t.ctx, cmdDelete)
  if err != nil {
    return SQLError{cmdDelete, err}
  }
  res, err := statement.ExecContext(t.ctx, name)
  if err != nil {
    return SQLError{cmdDelete, err}
  }
  numRows, err := res.RowsAffected()
  if err != nil {
    return SQLError{cmdDelete, err}
  }
  if numRows != 1 {
    return PostFailure{fmt.Sprintf("Cluster does not exist")}
  }
  return nil
}

// addAgentBatchToCluster adds entries in clusterMemberships table
// takes in cluster name and list of agent spiffeids
// returns SQLError on failure and PostFailure on conflict (an agent is already assigned)
func (t *tornjakTxHelper) addAgentBatchToCluster(clustername string, agentsList []string) error {
	if len(agentsList) == 0 {
		return nil
	}
	// generate single statement
	cmdBatch := "INSERT OR ABORT INTO clusterMemberships (spiffeid, clusterID) VALUES "
	for i := 0; i < len(agentsList); i++ {
		if i == 0 {
			cmdBatch = cmdBatch + fmt.Sprintf("(\"%v\", (SELECT id FROM clusters WHERE name=\"%v\"))", agentsList[i], clustername)
		} else {
			cmdBatch = cmdBatch + fmt.Sprintf(",(\"%v\", (SELECT id FROM clusters WHERE name=\"%v\"))", agentsList[i], clustername)
		}
	}
	statementInsert, err := t.tx.PrepareContext(t.ctx, cmdBatch)
	if err != nil {
		return SQLError{cmdBatch, err}
	}
	// execute single statement and check error
	_, err = statementInsert.ExecContext(t.ctx)
	if err != nil {
		if serr, ok := err.(sqlite3.Error); ok {
			if serr.Code == sqlite3.ErrConstraint {
        // TODO add more details of agent conflict?
				return PostFailure{fmt.Sprintf("agent already assigned to cluster")}
			}
		}
		return SQLError{cmdBatch, err}
	}
	return nil

}

// deleteClusterAgents attempts removal of all agent-cluster pairs in clusterMemberships table
// returns SQLError on failure
func (t *tornjakTxHelper) deleteClusterAgents(clustername string) error {
	cmdDelete := "DELETE FROM clusterMemberships WHERE clusterID=(SELECT id FROM clusters WHERE name=?)"
	statementDelete, err := t.tx.PrepareContext(t.ctx, cmdDelete)
	if err != nil {
		return SQLError{cmdDelete, err}
	}
	_, err = statementDelete.ExecContext(t.ctx, clustername)
	if err != nil {
		return SQLError{cmdDelete, err}
	}
	return nil
}

