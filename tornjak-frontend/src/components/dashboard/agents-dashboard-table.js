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

  numberEntries(spiffeid, agentEntriesDict) {
    var validIds = new Set([spiffeid]);

    // Also check for parent IDs associated with the agent
    let agentEntries = agentEntriesDict[spiffeid];
    if (agentEntries !== undefined) {
      for (let j = 0; j < agentEntries.length; j++) {
        validIds.add(this.SpiffeHelper.getEntrySpiffeid(agentEntries[j]));
      }
    }

    if (typeof this.props.globalEntries.globalEntriesList !== 'undefined') {
      var entriesList = this.props.globalEntries.globalEntriesList.filter(entry => {
        return (typeof entry !== 'undefined') && validIds.has(this.SpiffeHelper.getEntryParentid(entry));
      });

      if (typeof entriesList === 'undefined') {
        return 0
      } else {
        return entriesList.length
      }
    } else {
      return 0
    }
  }

  getChildEntries(agent, agentEntriesDict) {
    var thisSpiffeid = this.SpiffeHelper.getAgentSpiffeid(agent);
    // get status
    var status = this.SpiffeHelper.getAgentStatusString(agent);
    // get tornjak metadata
    var metadata_entry = this.SpiffeHelper.getAgentMetadata(thisSpiffeid, this.props.globalAgents.globalAgentsWorkLoadAttestorInfo);
    var plugin = "None"
    var cluster = "None"
    if (typeof metadata_entry["plugin"] !== 'undefined' && metadata_entry["plugin"].length !== 0) {
      plugin = metadata_entry["plugin"]
    }
    if (typeof metadata_entry["cluster"] !== 'undefined' && metadata_entry["cluster"].length !== 0) {
      cluster = metadata_entry["cluster"]
    }
    return {
      id: thisSpiffeid,
      spiffeid: thisSpiffeid,
      numEntries: this.numberEntries(thisSpiffeid, agentEntriesDict),
      status: status,
      platformType: plugin,
      clusterName: cluster,
    }
  }

  agentList() {
    if ((typeof this.props.globalEntries.globalEntriesList === 'undefined') ||
      (typeof this.props.globalAgents.globalAgentsList === 'undefined')) {
      return [];
    }

    let agentEntriesDict = this.SpiffeHelper.getAgentsEntries(this.props.globalAgents.globalAgentsList, this.props.globalEntries.globalEntriesList)
    return this.props.globalAgents.globalAgentsList.map(currentAgent => {
      return this.getChildEntries(currentAgent, agentEntriesDict);
    })
  }

  selectedData() {
    var data = this.agentList() , selectedData = this.props.selectedData, clickedDashboardTable = this.props.globalClickedDashboardTable;
    var filteredData = [], selectedDataKey = [];
    if (selectedData === undefined)
      return data;
    if (clickedDashboardTable === "clustersdetails") {
      for (let i = 0; i < selectedData.length; i++) {
        selectedDataKey[i] = selectedData[i].name;
      }
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < selectedDataKey.length; j++) {
          if (data[i].clusterName === selectedDataKey[j]) {
            filteredData.push(data[i]);
          }
        }
      }
    } else if (clickedDashboardTable === "entriesdetails") {
      for (let i = 0; i < selectedData.length; i++) {
        selectedDataKey[i] = selectedData[i].value.parentId;
      }
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < selectedDataKey.length; j++) {
          if (data[i].id === selectedDataKey[j]) {
            filteredData.push(data[i]);
          }
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
