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

  numberAgentEntries(spiffeid) {
    if (typeof this.props.globalEntries.globalEntriesList !== 'undefined') {
      var entriesList = this.props.globalEntries.globalEntriesList.filter(entry => {
        return spiffeid === (this.SpiffeHelper.getEntryParentid(entry))
      })
      return entriesList.length
    } else {
      return 0
    }
  }

  numberClusterEntries(entry) {
    var entriesPerAgent = entry.agentsList.map(currentAgent => {
      return this.numberAgentEntries(currentAgent);
    })
    var sum = entriesPerAgent.reduce((acc, curVal) => {
      return acc + curVal;
    }, 0)
    return sum
  }

  cluster(entry) {
    return {
      id: entry.name,
      name: entry.name,
      created: entry.creationTime,
      numNodes: entry.agentsList.length,
      numEntries: this.numberClusterEntries(entry),
    }
  }

  clusterList() {
    if (typeof this.props.globalClustersList !== 'undefined') {
      return this.props.globalClustersList.map(a => this.cluster(a))
    } else {
      return []
    }
  }

  selectedData() {
    var data = this.clusterList(), filteredData = [], selectedDataKey = [], selectedData = this.props.selectedData;
    if (selectedData === undefined)
      return data;
    for (let i = 0; i < selectedData.length; i++) {
      selectedDataKey[i] = selectedData[i].value.clusterName;
    }
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < selectedDataKey.length; j++) {
        if ((data[i].clusterName === selectedDataKey[j]) || (data[i].name === selectedDataKey[j])) {
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
