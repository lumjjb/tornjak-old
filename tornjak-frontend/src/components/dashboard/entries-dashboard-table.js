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

  entryList() {
    if (typeof this.props.globalEntriesList !== 'undefined' && typeof this.props.globalEntriesList.globalEntriesList !== 'undefined') {
      return this.props.globalEntriesList.globalEntriesList.map(currentEntry => {
        return this.SpiffeHelper.workloadEntry(currentEntry, this.props.globalAgents.globalAgentsWorkLoadAttestorInfo);
      })
    } else {
      return []
    }
  }

  selectedData() {
    var data = this.entryList(), filteredData = [], selectedData = this.props.selectedData;
    if (selectedData !== undefined) {
      for (let i = 0; i < data.length; i++) {
        if ((data[i].clusterName === selectedData.name) || (data[i].parentId === selectedData.spiffeid)) {
          filteredData.push(data[i]);
        }
      }
      return filteredData;
    }
  }

  render() {
    const { numRows, selectedData } = this.props;
    var data = [];
    if (selectedData === undefined) {
      data = this.entryList();
    } else {
      data = this.selectedData();
    }
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
