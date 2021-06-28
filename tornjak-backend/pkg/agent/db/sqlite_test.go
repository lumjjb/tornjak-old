package db

import (
	"fmt"
	"os"
	"testing"

	"github.com/lumjjb/tornjak/tornjak-backend/pkg/agent/types"
)

func cleanup() {
	os.Remove("./local-agentstest-db")
}

/***************************************************************/
func TestServerCreate(t *testing.T) {
	defer cleanup()
	db, err := NewLocalSqliteDB("./local-agentstest-db")
	if err != nil {
		t.Fatal(err)
	}

	sList, err := db.GetAgents()
	if err != nil {
		t.Fatal(err)
	}
	if len(sList.Agents) > 0 {
		t.Fatal("Agents list should initially be empty")
	}

	sinfo := types.AgentInfo{
		Spiffeid: "spiffe://example.org/spire/agent/",
		Plugin:   "Docker",
	}

	err = db.CreateAgentEntry(types.AgentInfo{
		Spiffeid: "spiffe://example.org/spire/agent/",
		Plugin:   "Docker",
	})
	if err != nil {
		t.Fatal(err)
	}

	sList, err = db.GetAgents()
	if err != nil {
		t.Fatal(err)
	}
	if len(sList.Agents) != 1 || sList.Agents[0] != sinfo {
		t.Fatal("Agents list should initially be empty")
	}
}

/***************************************************************/

func TestClusterCreate(t *testing.T) {
	defer cleanup()
	db, err := NewLocalSqliteDB("./local-agentstest-db")
	if err != nil {
		t.Fatal(err)
	}

	cListObject, err := db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	cList := cListObject.Clusters
	if len(cList) > 0 {
		t.Fatal("Clusters list should initially be empty")
	}

	cluster1 := "cluster1"
	cluster2 := "cluster2"
	cluster3 := "cluster3"
	vms := "VMs"
	k8s := "Kubernetes"
	agent1 := "agent1"
	agent2 := "agent2"
	agent3 := "agent3"
	agent4 := "agent4"

	cinfo1 := types.ClusterInfo{
		Name:         cluster1,
		PlatformType: vms,
		AgentsList:   []string{agent1, agent2},
	}
	cinfo1a := types.ClusterInfo{
		Name:         cluster1,
		PlatformType: k8s,
		AgentsList:   []string{agent1},
	}
	cinfo2 := types.ClusterInfo{
		Name:         cluster2,
		PlatformType: vms,
		AgentsList:   []string{agent2, agent4},
	}
	cinfo3 := types.ClusterInfo{
		Name:         cluster3,
		PlatformType: k8s,
		AgentsList:   []string{agent3},
	}

	// TEST GetClusterAgents with nonexistent cluster
	_, err = db.GetClusterAgents(cluster1)
	if err == nil {
		t.Fatal("Cannot get agents from nonexistent cluster")
	}
	_, ok := err.(GetError)
	if !ok {
		t.Fatal("Non-get error")
	}

	// TEST CreateClusterEntry
	err = db.CreateClusterEntry(cinfo1)
	if err != nil {
		t.Fatal(err)
	}

	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	cList = cListObject.Clusters
	if len(cList) != 1 || cList[0].Name != cinfo1.Name {
		t.Fatal("Clusters list after 1 insertion should have 1 cluster")
	}

	// TEST GetClusterAgents
	agents, err := db.GetClusterAgents(cluster1)
	if err != nil {
		t.Fatal(err)
	}
	if len(agents) != 2 || agents[0] != agent1 || agents[1] != agent2 {
		t.Fatal("Problem with basic agent registration to cluster")
	}

	// TEST Create with already existing agent
	err = db.CreateClusterEntry(cinfo1a)
	if err == nil {
		t.Fatal("Failure to report error on cluster create of existing cluster")
	}
	_, ok = err.(PostFailure)
	if !ok {
		t.Fatal(fmt.Sprintf("Wrong error on cluster create of existing cluster: %v", err.Error()))
	}

	// TEST Create with no conflicting agent assignment
	err = db.CreateClusterEntry(cinfo3)
	if err != nil {
		t.Fatal(err)
	}
	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	cList = cListObject.Clusters
	if len(cList) != 2 {
		t.Fatal("Clusters list after 2 insertions should have 2 clusters")
	}

	// TEST Create with conflicting agent assignment
	err = db.CreateClusterEntry(cinfo2)
	if err == nil {
		t.Fatal("Failure to report failure to assign already assigned agent")
	}
	_, ok = err.(PostPartialFailure)
	if !ok {
		t.Fatal(fmt.Sprintf("Wrong error on agent assignment: %v", err.Error()))
	}
	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	cList = cListObject.Clusters
	if len(cList) != 3 {
		t.Fatal("Cluster list after 3 insertions should have 3 clusters")
	}
	// check agent memberships; want 2 in cluster 1, 1 in cluster 2, 1 in cluster 3
	agents1, err := db.GetClusterAgents(cluster1)
	if err != nil {
		t.Fatal(err)
	}
	agents2, err := db.GetClusterAgents(cluster2)
	if err != nil {
		t.Fatal(err)
	}
	agents3, err := db.GetClusterAgents(cluster3)
	if err != nil {
		t.Fatal(err)
	}
	if len(agents1) != 2 || len(agents2) != 1 || len(agents3) != 1 {
		t.Fatal("Clusters do not all contain correct agents")
	}
	agent1Cluster, err := db.GetAgentClusterName(agent1)
	if err != nil {
		t.Fatal(err)
	}
	agent2Cluster, err := db.GetAgentClusterName(agent2)
	if err != nil {
		t.Fatal(err)
	}
	agent3Cluster, err := db.GetAgentClusterName(agent3)
	if err != nil {
		t.Fatal(err)
	}
	agent4Cluster, err := db.GetAgentClusterName(agent4)
	if err != nil {
		t.Fatal(err)
	}
	if agent1Cluster != cluster1 {
		t.Fatal("agent1 not in cluster1")
	}
	if agent2Cluster != cluster1 {
		t.Fatal("agent2 not in cluster1")
	}
	if agent3Cluster != cluster3 {
		t.Fatal("agent3 not in cluster3")
	}
	if agent4Cluster != cluster2 {
		t.Fatal("agent4 not in cluster2")
	}

}

