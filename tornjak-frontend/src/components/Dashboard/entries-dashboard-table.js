import React from 'react';
import { connect } from 'react-redux';
import Link from '@material-ui/core/Link';
import { withStyles } from '@material-ui/core/styles';
import Title from './title';
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import renderCellExpand from './render-cell-expand';

const columns = [
  { field: "id", headerName: "ID", width: 200, renderCell: renderCellExpand},
  { field: "spiffeid", headerName: "Name", width: 300, renderCell: renderCellExpand},
  { field: "parentId", headerName: "Parent ID", width: 250, renderCell: renderCellExpand},
  { field: "adminFlag", headerName: "Admin Flag", width: 150},
  { field: "entryExpireTime", headerName: "Entry Expire Time", width: 190},
  { field: "platformType", headerName: "Platform Type", width: 170},
  { field: "clusterName", headerName: "Cluster Name", width: 190}
];

function preventDefault(event) {
  event.preventDefault();
}

const styles = ( theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

class EntriesDashBoardTable extends React.Component {
  agentMetadata(parentid) {
    if (this.props.globalAgents.globalAgentsWorkLoadAttestorInfo !== undefined) {
      var check_id = this.props.globalAgents.globalAgentsWorkLoadAttestorInfo.filter(agent => (agent.spiffeid) === parentid);
      if (check_id.length !== 0) {
        return check_id[0]
      } else {
        return {"plugin":"", "cluster":""}
      }
    }
  }

  workloadEntry(entry) {
    var thisSpiffeId = "spiffe://" + entry.spiffe_id.trust_domain + entry.spiffe_id.path
    var thisParentId = "spiffe://" + entry.parent_id.trust_domain + entry.parent_id.path
    // get tornjak metadata
    var metadata_entry = this.agentMetadata(thisParentId);
    var plugin = "None"
    var cluster = "None"
    if (metadata_entry["plugin"].length !== 0) {
      plugin = metadata_entry["plugin"]
    }
    if (metadata_entry["cluster"].length !== 0) {
      cluster = metadata_entry["cluster"]
    }
    // get spire data
    var admin = false
    var expTime = "No Expiry Time"
    if (entry.admin !== undefined) {
      admin = entry.admin
    }
    if (entry.expires_at !== undefined) {
      var d = new Date(entry.expires_at * 1000)
      expTime = d.toLocaleDateString("en-US", {month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false})
    }
    return {
      id: entry.id,
      spiffeid: thisSpiffeId,
      parentId: thisParentId,
      adminFlag: admin,
      entryExpireTime: expTime,
      platformType: plugin,
      clusterName: cluster,
    }
  }

  entryList() {
    if (typeof this.props.globalEntries.globalEntriesList !== 'undefined') {
      return this.props.globalEntries.globalEntriesList.map(currentEntry => {
        return this.workloadEntry(currentEntry);
      })
    } else {
      return ""
    }
  }

  render() {
    const classes = this.props;
    var data = this.entryList()
    return (
      <React.Fragment>
      <Title>Entries</Title>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid 
          rows={data} 
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
}

const mapStateToProps = state => ({
  globalAgents: state.agents,
  globalEntries: state.entries,
})

export default withStyles(styles)(
  connect(mapStateToProps, {})(EntriesDashBoardTable)
)