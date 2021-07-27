import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import renderCellExpand from './render-cell-expand';
import Table1 from './table/dashboard-table';

const columns = [
  //{ field: "id", headerName: "ID", width: 100 },TODO do we want an ID column?
  { field: "spiffeid", headerName: "Name", flex: 1, renderCell: renderCellExpand },
  { field: "noEntries", headerName: "Number of Entries", width: 200 },
  { field: "status", headerName: "Status", width: 120 },
  { field: "platformType", headerName: "Platform Type", width: 170 },
  { field: "clusterName", headerName: "Cluster Name", width: 190 }
];

function preventDefault(event) {
  event.preventDefault();
}

const styles = theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
});

class AgentDashboardTable extends React.Component {
  agentMetadata(spiffeid) {
    if (typeof this.props.globalAgents.globalAgentsWorkLoadAttestorInfo !== 'undefined') {
      var check_id = this.props.globalAgents.globalAgentsWorkLoadAttestorInfo.filter(agent => (agent.spiffeid) === spiffeid);
      if (check_id.length !== 0) {
        return check_id[0]
      } else {
        return {}
      }
    }
  }

  numberEntries(spiffeid) {
    if (typeof this.props.globalEntries.globalEntriesList !== 'undefined') {
      function isEntry(entry) {
        if (typeof entry !== 'undefined') {
          return (("spiffe://" + entry.parent_id.trust_domain + entry.parent_id.path) === spiffeid)
        } else {
          return false
        }
      }
      var entriesList = this.props.globalEntries.globalEntriesList.filter(isEntry);
      if (typeof entriesList === 'undefined') {
        return 0
      } else {
        return entriesList.length
      }
    } else {
      return 0
    }
  }

  agent(entry) {
    var thisSpiffeid = "spiffe://" + entry.id.trust_domain + entry.id.path;
    // get status
    var banned = entry.banned
    var status = "OK"
    var expiry = entry.x509svid_expires_at
    var currentTime = Math.round(new Date().getTime() / 1000)
    if (banned) {
      status = "Banned"
    } else if (expiry > currentTime) {
      status = "Attested"
    }
    // get tornjak metadata
    var metadata_entry = this.agentMetadata(thisSpiffeid);
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
      noEntries: this.numberEntries(thisSpiffeid),
      status: status,
      platformType: plugin,
      clusterName: cluster,
    }
  }

  agentList() {
    if (typeof this.props.globalAgents.globalAgentsList !== undefined) {
      return this.props.globalAgents.globalAgentsList.map(currentAgent => {
        return this.agent(currentAgent);
      })
    } else {
      return []
    }
  }

  render() {
    const { numRows, tableType } = this.props;
    var data = this.agentList();
    return (
      <div>
        <Table1 
          title={"Agents"}
          numRows={numRows}
          tableType={tableType}
          columns={columns}
          data={data}/>
      </div>
    );
  }

}

const mapStateToProps = (state) => ({
  globalAgents: state.agents,
  globalEntries: state.entries,
})

export default withStyles(styles)(
  connect(mapStateToProps, {})(AgentDashboardTable)
)