import React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Title from './Title';
import { DataGrid, GridToolbar } from "@material-ui/data-grid";

const columns = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "spiffeid", headerName: "Name", width: 340 },
  { field: "parentId", headerName: "Parent ID", width: 250},
  { field: "adminFlag", headerName: "Admin Flag", width: 150},
  { field: "entryExpireTime", headerName: "Entry Expire Time", width: 190},
  { field: "platformType", headerName: "Platform Type", width: 170},
  { field: "clusterName", headerName: "Cluster Name", width: 190}
];

const rows = [
  { id: 1, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", parentId: "spiffe://example.org/ns/spire/sa/spire-agent", adminFlag: "TRUE", entryExpireTime: 45, platformType: "DOCKER", clusterName: "cluster1"},
  { id: 2, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", parentId: "spiffe://example.org/ns/spire/sa/spire-agent", adminFlag: "TRUE", entryExpireTime: 90, platformType: "DOCKER", clusterName: "cluster1"},
  { id: 3, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", parentId: "spiffe://example.org/ns/spire/sa/spire-agent", adminFlag: "False", entryExpireTime: 56, platformType: "UNIX", clusterName: "cluster1"},
  { id: 4, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", parentId: "spiffe://example.org/ns/spire/sa/spire-agent", adminFlag: "TRUE", entryExpireTime: 34, platformType: "UNIX", clusterName: "cluster1"},
  { id: 5, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", parentId: "spiffe://example.org/ns/spire/sa/spire-agent", adminFlag: "FALSE", entryExpireTime: 35, platformType: "KUBERNETES", clusterName: "cluster2"},
  { id: 6, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", parentId: "spiffe://example.org/ns/spire/sa/spire-agent", adminFlag: "TRUE", entryExpireTime: 90, platformType: "KUBERNETES", clusterName: "cluster1"},
  { id: 7, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", parentId: "spiffe://example.org/ns/spire/sa/spire-agent", adminFlag: "TRUE", entryExpireTime: 356, platformType: "KUBERNETES", clusterName: "cluster1"},
  { id: 8, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", parentId: "spiffe://example.org/ns/spire/sa/spire-agent", adminFlag: "TRUE", entryExpireTime: 908, platformType: "UNIX", clusterName: "cluster1"},
  { id: 9, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", parentId: "spiffe://example.org/ns/spire/sa/spire-agent", adminFlag: "TRUE", entryExpireTime: 32, platformType: "KUBERNETES", clusterName: "cluster1"}
];

function preventDefault(event) {
  event.preventDefault();
}

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function Orders() {
  const classes = useStyles();
  return (
    <React.Fragment>
    <Title>Entries</Title>
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid 
        rows={rows} 
        columns={columns} 
        pageSize={5} 
        checkboxSelection
        components={{
          Toolbar: GridToolbar,
        }}
         />
    </div>
    <div className={classes.seeMore}>
      <Link color="primary" href="#" onClick={preventDefault}>
        See more Entries
      </Link>
    </div>
  </React.Fragment>
  );
}