/***************************************************************/

func TestClusterEdit(t *testing.T) {
	defer cleanup()
	db, err := NewLocalSqliteDB("./local-agentstest-db")
	if err != nil {
		t.Fatal(err)
	}

	cListObject, err := db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	cList := cListObject.Clusters
	if len(cList) > 0 {
		t.Fatal("Clusters list should initially be empty")
	}

	cluster1 := "cluster1"
	cluster2 := "cluster2"
	vms := "VMs"
	k8s := "Kubernetes"
	agent1 := "agent1"
	agent2 := "agent2"
	agent3 := "agent3"
	agent4 := "agent4"

	cinfo1 := types.ClusterInfo{
		Name:         cluster1,
		PlatformType: vms,
		AgentsList:   []string{agent1, agent2},
	}
	cinfo1New := types.ClusterInfo{
		Name:         cluster1,
		PlatformType: k8s,
		ManagedBy:    "MaiaIyer",
		AgentsList:   []string{agent1, agent3},
	}
	cinfo2 := types.ClusterInfo{
		Name:         cluster2,
		PlatformType: vms,
		AgentsList:   []string{agent2, agent4},
	}

	// TEST CreateClusterEntry
	err = db.CreateClusterEntry(cinfo1)
	if err != nil {
		t.Fatal(err)
	}

	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	cList = cListObject.Clusters
	if len(cList) != 1 || cList[0].Name != cinfo1.Name {
		t.Fatal("Clusters list after 1 insertion should have 1 cluster")
	}

	// TEST GetClusterAgents
	agents, err := db.GetClusterAgents("cluster1")
	if err != nil {
		t.Fatal(err)
	}
	if len(agents) != 2 || agents[0] != agent1 || agents[1] != agent2 {
		t.Fatal("Problem with basic agent registration to cluster")
	}

	// TEST EditClusterEntry
	err = db.EditClusterEntry(cinfo1New)
	if err != nil {
		t.Fatal(err)
	}
	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	cList = cListObject.Clusters
	storedCinfo := cList[0]
	if len(cList) != 1 || storedCinfo.Name != cinfo1New.Name || storedCinfo.ManagedBy != cinfo1New.ManagedBy || storedCinfo.PlatformType != cinfo1New.PlatformType {
		t.Fatal("Problem editing cluster metadata")
	}
	agents, err = db.GetClusterAgents(cluster1)
	if err != nil {
		t.Fatal(err)
	}
	if len(agents) != 2 || agents[0] != agent1 || agents[1] != agent3 {
		t.Fatal("Problem editing agent registration on clusterEdit")
	}

	// TEST EditClusterEntry on non-existent cluster
	err = db.EditClusterEntry(cinfo2)
	if err == nil {
		t.Fatal("Failed to report edit of nonexisting cluster")
	}
	_, ok := err.(PostFailure)
	if !ok {
		t.Fatal(fmt.Sprintf("Wrong error returned on editing nonexisting cluster: %v", err.Error()))
	}

	// TEST EditClusterEntry with already assigned agent
	err = db.CreateClusterEntry(cinfo2)
	if err != nil {
		t.Fatal(err)
	}
	err = db.EditClusterEntry(cinfo1)
	if err == nil {
		t.Fatal("Failed to report failure of agent assignment already taken")
	}
	_, ok = err.(PostPartialFailure)
	if !ok {
		t.Fatal(fmt.Sprintf("Wrong error on assignment of already assigned agent: %v", err.Error()))
	}

	// TODO TEST EditClusterEntry renaming

}

