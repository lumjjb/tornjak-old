import React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Title from './Title';
import { DataGrid, GridToolbar } from "@material-ui/data-grid";

const columns = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "spiffeid", headerName: "Name", width: 390 },
  { field: "noEntries", headerName: "Number of Entries", width: 200},
  { field: "status", headerName: "Status", width: 120},
  { field: "platformType", headerName: "Platform Type", width: 170},
  { field: "clusterName", headerName: "Cluster Name", width: 190}
];

const rows = [
  { id: 1, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", noEntries: 10, status: "Banned", platformType: "DOCKER", clusterName: "cluster1"},
  { id: 2, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", noEntries: 99, status: "Attested", platformType: "DOCKER", clusterName: "cluster1"},
  { id: 3, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", noEntries: 2, status: "OK", platformType: "UNIX", clusterName: "cluster1"},
  { id: 4, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", noEntries: 30, status: "OK", platformType: "UNIX", clusterName: "cluster1"},
  { id: 5, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", noEntries: 20, status: "OK", platformType: "KUBERNETES", clusterName: "cluster2"},
  { id: 6, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", noEntries: 1, status: "OK", platformType: "KUBERNETES", clusterName: "cluster1"},
  { id: 7, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", noEntries: 4, status: "OK", platformType: "KUBERNETES", clusterName: "cluster1"},
  { id: 8, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", noEntries: 20, status: "OK", platformType: "UNIX", clusterName: "cluster1"},
  { id: 9, spiffeid: "spiffe://example.org/spire/agent/k8s_sat/minikube/ed0ba9c9-bf77-4132-b8e7-dd6f89230ess", noEntries: 20, status: "OK", platformType: "KUBERNETES", clusterName: "cluster1"}
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
      <Title>Agents</Title>
      <div style={{ height: 390, width: "100%" }}>
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
          See more Agents
        </Link>
      </div>
    </React.Fragment>
  );
}
