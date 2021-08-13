import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import renderCellExpand from './render-cell-expand';
import TableDashboard from './table/dashboard-table';
import SpiffeHelper from '../spiffe-helper';

const columns = [
  { field: "spiffeid", headerName: "Name", flex: 1, renderCell: renderCellExpand },
  { field: "clusterName", headerName: "Cluster Name", width: 190 },
  { field: "numEntries", headerName: "Number of Entries", width: 200 },
  { field: "status", headerName: "Status", width: 120 },
  { field: "platformType", headerName: "Platform Type", width: 170 },
];

const styles = theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
});

class AgentDashboardTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.SpiffeHelper = new SpiffeHelper()
  }

  agentList() {
    if ((typeof this.props.globalEntries.globalEntriesList === 'undefined') ||
      (typeof this.props.globalAgents.globalAgentsList === 'undefined')) {
      return [];
    }

    let agentEntriesDict = this.SpiffeHelper.getAgentsEntries(this.props.globalAgents.globalAgentsList, this.props.globalEntries.globalEntriesList)
    return this.props.globalAgents.globalAgentsList.map(currentAgent => {
      return this.SpiffeHelper.getChildEntries(currentAgent, agentEntriesDict, this.props.globalEntries.globalEntriesList, this.props.globalAgents.globalAgentsWorkLoadAttestorInfo)
    })
  }

  selectedData() {
    var data = this.agentList(), selectedData = this.props.selectedData, clickedDashboardTable = this.props.globalClickedDashboardTable;
    var filteredData = [], selectedDataKey = [];
    if (selectedData !== undefined) {
      if (clickedDashboardTable === "clustersdetails") {
        selectedDataKey = selectedData.name;
        for (let i = 0; i < data.length; i++) {
          if (data[i].clusterName === selectedDataKey) {
            filteredData.push(data[i]);
          }
        }
      } else if (clickedDashboardTable === "entriesdetails") {
        selectedDataKey = selectedData.parentId;
        for (let i = 0; i < data.length; i++) {
          if (data[i].id === selectedDataKey) {
            filteredData.push(data[i]);
          }
        }
      }
      return filteredData;
    }
  }

  render() {
    const { numRows, selectedData } = this.props;
    if (selectedData === undefined) {
      var data = this.agentList();
    } else {
      var data = this.selectedData();
    }
    return (
      <div>
        <TableDashboard
          title={"Agents"}
          numRows={numRows}
          columns={columns}
          data={data} />
      </div>
    );
  }

}

const mapStateToProps = (state) => ({
  globalAgents: state.agents,
  globalEntries: state.entries,
  globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable,
})

export default withStyles(styles)(
  connect(mapStateToProps, {})(AgentDashboardTable)
)
