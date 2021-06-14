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
    this.onChangeSelectors = this.onChangeSelectors.bind(this);
    this.onChangeClusterName = this.onChangeClusterName.bind(this);
    this.onChangeClusterType = this.onChangeClusterType.bind(this);
    this.onChangeManualClusterType = this.onChangeManualClusterType.bind(this);
    this.onChangeAdminFlag = this.onChangeAdminFlag.bind(this);
    this.prepareClusterTypeList = this.prepareClusterTypeList.bind(this);
    this.prepareSelectorsList = this.prepareSelectorsList.bind(this);
    this.onChangeSelectorsRecommended = this.onChangeSelectorsRecommended.bind(this);
    this.onChangeTtl = this.onChangeTtl.bind(this);
    this.onChangeExpiresAt = this.onChangeExpiresAt.bind(this);
    this.onChangeFederatesWith = this.onChangeFederatesWith.bind(this);
    this.onChangeDownStream = this.onChangeDownStream.bind(this);
    this.onChangeDnsNames = this.onChangeDnsNames.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      name: "",

      // spiffe_id
      clusterName: "",
      spiffeIdTrustDomain: "",
      spiffeIdPath: "",

      // parent_id
      clusterType: "",
      parentIdTrustDomain: "",
      parentIdPath: "",

      // ',' delimetered selectors
      selectors: "",
      selectorsRecommendationList: "",
      adminFlag: false,

      ttl: 0,
      expiresAt: 0,
      dnsNames: [],
      federatesWith: [],
      downstream: false,
      //token: "",
      message: "",
      servers: [],
      selectedServer: "",
      clusterTypeList: [],
      spiffeIdPrefix: "",
      clusterTypeManualEntryOption: "----Select this option and Enter Custom Cluster Type Below----",
      clusterTypeManualEntry: false,
      selectorsList: [],
      selectorsListDisplay: "Select Selectors",
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
        this.prepareSelectorsList();
      }
    } else {
      // agent doesnt need to do anything
      this.TornjakApi.populateLocalAgentsUpdate(this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateLocalTornjakServerInfo(this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
      this.setState({})
      this.prepareClusterTypeList();
      this.prepareSelectorsList();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.setState({ selectedServer: this.props.globalServerSelected });
      }
      if (prevProps.globalServerInfo !== this.props.globalServerInfo) {
        this.prepareClusterTypeList();
        this.prepareSelectorsList();
      }
      if (prevProps.globalAgentsList !== this.props.globalAgentsList) {
        this.prepareClusterTypeList();
      }
      if (prevState.parentId !== this.state.parentId) {
        this.prepareSelectorsList();
      }
    } else {
      if (prevProps.globalServerInfo !== this.props.globalServerInfo) {
        this.prepareSelectorsList();
      }
      if (prevState.parentId !== this.state.parentId) {
        this.prepareSelectorsList();
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

  prepareSelectorsList() {
    var prefix = "spiffe://", agentSelectorSet = false;
    var parentId = this.state.parentId;
    var defaultServer = prefix + this.props.globalServerInfo.data.trustDomain + "/spire/server";
    var globalAgentsWorkLoadAttestorInfo = this.props.globalAgentsWorkLoadAttestorInfo;
    if (parentId === defaultServer) {
      if (this.props.globalServerInfo.length === 0) { return }
      let serverNodeAtt = this.props.globalServerInfo.data.nodeAttestorPlugin;
      this.setState({
        selectorsList: this.props.globalSelectorInfo[serverNodeAtt]
      });
    } else if (parentId !== "") {
      for (let i = 0; i < globalAgentsWorkLoadAttestorInfo.length; i++) {
        if (parentId === globalAgentsWorkLoadAttestorInfo[i].spiffeid) {
          this.setState({
            selectorsList: this.props.globalWorkloadSelectorInfo[globalAgentsWorkLoadAttestorInfo[i].plugin]
          });
          agentSelectorSet = true;
        }
      }
      if (!agentSelectorSet) {
        this.setState({
          selectorsList: [],
          selectorsListDisplay: "Select Selectors",
        });
      }
    }
  }

  onChangeTtl(e) {
    this.setState({
      ttl: Number(e.imaginaryTarget.value)
    });
  }

  onChangeExpiresAt(e) {
    this.setState({
      expiresAt: Number(e.imaginaryTarget.value)
    });
  }

  onChangeDownStream = selected => {
    var sid = selected;
    this.setState({
      downstream: sid,
    });
  }

  onChangeDnsNames(e) {
    var sid = e.target.value;
    this.setState({
      dnsNames: sid,
    });
  }

  onChangeFederatesWith(e) {
    var sid = e.target.value;
    this.setState({
      federatesWith: sid,
    });
  }

  onChangeSelectorsRecommended = selected => {
    var i = 0, sid = selected.selectedItems, selectors = "", selectorsDisplay = "";
    for (i = 0; i < sid.length; i++) {
      if (i !== sid.length - 1) {
        selectors = selectors + sid[i].label + ":\n";
        selectorsDisplay = selectorsDisplay + sid[i].label + ",";
      }
      else {
        selectors = selectors + sid[i].label + ":"
        selectorsDisplay = selectorsDisplay + sid[i].label
      }
    }
    if (selectorsDisplay.length === 0)
      selectorsDisplay = "Select Selectors"
    this.setState({
      selectorsRecommendationList: selectors,
      selectorsListDisplay: selectorsDisplay,
    });
  }

  onChangeSelectors(e) {
    var sid = e.target.value, selectors = "";
    selectors = sid.replace(/\n/g, ",");
    this.setState({
      selectors: selectors,
    });
  }

  onChangeAdminFlag = selected => {
    var sid = selected;
    this.setState({
      adminFlag: sid,
    });
  }

  parseSpiffeId(sid) {
    if (sid.startsWith('spiffe://')) {
      var sub = sid.substr("spiffe://".length)
      var sp = sub.indexOf("/")
      if (sp > 0 && sp !== sub.length - 1) {
        var trustDomain = sub.substr(0, sp);
        var path = sub.substr(sp);
        return [true, trustDomain, path];
      }
    }
    return [false, "", ""];
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
    let selectorStrings = [], federatedWithList = [], dnsNamesWithList = [];
    e.preventDefault();

    const validSpiffeId = (this.parseSpiffeId(this.state.spiffeId))[0];
    if (!validSpiffeId) {
      this.setState({ message: "ERROR: invalid spiffe ID specified" });
      return
    }

    const validParentId = (this.parseSpiffeId(this.state.parentId))[0];
    if (!validParentId) {
      this.setState({ message: "ERROR: invalid parent ID specified" });
      return
    }

    if (this.state.selectors.length !== 0) {
      selectorStrings = this.state.selectors.split(',').map(x => x.trim())
    }
    if (selectorStrings.length === 0) {
      this.setState({ message: "ERROR: Selectors cannot be empty" })
      return
    }
    const selectorEntries = selectorStrings.map(x => x.indexOf(":") > 0 ?
      {
        "type": x.substr(0, x.indexOf(":")),
        "value": x.substr(x.indexOf(":") + 1)
      } : null)

    if (selectorEntries.some(x => x == null || x["value"].length === 0)) {
      this.setState({ message: "ERROR: Selectors not in the correct format should be type:value" })
      return
    }

    if (this.state.federatesWith.length !== 0) {
      federatedWithList = this.state.federatesWith.split(',').map(x => x.trim())
    }
    if (this.state.dnsNames.length !== 0) {
      dnsNamesWithList = this.state.dnsNames.split(',').map(x => x.trim())
    }

    var cjtData = {
      "entries": [{
        "spiffe_id": {
          "trust_domain": this.state.spiffeIdTrustDomain,
          "path": this.state.spiffeIdPath,
        },
        "parent_id": {
          "trust_domain": this.state.parentIdTrustDomain,
          "path": this.state.parentIdPath,
        },
        "selectors": selectorEntries,
        "admin": this.state.adminFlag,
        "ttl": this.state.ttl,
        "expires_at": this.state.expiresAt,
        "downstream": this.state.downstream,
        "federates_with": federatedWithList,
        "dns_names": dnsNamesWithList,
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
                        //value={this.state.spiffeId}
                        defaultValue={this.state.spiffeIdPrefix}
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
                    <div className="selectors-multiselect">
                      <MultiSelect.Filterable
                        required
                        titleText="Selectors Recommendation"
                        helperText="i.e. k8s_sat:cluster,..."
                        placeholder={this.state.selectorsListDisplay}
                        ariaLabel="selectors-multiselect"
                        id="selectors-multiselect"
                        items={this.state.selectorsList}
                        label={this.state.selectorsListDisplay}
                        onChange={this.onChangeSelectorsRecommended}
                      />
                    </div>
                    <div className="selectors-textArea">
                      <TextArea
                        cols={50}
                        helperText="i.e. k8s_sat:cluster:demo-cluster,..."
                        id="selectors-textArea"
                        invalidText="A valid value is required"
                        labelText="Selectors"
                        placeholder="Enter Selectors - Refer to Selectors Recommendation"
                        defaultValue={this.state.selectorsRecommendationList}
                        rows={8}
                        onChange={this.onChangeSelectors}
                      />
                    </div>
                    <div className="advanced">
                      <fieldset className="bx--fieldset">
                        <legend className="bx--label">Advanced</legend>
                        <div className="ttl-input">
                          <NumberInput
                            helperText="Ttl for identities issued for this entry (In seconds)"
                            id="ttl-input"
                            invalidText="Number is not valid"
                            label="Time to Leave (Ttl)"
                            //max={100}
                            min={0}
                            step={1}
                            value={0}
                            onChange={this.onChangeTtl}
                          />
                        </div>
                        <div className="expiresAt-input">
                          <NumberInput
                            helperText="Entry expires at (seconds since Unix epoch)"
                            id="expiresAt-input"
                            invalidText="Number is not valid"
                            label="Expires At"
                            //max={100}
                            min={0}
                            step={1}
                            value={0}
                            onChange={this.onChangeExpiresAt}
                          />
                        </div>
                        <div className="federates-with-input-field">
                          <TextInput
                            helperText="i.e. example.org,abc.com (Separated By Commas)"
                            id="federates-with-input-field"
                            invalidText="A valid value is required - refer to helper text below"
                            labelText="Federates With"
                            placeholder="Enter Names of trust domains the identity described by this entry federates with"
                            onChange={this.onChangeFederatesWith}
                          />
                        </div>
                        <div className="dnsnames-input-field">
                          <TextInput
                            helperText="i.e. example.org,abc.com (Separated By Commas)"
                            id="dnsnames-input-field"
                            invalidText="A valid value is required - refer to helper text below"
                            labelText="DNS Names"
                            placeholder="Enter DNS Names associated with the identity described by this entry"
                            onChange={this.onChangeDnsNames}
                          />
                        </div>
                        <div className="admin-flag-checkbox">
                          <Checkbox
                            labelText="Admin Flag"
                            id="admin-flag"
                            onChange={this.onChangeAdminFlag}
                          />
                        </div>
                        <div className="down-stream-checkbox">
                          <Checkbox
                            labelText="Down Stream"
                            id="down-steam"
                            onChange={this.onChangeDownStream}
                          />
                        </div>
                      </fieldset>
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
