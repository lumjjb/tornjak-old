import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import renderCellExpand from './render-cell-expand';
import TableDashboard from './table/dashboard-table';
import SpiffeHelper from '../spiffe-helper'

const columns = [
  { field: "id", headerName: "ID", width: 170, renderCell: renderCellExpand },
  { field: "spiffeid", headerName: "Name", width: 170, renderCell: renderCellExpand },
  { field: "parentId", headerName: "Parent ID", width: 170, renderCell: renderCellExpand },
  { field: "clusterName", headerName: "Cluster Name", width: 170 },
  { field: "entryExpireTime", headerName: "Entry Expire Time", width: 190 },
  { field: "platformType", headerName: "Platform Type", width: 170 },
  { field: "adminFlag", headerName: "Admin Flag", width: 150 },
];

const styles = (theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

class EntriesDashBoardTable extends React.Component {
  constructor(props) {
    super(props)
    this.SpiffeHelper = new SpiffeHelper();
  }

  workloadEntry(entry) {
    var thisSpiffeId = this.SpiffeHelper.getEntrySpiffeid(entry)
    var thisParentId = this.SpiffeHelper.getEntryParentid(entry)
    // get tornjak metadata
    var metadata_entry = this.SpiffeHelper.getAgentMetadata(thisParentId, this.props.globalAgents.globalAgentsWorkLoadAttestorInfo);
    var plugin = "None"
    var cluster = "None"
    if (metadata_entry["plugin"].length !== 0) {
      plugin = metadata_entry["plugin"]
    }
    if (metadata_entry["cluster"].length !== 0) {
      cluster = metadata_entry["cluster"]
    }
    // get spire data
    var admin = this.SpiffeHelper.getEntryAdminFlag(entry)
    var expTime = "No Expiry Time"
    if (typeof entry.expires_at !== 'undefined') {
      var d = new Date(this.SpiffeHelper.getEntryExpiryMillisecondsFromEpoch(entry))
      expTime = d.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false })
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

  selectedData() {
    var data = this.entryList(), filteredData = [], selectedDataKey = [], selectedData = this.props.selectedData;
    if (selectedData === undefined)
      return data;
    for (let i = 0; i < selectedData.length; i++) {
      selectedDataKey[i] = selectedData[i].name;
    }
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < selectedDataKey.length; j++) {
        if ((data[i].clusterName === selectedDataKey[j]) || (data[i].parentId === selectedDataKey[j])) {
          filteredData.push(data[i]);
        }
      }
    }
    return filteredData;
  }

  render() {
    const { numRows } = this.props;
    var data = this.selectedData();
    return (
      <div>
        <TableDashboard
          title={"Entries"}
          numRows={numRows}
          columns={columns}
          data={data} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  globalAgents: state.agents,
  globalEntriesList: state.entries,
  globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable,
})

export default withStyles(styles)(
  connect(mapStateToProps, {})(EntriesDashBoardTable)
)
