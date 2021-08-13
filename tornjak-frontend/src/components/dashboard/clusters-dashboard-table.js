import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import TableDashboard from './table/dashboard-table';
import SpiffeHelper from '../spiffe-helper';

const columns = [
  { field: "name", headerName: "Name", width: 200 },
  { field: "created", headerName: "Created", width: 300 },
  { field: "numNodes", headerName: "Number Of Nodes", width: 300 },
  { field: "numEntries", headerName: "Number of Entries", width: 200 }
];

const styles = theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
});

class ClusterDashboardTable extends React.Component {
  constructor(props) {
    super(props);
    this.SpiffeHelper = new SpiffeHelper()
  }

  clusterList() {
    if (typeof this.props.globalClustersList !== 'undefined') {
      return this.props.globalClustersList.map(a => this.SpiffeHelper.cluster(a, this.props.globalEntries.globalEntriesList))
    } else {
      return []
    }
  }

  selectedData() {
    var data = this.clusterList(), filteredData = [], selectedDataKey = [], selectedData = this.props.selectedData;
    if (selectedData !== undefined) {
      selectedDataKey = selectedData.clusterName;
      for (let i = 0; i < data.length; i++) {
        if ((data[i].clusterName === selectedDataKey) || (data[i].name === selectedDataKey)) {
          filteredData.push(data[i]);
        }
      }
      return filteredData;
    }
  }

  render() {
    const { numRows, selectedData } = this.props;
    if (selectedData === undefined) {
      var data = this.clusterList();
    } else {
      var data = this.selectedData();
    }
    return (
      <div>
        <TableDashboard
          title={"Clusters"}
          numRows={numRows}
          columns={columns}
          data={data} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  globalClustersList: state.clusters.globalClustersList,
  globalAgents: state.agents,
  globalEntries: state.entries,
})

export default withStyles(styles)(
  connect(mapStateToProps, {})(ClusterDashboardTable)
)
