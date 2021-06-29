package db

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/mattn/go-sqlite3"
)

type tornjakTxHelper struct {
	ctx context.Context
	tx  *sql.Tx
}

func getTornjakTxHelper(ctx context.Context, tx *sql.Tx) *tornjakTxHelper {
	return &tornjakTxHelper{ctx, tx}
}

func (t *tornjakTxHelper) checkClusterExistence(name string) (bool, error) {
	cmdFindCluster := "SELECT name FROM clusters WHERE name=?"
	rows, err := t.tx.QueryContext(t.ctx, cmdFindCluster, name)
	if err != nil {
		return false, SQLError{"Could not check cluster existence", err}
	}
	if rows.Next() {
		return true, nil
	}
	return false, nil
}

func (t *tornjakTxHelper) getClusterID(name string) (int, error) {
	cmdGet := "SELECT id FROM clusters WHERE name=?"
	rows, err := t.tx.QueryContext(t.ctx, cmdGet, name)
	if err != nil {
		return -1, SQLError{cmdGet, err}
	}
	var id int
	if !rows.Next() {
		return -1, GetError{fmt.Sprintf("Cluster %v does not exist", name)}
	}
	if err = rows.Scan(&id); err != nil {
		return -1, SQLError{cmdGet, err}
	}
	return id, nil

}

func (t *tornjakTxHelper) addAgentBatchToCluster(clusterID int, agentsList []string) error {
	if len(agentsList) == 0 {
		return nil
	}
	// generate single statement
	cmdBatch := "INSERT OR ABORT INTO clusterMemberships (spiffeid, clusterID) VALUES "
	for i := 0; i < len(agentsList); i++ {
		if i == 0 {
			cmdBatch = cmdBatch + fmt.Sprintf("(\"%v\", %v)", agentsList[i], clusterID)
		} else {
			cmdBatch = cmdBatch + fmt.Sprintf(",(\"%v\", %v)", agentsList[i], clusterID)
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
				return PostFailure{fmt.Sprintf("agent already assigned to cluster")}
			}
		}
		return SQLError{cmdBatch, err}
	}
	return nil

}

func (t *tornjakTxHelper) deleteClusterAgents(clusterID int) error {
	cmdDelete := "DELETE FROM clusterMemberships WHERE clusterID=?"
	statementDelete, err := t.tx.PrepareContext(t.ctx, cmdDelete)
	if err != nil {
		return SQLError{cmdDelete, err}
	}
	_, err = statementDelete.ExecContext(t.ctx, clusterID)
	if err != nil {
		return SQLError{cmdDelete, err}
	}
	return nil

}
