import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
//import 'carbon-components/css/carbon-components.min.css';
import { Dropdown, TextInput, MultiSelect, Checkbox, TextArea, NumberInput } from 'carbon-components-react';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import './style.css';
import {
  serverSelected,
  selectorInfo,
  agentsListUpdate,
} from 'actions';

class CreateEntry extends Component {
  constructor(props) {
    super(props);

    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeSelectors = this.onChangeSelectors.bind(this);
    this.onChangeSpiffeId = this.onChangeSpiffeId.bind(this);
    this.onChangeParentId = this.onChangeParentId.bind(this);
    this.onChangeManualParentId = this.onChangeManualParentId.bind(this);
    this.onChangeAdminFlag = this.onChangeAdminFlag.bind(this);
    this.setSelectorInfo = this.setSelectorInfo.bind(this);
    this.prepareParentIdAgentsList = this.prepareParentIdAgentsList.bind(this);
    this.prepareSelectorsList = this.prepareSelectorsList.bind(this);
    this.onChangeSelectorsRecommended = this.onChangeSelectorsRecommended.bind(this);


    //this.onChangeTtl = this.onChangeTtl.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      name: "",

      // spiffe_id
      spiffeId: "",
      spiffeIdTrustDomain: "",
      spiffeIdPath: "",

      // parent_id
      parentId: "",
      parentIdTrustDomain: "",
      parentIdPath: "",

      // ',' delimetered selectors
      selectors: "",
      selectorsRecommendationList: "",
      adminFlag: false,

      //ttl: 500,
      //token: "",
      message: "",
      servers: [],
      selectedServer: "",
      agentsIdList: [],
      spiffeIdPrefix: "",
      parentIdManualEntryOption: "----Select this option and Enter Custom Parent ID Below----",
      parentIDManualEntry: false,
      selectorsList: [],
      selectorsListDisplay: "Select Selectors",
    }
  }

  componentDidMount() {
    this.setSelectorInfo();
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        this.setState({ selectedServer: this.props.globalServerSelected });
        this.prepareParentIdAgentsList();
        this.prepareSelectorsList();
      }
    } else {
      // agent doesnt need to do anything
      this.setState({})
      this.prepareParentIdAgentsList();
      this.prepareSelectorsList();
    }
  }

  componentDidUpdate(prevProps) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.setState({ selectedServer: this.props.globalServerSelected });
        console.log("this.props.globalServerInfo.length", this.props.globalServerInfo)
        if (this.props.globalServerInfo.length !== 0) {
          this.prepareParentIdAgentsList();
          this.prepareSelectorsList();
        }
      }
    }
  }

  setSelectorInfo() {
    const selectors =
    {
      "aws_iid": [
        {
          "label": "aws_iid:tag:name"
        },
        {
          "label": "aws_iid:sg:id"
        },
        {
          "label": "aws_iid:sg:name"
        },
        {
          "label": "aws_iid:iamrole:arn:aws:iam"
        }
      ],
      "gcp_iit": [
        {
          "label": "gcp_iit:project-id"
        },
        {
          "label": "gcp_iit:zone"
        },
        {
          "label": "gcp_iit:instance-name"
        },
        {
          "label": "gcp_iit:tag"
        },
        {
          "label": "gcp_iit:sa"
        },
        {
          "label": "gcp_iit:label"
        },
        {
          "label": "gcp_iit:metadata"
        }
      ],
      "k8s_sat": [
        {
          "label": "k8s_sat:cluster"
        },
        {
          "label": "k8s_sat:agent_ns"
        },
        {
          "label": "k8s_sat:agent_sa"
        }
      ],
      "k8s_psat": [
        {
          "label": "k8s_psat:cluster"
        },
        {
          "label": "k8s_psat:agent_ns"
        },
        {
          "label": "k8s_psat:agent_sa"
        },
        {
          "label": "k8s_psat:agent_pod_name"
        },
        {
          "label": "k8s_psat:agent_pod_uid"
        },
        {
          "label": "k8s_psat:agent_pod_label"
        },
        {
          "label": "k8s_psat:agent_node_ip"
        },
        {
          "label": "k8s_psat:agent_node_name"
        },
        {
          "label": "k8s_psat:agent_node_uid"
        },
        {
          "label": "k8s_psat:agent_node_label"
        }
      ],
    };
    this.props.selectorInfo(selectors)
  }

  prepareParentIdAgentsList() {
    var i = 0, prefix = "spiffe://";;
    let localAgentsIdList = [];
    //user prefered option
    localAgentsIdList[0] = this.state.parentIdManualEntryOption;
    //default option
    localAgentsIdList[1] = prefix + this.props.globalServerInfo.data.trustDomain + "/spire/server";
    //agents
    for (i = 0; i < this.props.globalagentsList.length; i++) {
      localAgentsIdList[i + 2] = prefix + this.props.globalagentsList[i].id.trust_domain + this.props.globalagentsList[i].id.path;
    }
    console.log(localAgentsIdList)
    this.setState({
      agentsIdList: localAgentsIdList
    });
    //window.location.reload();
  }

  prepareSelectorsList() {
    let serverNodeAtt = this.props.globalServerInfo.data.nodeAttestorPlugin;
    this.setState({
      selectorsList: this.props.globalSelectorInfo[serverNodeAtt]
    });
  }
  spiffeIdSelected = selected => {
    console.log(selected.selectedItem)
  }
  onChangeName(e) {
    this.setState({
      name: e.target.value
    });
  }

  onChangeTtl(e) {
    this.setState({
      ttl: Number(e.target.value)
    });
  }

  onChangeSelectorsRecommended = selected => {
    var i = 0, sid = selected.selectedItems, selectors = "", selectorsDisplay = "";
    for (i = 0; i < sid.length; i++) {
      if (i != sid.length - 1) {
        selectors = selectors + sid[i].label + ":" + '\n';
        selectorsDisplay = selectorsDisplay + sid[i].label + ",";
      }
      else {
        selectors = selectors + sid[i].label + ":"
        selectorsDisplay = selectorsDisplay + sid[i].label
      }
    }
    if (selectorsDisplay.length == 0)
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

  onChangeSpiffeId(e) {
    var sid = e.target.value;
    console.log(sid)
    console.log(sid)
    if (sid.length === 0) {
      this.setState({
        spiffeId: sid,
        spiffeIdTrustDomain: "",
        spiffeIdPath: "",
        message: "",
      });
      return
    }

    const [validSpiffeId, trustDomain, path] = this.parseSpiffeId(sid)
    if (validSpiffeId) {
      this.setState({
        message: "",
        spiffeId: sid,
        spiffeIdTrustDomain: trustDomain,
        spiffeIdPath: path,
      });
      return
    }
    // else invalid spiffe ID
    this.setState({
      spiffeId: sid,
      message: "Invalid Spiffe ID",
      spiffeIdTrustDomain: "",
      spiffeIdPath: "",
    });
    return
  }

  onChangeParentId = selected => {
    var prefix = "spiffe://", sid = selected.selectedItem;
    if (sid.length === 0) {
      this.setState({
        parentId: sid,
        parentIdTrustDomain: "",
        parentIdPath: "",
        message: "",
      });
      return
    }
    if (sid === this.state.parentIdManualEntryOption) {
      this.setState({
        parentIDManualEntry: true,
        spiffeIdPrefix: "",
      });
      return
    }
    this.setState({
      parentIDManualEntry: false
    });
    const [validSpiffeId, trustDomain, path] = this.parseSpiffeId(sid)
    var spiffeIdPrefix = prefix + trustDomain + "/";
    if (validSpiffeId) {
      this.setState({
        message: "",
        parentId: sid,
        parentIdTrustDomain: trustDomain,
        parentIdPath: path,
        spiffeIdPrefix: spiffeIdPrefix,
      });
      return
    }
    // else invalid spiffe ID
    this.setState({
      parentId: sid,
      message: "Invalid Parent ID",
      parentIdTrustDomain: "",
      parentIdPath: "",
    });
    return
  }

  onChangeManualParentId(e) {
    var prefix = "spiffe://", sid = e.target.value;
    if (sid.length === 0) {
      this.setState({
        parentId: sid,
        parentIdTrustDomain: "",
        parentIdPath: "",
        message: "",
      });
      return
    }
    const [validSpiffeId, trustDomain, path] = this.parseSpiffeId(sid)
    var spiffeIdPrefix = prefix + trustDomain + "/";
    if (validSpiffeId) {
      this.setState({
        message: "",
        parentId: sid,
        parentIdTrustDomain: trustDomain,
        parentIdPath: path,
        spiffeIdPrefix: spiffeIdPrefix,
      });
      return
    }
    // else invalid spiffe ID
    this.setState({
      parentId: sid,
      message: "Invalid Parent ID",
      parentIdTrustDomain: "",
      parentIdPath: "",
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

    const selectorStrings = this.state.selectors.split(',').map(x => x.trim())
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
      }]
    }

    let endpoint = this.getApiEntryCreateEndpoint();
    if (endpoint === "") {
      return
    }
    axios.post(endpoint, cjtData)
      .then(res => this.setState({ message: "Requst:" + JSON.stringify(cjtData, null, ' ') + "\n\nSuccess:" + JSON.stringify(res.data, null, ' ') }))
      .catch(err => this.setState({ message: "ERROR:" + err }))
    //window.location = '/';
  }

  render() {
    const ParentIdList = this.state.agentsIdList;
    return (
      <div>
        <h3>Create New Entry</h3>
        <form onSubmit={this.onSubmit}>
          <div className="alert-primary" role="alert">
            <pre>
              {this.state.message}
            </pre>
          </div>
          {IsManager}
          <br /><br />
          <div className="entry-form">
            <div className="parentId-drop-down">
              <Dropdown
                ariaLabel="parentId-drop-down"
                id="parentId-drop-down"
                items={ParentIdList}
                label="Select Parent ID"
                titleText="Parent ID"
                //value={this.state.parentId}
                onChange={this.onChangeParentId}
              />
              <p className="parentId-helper">i.e. spiffe://example.org/agent/myagent1 - For node entries, select spiffe server as parent i.e. spiffe://example.org/spire/server</p>
            </div>
            {this.state.parentIDManualEntry == true &&
              <div className="parentId-manual-input-field">
                <TextInput
                  helperText="i.e. spiffe://example.org/agent/myagent1 - For node entries, specify spiffe server as parent i.e. spiffe://example.org/spire/server"
                  id="parentIdManualInputField"
                  invalidText="A valid value is required - refer to helper text below"
                  labelText="Parent ID - Manual Entry"
                  placeholder="Enter Parent ID"
                  //value={this.state.spiffeId}
                  //defaultValue={this.state.spiffeIdPrefix}
                  onChange={(e) => {
                    this.onChangeManualParentId(e);
                  }}
                />
              </div>}
            <div className="spiffeId-input-field">
              <TextInput
                helperText="i.e. spiffe://example.org/sample/spiffe/id"
                id="spiffeIdInputField"
                invalidText="A valid value is required - refer to helper text below"
                labelText="SPIFFE ID"
                placeholder="Enter SPIFFE ID"
                //value={this.state.spiffeId}
                defaultValue={this.state.spiffeIdPrefix}
                onChange={(e) => {
                  const input = e.target.value
                  e.target.value = this.state.spiffeIdPrefix + input.substr(this.state.spiffeIdPrefix.length);
                  this.onChangeSpiffeId(e);
                }}
              //onChange={this.onChangeSpiffeId}
              />
            </div>
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
            <div className="admin-flag-checkbox">
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
                    value={50}
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
                    value={50}
                  />
                </div>
                <div className="federates-with-input-field">
                  <TextInput
                    helperText="i.e. "
                    id="federates-with-input-field"
                    invalidText="A valid value is required - refer to helper text below"
                    labelText="Federates With"
                    placeholder="Enter Names of trust domains the identity described by this entry federates with"
                  />
                </div>
                <div className="dnsnames-input-field">
                  <TextInput
                    helperText="i.e. "
                    id="dnsnames-input-field"
                    invalidText="A valid value is required - refer to helper text below"
                    labelText="DNS Names"
                    placeholder="Enter DNS Names associated with the identity described by this entry"
                  />
                </div>
                <Checkbox
                  labelText="Admin Flag"
                  id="admin-flag"
                  onChange={this.onChangeAdminFlag}
                />
                <Checkbox
                  labelText="Down Stream"
                  id="down-steam"
                />
              </fieldset>
            </div>
            <div className="form-group">
              <input type="submit" value="Create Entry" className="btn btn-primary" />
            </div>
          </div>
        </form>
      </div>
    )
  }
}


const mapStateToProps = (state) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalSelectorInfo: state.servers.globalSelectorInfo,
  globalagentsList: state.agents.globalagentsList,
  globalServerInfo: state.servers.globalServerInfo,
})

export default connect(
  mapStateToProps,
  { serverSelected, selectorInfo, agentsListUpdate }
)(CreateEntry)