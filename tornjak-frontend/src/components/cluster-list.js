import React, { Component } from 'react';
import { connect } from 'react-redux';
import IsManager from './is_manager';
import Table from "tables/clusters-list-table";
import TornjakApi from './tornjak-api-helpers';
import {
  serverSelectedFunc,
  agentsListUpdateFunc,
  tornjakServerInfoUpdateFunc,
  serverInfoUpdateFunc,
  selectorInfoFunc,
  tornjakMessageFunc,
  workloadSelectorInfoFunc,
  agentworkloadSelectorInfoFunc,
  clustersListUpdateFunc,
} from 'redux/actions';

const Cluster = props => (
  <tr>
    <td>{props.name}</td>
    <td>{props.platformType}</td>
    <td>{props.domainName}</td>
    <td>{props.managedBy}</td>
    <td><div style={{ overflowX: 'auto', width: "400px" }}>
      <pre>{JSON.stringify(props.agentsList, null, ' ')}</pre>
    </div></td>
  </tr>
)

class ClusterList extends Component {
  constructor(props) {
    super(props);
    this.TornjakApi = new TornjakApi();
    this.state = {
      message: "",
    };
  }

  componentDidMount() {
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        this.TornjakApi.populateClustersUpdate(this.props.globalServerSelected, this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
      }
    } else {
      this.TornjakApi.populateLocalClustersUpdate(this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
      if (this.props.globalTornjakServerInfo !== "") {
        this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.TornjakApi.populateClustersUpdate(this.props.globalServerSelected, this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
      }
    } else {
      if (prevProps.globalTornjakServerInfo !== this.props.globalTornjakServerInfo) {
        this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
      }
    }
  }

  clusterList() {
    var clusters =
    [
        {
          "name": "cluster1",
          "domainName": "example.org",
          "managedBy": "personA",
          "platformType": "K8s",
          "agentsList": ['spiffe://example.org/spire/agent/k8s_sat/minikube/7f1676c6-d79a-44af-b8f5-43f3fc393632','spiffe://example.org/spire/agent/k8s_sat/minikube/7f1676c6-d79a-44af-b8f5-43f3fc393632']
        },
        {
          "name": "cluster2",
          "domainName": "abc.org",
          "managedBy": "personB",
          "platformType": "Docker",
          "agentsList": ['agent3','agent4']
        }
    ];
    //if (typeof this.props.globalClustersList !== 'undefined') {
      //return this.props.globalClustersList.map(currentCluster => {
    if (typeof clusters !== 'undefined') {
      return clusters.map(currentCluster => {
        return <Cluster key={currentCluster.name}
          cluster={currentCluster} />;
      })
    } else {
      return ""
    }
  }

  render() {
    return (
      <div>
        <h3>Clusters List</h3>
        {this.props.globalErrorMessage !== "OK" &&
          <div className="alert-primary" role="alert">
            <pre>
              {this.props.globalErrorMessage}
            </pre>
          </div>
        }
        {IsManager}
        <br /><br />
        <div className="indvidual-list-table">
          <Table data={this.clusterList()} id="table-1" />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalClustersList: state.clusters.globalClustersList,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessage: state.tornjak.globalErrorMessage,
})

export default connect(
  mapStateToProps,
  { serverSelectedFunc, agentsListUpdateFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc, selectorInfoFunc, tornjakMessageFunc, workloadSelectorInfoFunc, agentworkloadSelectorInfoFunc, clustersListUpdateFunc }
)(ClusterList)
