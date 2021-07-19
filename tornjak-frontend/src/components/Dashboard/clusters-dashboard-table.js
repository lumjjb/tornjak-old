import React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Title from './title';
import { DataGrid, GridToolbar } from "@material-ui/data-grid";

const columns = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "name", headerName: "Name", width: 200 },
  { field: "created", headerName: "Created", width: 300 },
  { field: "noNodes", headerName: "Number Of Nodes", width: 300},
  { field: "noEntries", headerName: "Number of Entries", width: 200}
];

const rows = [
  { id: 1, name: "Cluster1", created: "8 days ago", noNodes: 35, noEntries: 35},
  { id: 2, name: "Cluster2", created: "2 days ago", noNodes: 42, noEntries: 35},
  { id: 3, name: "Cluster3", created: "1 hours ago", noNodes: 45, noEntries: 35},
  { id: 4, name: "Cluster4", created: "30 minutes ago", noNodes: 16, noEntries: 35},
  { id: 5, name: "Cluster5", created: "20 seconds ago", noNodes: 0, noEntries: 35},
  { id: 6, name: "Cluster6", created: "1 day ago", noNodes: 150, noEntries: 35},
  { id: 7, name: "Cluster7", created: "45 seconds ago", noNodes: 44, noEntries: 35},
  { id: 8, name: "Cluster8", created: "20 seconds ago", noNodes: 36, noEntries: 35},
  { id: 9, name: "Cluster9", created: "20 seconds ago", noNodes: 65, noEntries: 35}
];

function preventDefault(event) {
  event.preventDefault();
}

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));


export default function ClustersDashBoardTable() {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Title>Clusters</Title>
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
          See more clusters
        </Link>
      </div>
    </React.Fragment>
  );
}
