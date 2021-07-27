import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import renderCellExpand from './render-cell-expand';
import Table1 from './table/dashboard-table';

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
    if (typeof this.props.globalAgents.globalAgentsWorkLoadAttestorInfo !== 'undefined') {
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
    if (typeof entry.admin !== 'undefined') {
      admin = entry.admin
    }
    if (typeof entry.expires_at !== 'undefined') {
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
    if (typeof this.props.globalEntriesList !== 'undefined' && typeof this.props.globalEntriesList.globalEntriesList !== 'undefined') {
      return this.props.globalEntriesList.globalEntriesList.map(currentEntry => {
        return this.workloadEntry(currentEntry);
      })
    } else {
      return []
    }
  }

  render() {
    const { numRows, tableType } = this.props;
    var data = this.entryList();
    return (
      <div>
        <Table1 
          title={"Entries"}
          numRows={numRows}
          tableType={tableType}
          columns={columns}
          data={data}/>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  globalAgents: state.agents,
  globalEntriesList: state.entries,
})

export default withStyles(styles)(
  connect(mapStateToProps, {})(EntriesDashBoardTable)
)