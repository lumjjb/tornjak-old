import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Tabs, Tab, Dropdown, TextInput, MultiSelect, Checkbox, TextArea, NumberInput } from 'carbon-components-react';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import TornjakApi from './tornjak-api-helpers';
import { clusterType } from '../res/data';
import './style.css';
import {
  clusterTypeInfoFunc,
  serverSelectedFunc,
  selectorInfoFunc,
  agentsListUpdateFunc,
  tornjakMessageFunc,
  tornjakServerInfoUpdateFunc,
  serverInfoUpdateFunc
} from 'redux/actions';

class ClusterManagement extends Component {
  constructor(props) {
    super(props);
    this.TornjakApi = new TornjakApi();
    this.onChangeClusterName = this.onChangeClusterName.bind(this);
    this.onChangeClusterType = this.onChangeClusterType.bind(this);
    this.onChangeManualClusterType = this.onChangeManualClusterType.bind(this);
    this.onChangeClusterDomainName = this.onChangeClusterDomainName.bind(this);
    this.onChangeClusterManagedBy = this.onChangeClusterManagedBy.bind(this);
    this.prepareClusterTypeList = this.prepareClusterTypeList.bind(this);
    this.prepareAgentsList = this.prepareAgentsList.bind(this);
    this.onChangeAgentsList = this.onChangeAgentsList.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      name: "",

      // spiffe_id
      clusterName: "",
      spiffeIdTrustDomain: "",
      spiffeIdPath: "",

      // parent_id
      clusterType: "",
      clusterDomainName: "",
      clusterManagedBy: "",
      parentIdTrustDomain: "",
      parentIdPath: "",

      // ',' delimetered selectors
      selectors: "",
      clusterAgentsList: "",
      //token: "",
      message: "",
      servers: [],
      selectedServer: "",
      clusterTypeList: [],
      clusterTypeManualEntryOption: "----Select this option and Enter Custom Cluster Type Below----",
      clusterTypeManualEntry: false,
      agentsList: [],
      agentsListDisplay: "Select Agents",
    }
  }

  componentDidMount() {
    this.props.clusterTypeInfoFunc(clusterType); //set cluster type info
    if (IsManager) {
      if (this.props.globalServerSelected !== "" && (this.props.globalErrorMessage === "OK" || this.props.globalErrorMessage === "")) {
        this.TornjakApi.populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc)
        this.TornjakApi.refreshSelectorsState(this.props.globalServerSelected, this.props.agentworkloadSelectorInfoFunc);
        this.setState({ selectedServer: this.props.globalServerSelected });
        this.prepareClusterTypeList();
        this.prepareAgentsList();
      }
    } else {
      // agent doesnt need to do anything
      this.TornjakApi.populateLocalAgentsUpdate(this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateLocalTornjakServerInfo(this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
      this.setState({})
      this.prepareClusterTypeList();
      this.prepareAgentsList();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.setState({ selectedServer: this.props.globalServerSelected });
      }
      if (prevProps.globalServerInfo !== this.props.globalServerInfo) {
        this.prepareClusterTypeList();
        this.prepareAgentsList();
      }
      if (prevProps.globalAgentsList !== this.props.globalAgentsList) {
        this.prepareClusterTypeList();
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

  prepareAgentsList() {
    var prefix = "spiffe://", agentSelectorSet = false;
    var defaultServer = prefix + this.props.globalServerInfo.data.trustDomain + "/spire/server";
    let localAgentsIdList = [];
    //default option
    localAgentsIdList[0] = {}
    localAgentsIdList[0]["label"] = defaultServer;
    //agents
    for (let i = 0; i < this.props.globalAgentsList.length; i++) {
      localAgentsIdList[i + 1] = {}
      localAgentsIdList[i + 1]["label"] = prefix + this.props.globalAgentsList[i].id.trust_domain + this.props.globalAgentsList[i].id.path;
    }
    this.setState({
      agentsList: localAgentsIdList,
      agentsListDisplay: "Select Agents",
    });
  }

  onChangeAgentsList = selected => {
    var sid = selected.selectedItems, agents = "", agentsDisplay = "";
    agentsDisplay = sid;
    agents = sid;
    if (agentsDisplay.length === 0)
      agentsDisplay = "Select Agents"
    this.setState({
      clusterAgentsList: agents,
      agentsListDisplay: agentsDisplay,
    });
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
  // Tag related things

  handleTagDelete(i) {
    const { tags } = this.state;
    this.setState({
      tags: tags.filter((tag, index) => index !== i),
    });
  }

  handleTagAddition(tag) {
    this.setState(state => ({ tags: [...state.tags, tag] }));
  }

  handleTagDrag(tag, currPos, newPos) {
    const tags = [...this.state.tags];
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    this.setState({ tags: newTags });
  }

  getApiEntryCreateEndpoint() {
    if (!IsManager) {
      return GetApiServerUri('/api/entry/create')
    } else if (IsManager && this.state.selectedServer !== "") {
      return GetApiServerUri('/manager-api/entry/create') + "/" + this.state.selectedServer
    } else {
      this.setState({ message: "Error: No server selected" })
      return ""
    }
  }

  onSubmit(e) {
    let agentsList = [];
    e.preventDefault();

    if (this.state.clusterName.length === 0) {
      this.setState({ message: "ERROR: Cluster Name Can Not Be Empty - Enter Cluster Name" });
      return
    }

    if (this.state.clusterType.length === 0) {
      this.setState({ message: "ERROR: Cluster Type Can Not Be Empty - Choose/ Enter Cluster Type" });
      return
    }

    if (this.state.clusterAgentsList.length !== 0) {
      agentsList = this.state.clusterAgentsList.split(',').map(x => x.trim())
    }

    var cjtData = {
      "clusters": [{
        "clusterName": this.state.clusterName,
        "clusterType": this.state.clusterType,
        "clusterDomainName": this.state.clusterDomainName,
        "clusterManagedBy": this.state.clusterManagedBy,
        "clusterAgentsList": agentsList
      }]
    }

    let endpoint = this.getApiEntryCreateEndpoint();
    if (endpoint === "") {
      return
    }
    axios.post(endpoint, cjtData)
      .then(res => this.setState({ message: "Requst:" + JSON.stringify(cjtData, null, ' ') + "\n\nSuccess:" + JSON.stringify(res.data, null, ' ') }))
      .catch(err => this.setState({ message: "ERROR:" + err }))
  }

  render() {
    const ClusterType = this.state.clusterTypeList;
    return (
      <div>
        <div className="cluster-management-tabs">
          <Tabs scrollIntoView={false} >
            <Tab className="cluster-management-tab1"
              href="#"
              id="tab-1"
              label="Create Cluster"
            >
              <div className="cluster-create">
                <div className="create-entry-title">
                  <h3>Create New Cluster</h3>
                </div>
                <form onSubmit={this.onSubmit}>
                  <div className="alert-primary" role="alert">
                    <pre>
                      {this.state.message}
                    </pre>
                  </div>
                  {IsManager}
                  <br /><br />
                  <div className="entry-form">
                    <div className="clustername-input-field">
                      <TextInput
                        helperText="i.e. exampleabc"
                        id="clusterNameInputField"
                        invalidText="A valid value is required - refer to helper text below"
                        labelText="CLUSTER NAME"
                        placeholder="Enter CLUSTER NAME"
                        onChange={this.onChangeClusterName}
                      />
                    </div>
                    <div className="clustertype-drop-down">
                      <Dropdown
                        ariaLabel="clustertype-drop-down"
                        id="clustertype-drop-down"
                        items={ClusterType}
                        label="Select Cluster Type"
                        titleText="CLUSTER TYPE"
                        onChange={this.onChangeClusterType}
                      />
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
                        labelText="CLUSTER DOMAIN NAME/ URL"
                        placeholder="Enter CLUSTER DOMAIN NAME/ URL"
                        onChange={this.onChangeClusterDomainName}
                      />
                    </div>
                    <div className="cluster-managed-by-input-field">
                      <TextInput
                        helperText="i.e. person-A"
                        id="clusterNameInputField"
                        invalidText="A valid value is required - refer to helper text below"
                        labelText="CLUSTER MANAGED BY"
                        placeholder="Enter CLUSTER MANAGED BY"
                        //value={this.state.spiffeId}
                        onChange={this.onChangeClusterManagedBy}
                      />
                    </div>
                    <div className="agents-multiselect">
                      <MultiSelect.Filterable
                        titleText="ASSIGN AGENTS/ NODES TO CLUSTER"
                        helperText="i.e. spiffe://example.org/agent/myagent1,i.e. spiffe://example.org/spire/server..."
                        placeholder={this.state.agentsListDisplay}
                        ariaLabel="selectors-multiselect"
                        id="selectors-multiselect"
                        items={this.state.agentsList}
                        label={this.state.agentsListDisplay}
                        onChange={this.onChangeAgentsList}
                      />
                    </div>
                    <div className="form-group">
                      <input type="submit" value="Create Entry" className="btn btn-primary" />
                    </div>
                  </div>
                </form>
              </div>
            </Tab>
            <Tab
              href="#"
              id="tab-2"
              label="Assign Agents"
            >
              <div className="some-content">
                <div className="create-entry-title">
                  <h3>Assign Agents/ Nodes to Cluster</h3>
                </div>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    )
  }
}


const mapStateToProps = (state) => ({
  globalClusterTypeInfo: state.clusters.globalClusterTypeInfo,
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
  { clusterTypeInfoFunc, serverSelectedFunc, selectorInfoFunc, agentsListUpdateFunc, tornjakMessageFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc }
)(ClusterManagement)
