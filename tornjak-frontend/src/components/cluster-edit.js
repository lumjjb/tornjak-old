import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Dropdown, TextInput, MultiSelect, TextArea } from 'carbon-components-react';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import TornjakApi from './tornjak-api-helpers';
import './style.css';
import {
  clustersListUpdateFunc,
  clusterTypeInfoFunc,
  serverSelectedFunc,
  selectorInfoFunc,
  agentsListUpdateFunc,
  tornjakMessageFunc,
  tornjakServerInfoUpdateFunc,
  serverInfoUpdateFunc
} from 'redux/actions';

class ClusterEdit extends Component {
  constructor(props) {
    super(props);
    this.TornjakApi = new TornjakApi();
    this.onChangeClusterNameList = this.onChangeClusterNameList.bind(this);
    this.onChangeClusterName = this.onChangeClusterName.bind(this);
    this.onChangeClusterType = this.onChangeClusterType.bind(this);
    this.onChangeManualClusterType = this.onChangeManualClusterType.bind(this);
    this.onChangeClusterDomainName = this.onChangeClusterDomainName.bind(this);
    this.onChangeClusterManagedBy = this.onChangeClusterManagedBy.bind(this);
    this.prepareClusterNameList = this.prepareClusterNameList.bind(this);
    this.prepareAgentsList = this.prepareAgentsList.bind(this);
    this.onChangeAgentsList = this.onChangeAgentsList.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      clusterName: "",
      clusterType: "",
      clusterDomainName: "",
      clusterManagedBy: "",
      clusterAgentsList: "",
      clusterNameList: [],
      clusterTypeList: [],
      clusterTypeManualEntryOption: "----Select this option and Enter Custom Cluster Type Below----",
      clusterTypeManualEntry: false,
      message: "",
      statusOK: "",
      successJsonMessege: "",
      selectedServer: "",
      agentsList: [],
      agentsListDisplay: "Select Agents",
      assignedAgentsListDisplay: "",
    }
  }

  componentDidMount() {
    if (IsManager) {
      if (this.props.globalServerSelected !== "" && (this.props.globalErrorMessage === "OK" || this.props.globalErrorMessage === "")) {
        this.TornjakApi.populateClustersUpdate(this.props.globalServerSelected, this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc)
        this.setState({ selectedServer: this.props.globalServerSelected });
        this.prepareClusterNameList();
        this.prepareAgentsList();
        this.prepareClusterTypeList();
      }
    } else {
      this.TornjakApi.populateLocalClustersUpdate(this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
      this.setState({})
      this.prepareClusterNameList();
      this.prepareAgentsList();
      this.prepareClusterTypeList();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.setState({ selectedServer: this.props.globalServerSelected });
      }
      if (prevProps.globalServerInfo !== this.props.globalServerInfo) {
        this.prepareClusterNameList();
        this.prepareAgentsList();
      }
      if (prevProps.globalAgentsList !== this.props.globalAgentsList) {
        this.prepareClusterNameList();
      }
      if (prevState.parentId !== this.state.parentId) {
        this.prepareAgentsList();
      }
    } else {
      if (prevProps.globalServerInfo !== this.props.globalServerInfo) {
        this.prepareAgentsList();
      }
      if (prevState.parentId !== this.state.parentId) {
        this.prepareAgentsList();
      }
    }
  }

  prepareClusterTypeList() {
    let localClusterTypeList = [];
    if (this.props.globalServerInfo.length === 0) {
      return
    }
    //user prefered option
    localClusterTypeList[0] = this.state.clusterTypeManualEntryOption;
    //agents
    for (let i = 0; i < this.props.globalClusterTypeInfo.length; i++) {
      localClusterTypeList[i + 1] = this.props.globalClusterTypeInfo[i];
    }
    this.setState({
      clusterTypeList: localClusterTypeList
    });
  }

  prepareClusterNameList() {
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
    //var clusters = this.props.globalClustersList;
    let localClusterNameList = [];
    if (this.props.globalServerInfo.length === 0) {
      return
    }

    for (let i = 0; i < clusters.length; i++) {
      localClusterNameList[i] = clusters[i].name;
    }
    this.setState({
      clusterNameList: localClusterNameList
    });
  }

  prepareAgentsList() {
    var prefix = "spiffe://";
    let localAgentsIdList = [];
    //agents
    for (let i = 0; i < this.props.globalAgentsList.length; i++) {
      localAgentsIdList[i] = {}
      localAgentsIdList[i]["label"] = prefix + this.props.globalAgentsList[i].id.trust_domain + this.props.globalAgentsList[i].id.path;
    }
    this.setState({
      agentsList: localAgentsIdList,
      agentsListDisplay: "Select Agents",
    });
  }

  onChangeClusterNameList(e) {
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
    //var sid = e.selectedItem, clusters = this.props.globalClustersList, cluster = [];
    var sid = e.selectedItem, cluster = [];
    for (let i = 0; i < clusters.length; i++) {
      if (clusters[i].name === sid) {
        cluster = clusters[i];
      }
    }
    this.setState({
      clusterName: cluster.name,
      clusterType: cluster.platformType,
      clusterDomainName: cluster.domainName,
      clusterManagedBy: cluster.managedBy,
      clusterAgentsList: cluster.agentsList,
      agentsListDisplay: cluster.agentsList,
      assignedAgentsListDisplay: cluster.agentsList,
    });
    return
  }

  onChangeClusterName(e) {
    var sid = e.target.value;
    this.setState({
      clusterName: sid
    });
    return
  }

  onChangeClusterType = selected => {
    var sid = selected.selectedItem;
    if (sid.length === 0) {
      this.setState({
        clusterType: sid,
      });
      return
    }
    if (sid === this.state.clusterTypeManualEntryOption) {
      this.setState({
        clusterTypeManualEntry: true,
        clusterType: sid,
      });
      return
    }
    this.setState({
      clusterTypeManualEntry: false
    });
    this.setState({
      clusterType: sid,
    });
    return
  }

  onChangeManualClusterType(e) {
    var sid = e.target.value;
    if (sid.length === 0) {
      this.setState({
        clusterType: sid
      });
      return
    }
    this.setState({
      clusterType: sid
    });
    return
  }

  onChangeClusterDomainName(e) {
    var sid = e.target.value;
    this.setState({
      clusterDomainName: sid
    });
    return
  }

  onChangeClusterManagedBy(e) {
    var sid = e.target.value;
    this.setState({
      clusterManagedBy: sid
    });
    return
  }

  onChangeAgentsList = selected => {
    var sid = selected.selectedItems, agents = "", agentsDisplay = "", assignedAgentsDisplay = "";
    let localAgentsIdList = [];
    for (let i = 0; i < sid.length; i++) {
      localAgentsIdList[i] = sid[i].label;
    }
    agents = localAgentsIdList;
    agentsDisplay = localAgentsIdList.toString();
    assignedAgentsDisplay = localAgentsIdList.join("\n");
    if (agentsDisplay.length === 0) {
      agentsDisplay = "Select Agents"
    }
    this.setState({
      clusterAgentsList: agents,
      agentsListDisplay: agentsDisplay,
      assignedAgentsListDisplay: assignedAgentsDisplay,
    });
  }

  getApiEntryCreateEndpoint() {
    if (!IsManager) {
      return GetApiServerUri('/api/tornjak/cluster/create')
    } else if (IsManager && this.state.selectedServer !== "") {
      return GetApiServerUri('/manager-api/tornjak/cluster/create') + "/" + this.state.selectedServer
    } else {
      this.setState({ message: "Error: No server selected" })
      return ""
    }
  }

  onSubmit(e) {
    let agentsList = [];
    e.preventDefault();

    // if (this.state.chooseCluster.length === 0) {
    //   this.setState({ message: "ERROR: Please Choose a Cluster" });
    //   return
    // }

    if (this.state.clusterName.length === 0) {
      this.setState({ message: "ERROR: Cluster Name Can Not Be Empty - Enter Cluster Name" });
      return
    }

    if (this.state.clusterType.length === 0) {
      this.setState({ message: "ERROR: Cluster Type Can Not Be Empty - Choose/ Enter Cluster Type" });
      return
    }

    // if (this.state.clusterAgentsList.length !== 0) {
    //   agentsList = this.state.clusterAgentsList.split(',').map(x => x.trim())
    // }
    var cjtData = {
      "cluster": {
        "clusterName": this.state.clusterName,
        "clusterType": this.state.clusterType,
        "clusterDomainName": this.state.clusterDomainName,
        "clusterManagedBy": this.state.clusterManagedBy,
        "clusterAgentsList": this.state.clusterAgentsList
      }
    }

    console.log(cjtData)
    let endpoint = this.getApiEntryCreateEndpoint();
    if (endpoint === "") {
      return
    }
    axios.post(endpoint, cjtData)
      .then(
        res => this.setState({
          message: "Requst:" + JSON.stringify(cjtData, null, ' ') + "\n\nSuccess:" + JSON.stringify(res.data, null, ' '),
          statusOK: "OK",
          successJsonMessege: res.data.results[0].status.message
        })
      )
      .catch(
        err => this.setState({
          message: "ERROR:" + err,
          statusOK: "ERROR"
        })
      )
  }
  render() {
    const ClusterNames = this.state.clusterNameList, ClusterType = this.state.clusterTypeList;
    return (
      <div>
        <div className="cluster-edit">
          <div className="create-edit-title">
            <h3>Edit Cluster</h3>
          </div>
          <form onSubmit={this.onSubmit}>
            {IsManager}
            <br /><br />
            <div className="entry-form">
              <div className="clustertype-drop-down">
                <Dropdown
                  aria-required="true"
                  ariaLabel="clustertype-drop-down"
                  id="clustertype-drop-down"
                  items={ClusterNames}
                  label="Select Cluster"
                  titleText="Choose Cluster [*required]"
                  onChange={this.onChangeClusterNameList}
                  required />
                <p className="cluster-helper">i.e. Choose Cluster Name To Edit</p>
              </div>
              <div className="clustername-input-field">
                <TextInput
                  helperText="i.e. exampleabc"
                  id="clusterNameInputField"
                  invalidText="A valid value is required - refer to helper text below"
                  labelText="Edit Cluster Name"
                  placeholder="Edit CLUSTER NAME"
                  defaultValue={this.state.clusterName}
                  onChange={this.onChangeClusterName}
                  required />
              </div>
              <div className="clustertype-drop-down">
                <Dropdown
                  ariaLabel="clustertype-drop-down"
                  id="clustertype-drop-down"
                  items={ClusterType}
                  label="Select Cluster Type"
                  titleText="Edit Cluster Type"
                  defaultValue={this.state.clusterType}
                  onChange={this.onChangeClusterType}
                  required />
                <p className="cluster-helper">i.e. Kubernetes, VMs...</p>
              </div>
              {this.state.clusterTypeManualEntry === true &&
                <div className="clustertype-manual-input-field">
                  <TextInput
                    helperText="i.e. Kubernetes, VMs..."
                    id="clusterTypeManualInputField"
                    invalidText="A valid value is required - refer to helper text below"
                    labelText="Cluster Type - Manual Entry"
                    placeholder="Enter Cluster Type"
                    onChange={(e) => {
                      this.onChangeManualClusterType(e);
                    }}
                  />
                </div>}
              <div className="cluster-domain-name-input-field">
                <TextInput
                  helperText="i.e. example.org"
                  id="clusterDomainNameInputField"
                  invalidText="A valid value is required - refer to helper text below"
                  labelText="Edit Cluster Domain Name/ URL"
                  placeholder="Edit CLUSTER DOMAIN NAME/ URL"
                  defaultValue={this.state.clusterDomainName}
                  onChange={this.onChangeClusterDomainName}
                />
              </div>
              <div className="cluster-managed-by-input-field">
                <TextInput
                  helperText="i.e. person-A"
                  id="clusterNameInputField"
                  invalidText="A valid value is required - refer to helper text below"
                  labelText="Edit Cluster Managed By"
                  placeholder="Edit CLUSTER MANAGED BY"
                  defaultValue={this.state.clusterManagedBy}
                  onChange={this.onChangeClusterManagedBy}
                />
              </div>
              <div className="agents-multiselect">
                <MultiSelect.Filterable
                  titleText="Edit Assigned Agents To Cluster"
                  helperText="i.e. spiffe://example.org/agent/myagent1..."
                  placeholder={this.state.agentsListDisplay}
                  ariaLabel="selectors-multiselect"
                  id="selectors-multiselect"
                  items={this.state.agentsList}
                  label={this.state.agentsListDisplay}
                  onChange={this.onChangeAgentsList}
                />
              </div>
              <div className="selectors-textArea">
                <TextArea
                  cols={50}
                  helperText="i.e. spiffe://example.org/agent/myagent1..."
                  id="selectors-textArea"
                  invalidText="A valid value is required"
                  labelText="Assigned Agents"
                  placeholder="Assigned agents will be populated here - Refer to Assign Agents To Cluster"
                  defaultValue={this.state.assignedAgentsListDisplay}
                  rows={8}
                  disabled
                />
              </div>
              <div className="form-group">
                <input type="submit" value="Edit Cluster" className="btn btn-primary" />
              </div>
              <div>
                {this.state.statusOK === "OK" && this.state.successJsonMessege === "OK" &&
                  <p className="success-message">--ENTRY SUCCESSFULLY CREATED--</p>
                }
                {(this.state.statusOK === "ERROR" || (this.state.successJsonMessege !== "OK" && this.state.successJsonMessege !== "")) &&
                  <p className="failed-message">--ENTRY CREATION FAILED--</p>
                }
              </div>
              <div className="alert-primary" role="alert">
                <pre>
                  {this.state.message}
                </pre>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
}


const mapStateToProps = (state) => ({
  globalClusterTypeInfo: state.clusters.globalClusterTypeInfo,
  globalClustersList: state.clusters.globalClustersList,
  globalServerSelected: state.servers.globalServerSelected,
  globalSelectorInfo: state.servers.globalSelectorInfo,
  globalAgentsList: state.agents.globalAgentsList,
  globalServerInfo: state.servers.globalServerInfo,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessage: state.tornjak.globalErrorMessage,
  globalWorkloadSelectorInfo: state.servers.globalWorkloadSelectorInfo,
  globalAgentsWorkLoadAttestorInfo: state.agents.globalAgentsWorkLoadAttestorInfo,
})

export default connect(
  mapStateToProps,
  { clusterTypeInfoFunc, serverSelectedFunc, selectorInfoFunc, agentsListUpdateFunc, tornjakMessageFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc, clustersListUpdateFunc }
)(ClusterEdit)