/***************************************************************/

func TestClusterDelete(t *testing.T) {
	defer cleanup()
	db, err := NewLocalSqliteDB("./local-agentstest-db")
	if err != nil {
		t.Fatal(err)
	}

	cListObject, err := db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	cList := cListObject.Clusters
	if len(cList) > 0 {
		t.Fatal("Clusters list should initially be empty")
	}

	cluster1 := "cluster1"
	cluster2 := "cluster2"
	vms := "VMs"
	k8s := "Kubernetes"
	agent1 := "agent1"
	agent2 := "agent2"
	agent3 := "agent3"
	agent4 := "agent4"

	cinfo1 := types.ClusterInfo{
		Name:         cluster1,
		PlatformType: vms,
		AgentsList:   []string{agent1, agent2},
	}
	cinfo2 := types.ClusterInfo{
		Name:         cluster2,
		PlatformType: k8s,
		AgentsList:   []string{agent3, agent4},
	}

	// TEST CreateClusterEntry
	err = db.CreateClusterEntry(cinfo1)
	if err != nil {
		t.Fatal(err)
	}

	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	cList = cListObject.Clusters
	if len(cList) != 1 || cList[0].Name != cinfo1.Name {
		t.Fatal("Clusters list after 1 insertion should have 1 cluster")
	}

	// TEST GetClusterAgents
	agents, err := db.GetClusterAgents(cluster1)
	if err != nil {
		t.Fatal(err)
	}
	if len(agents) != 2 || agents[0] != agent1 || agents[1] != agent2 {
		t.Fatal("Problem with basic agent registration to cluster")
	}

	// TEST RemoveClusterAgents
	err = db.RemoveClusterAgents(cluster1)
	if err != nil {
		t.Fatal(err)
	}
	agents, err = db.GetClusterAgents(cluster1)
	if err != nil {
		t.Fatal(err)
	}
	if len(agents) != 0 {
		t.Fatal("RemoveClusterAgents does not remove all agents")
	}
	agent1Cluster, err := db.GetAgentClusterName(agent1)
	if err == nil || agent1Cluster != "" {
		t.Fatal("Agent1 not successfully unassigned")
	}

	// TEST DeleteClusterEntry on nonexistent cluster
	err = db.DeleteClusterEntry(cluster2)
	if err == nil {
		t.Fatal("Failure to report cluster does not exist")
	}

	// TEST DeleteClusterEntry on existing cluster
	err = db.CreateClusterEntry(cinfo2)
	if err != nil {
		t.Fatal(err)
	}

	err = db.DeleteClusterEntry(cluster1)
	if err != nil {
		t.Fatal(err)
	}
	_, err = db.GetClusterAgents(cluster1)
	if err == nil {
		t.Fatal("Failure to report cluster does not exist")
	}

	err = db.DeleteClusterEntry(cluster2)
	if err != nil {
		t.Fatal(err)
	}
	agent3Cluster, err := db.GetAgentClusterName(agent3)
	if err == nil {
		t.Fatal(err)
	}
	_, ok := err.(GetError)
	if !ok {
		t.Fatal("incorrect failure")
	}
	if agent3Cluster != "" {
		t.Fatal("Agent3 not successfully unassigned")
	}
	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	cList = cListObject.Clusters
	if len(cList) != 0 {
		t.Fatal("Clusters list should be empty")
	}

}
