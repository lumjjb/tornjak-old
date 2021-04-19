import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import {
    serverSelected,
    serversListUpdate,
    tornjakServerInfoUpdate,
    serverInfoUpdate,
    agentsListUpdate
} from 'actions';

const ServerDropdown = props => (
    <option value={props.value}>{props.name}</option>
)

class SelectServer extends Component {
    constructor(props) {
        super(props);
        this.serverDropdownList = this.serverDropdownList.bind(this);
        this.onServerSelect = this.onServerSelect.bind(this);
        this.populateTornjakServerInfo = this.populateTornjakServerInfo.bind(this);
        this.populateLocalTornjakServerInfo = this.populateLocalTornjakServerInfo.bind(this);
        this.populateServerInfo = this.populateServerInfo.bind(this);
        this.populateLocalAgentsUpdate = this.populateLocalAgentsUpdate.bind(this);
        this.populateLocalAgentsUpdate = this.populateLocalAgentsUpdate.bind(this);
        
        this.state = {
        };
    }

    componentDidMount() {
        if (IsManager) {
            this.populateServers()
        }
    }

    componentDidUpdate() {
        if (IsManager) {
            if (this.props.globalServerSelected !== "") {
                this.populateTornjakServerInfo(this.props.globalServerSelected);
                if(this.props.globalTornjakServerInfo !== "") {
                    this.populateServerInfo();
                    this.populateAgentsUpdate(this.props.globalServerSelected)
                }
            }
        } else {
            if (this.props.globalServerSelected !== "") {
                this.populateLocalTornjakServerInfo();
                if(this.props.globalTornjakServerInfo !== "") {
                    this.populateServerInfo();
                    this.populateLocalAgentsUpdate()
                }
            }
        }
    }

    populateServers() {
        axios.get(GetApiServerUri("/manager-api/server/list"), { crossdomain: true })
            .then(response => {
                this.props.serversListUpdate(response.data["servers"]);
            })
            .catch((error) => {
                console.log(error);
            })
    }

    serverDropdownList() {
        if (typeof this.props.globalServersList !== 'undefined') {
            return this.props.globalServersList.map(server => {
                return <ServerDropdown key={server.name}
                    value={server.name}
                    name={server.name} />
            })
        } else {
            return ""
        }
    }

    onServerSelect(e) {
        const serverName = e.target.value;
        if (serverName !== "") {
            this.props.serverSelected(serverName);
        }
    }

    populateTornjakServerInfo(serverName) {
        axios.get(GetApiServerUri('/manager-api/tornjak/serverinfo/') + serverName, { crossdomain: true })
          .then(response => {
            this.props.tornjakServerInfoUpdate(response.data["serverinfo"]);
          }).catch(error => {
            this.setState({
              message: "Error retrieving " + serverName + " : " + error.message,
              agents: [],
            });
          });
    
    }

    populateLocalTornjakServerInfo() {
        axios.get(GetApiServerUri('/api/tornjak/serverinfo'), { crossdomain: true })
          .then(response => {
            this.props.tornjakServerInfoUpdate(response.data["serverinfo"]);
          })
          .catch((error) => {
            console.log(error);
          })
    }
    
    populateServerInfo() {
        //node attestor plugin
        const nodeAttKeyWord = "NodeAttestor Plugin: ";
        var serverInfo = "";
        if(this.props.globalTornjakServerInfo.length == 0)
            return
        serverInfo = this.props.globalTornjakServerInfo;
        var nodeAttStrtInd = serverInfo.search(nodeAttKeyWord) + nodeAttKeyWord.length;
        var nodeAttEndInd = serverInfo.indexOf('\n', nodeAttStrtInd)
        var nodeAtt = serverInfo.substr(nodeAttStrtInd, nodeAttEndInd - nodeAttStrtInd)
        //server trust domain
        const trustDomainKeyWord = "\"TrustDomain\": \"";
        var trustDomainStrtInd = serverInfo.search(trustDomainKeyWord) + trustDomainKeyWord.length;
        var trustDomainEndInd = serverInfo.indexOf("\"", trustDomainStrtInd)
        var trustDomain = serverInfo.substr(trustDomainStrtInd, trustDomainEndInd - trustDomainStrtInd)
        var reqInfo = 
          {
            "data": 
              {
                "trustDomain": trustDomain,
                "nodeAttestorPlugin": nodeAtt
              }
          }
        this.props.serverInfoUpdate(reqInfo);
    }

    populateAgentsUpdate(serverName) {
        axios.get(GetApiServerUri('/manager-api/agent/list/') + serverName, { crossdomain: true })
          .then(response => {
            this.props.agentsListUpdate(response.data["agents"]);
          }).catch(error => {
            this.setState({
              message: "Error retrieving " + serverName + " : " + error.message
            });
            this.props.agentsListUpdate([]);
          });
    
    }
    
      populateLocalAgentsUpdate() {
        axios.get(GetApiServerUri('/api/agent/list'), { crossdomain: true })
          .then(response => {
            this.props.agentsListUpdate(response.data["agents"]);
          })
          .catch((error) => {
            console.log(error);
          })
    }

    getServer(serverName) {
        var i;
        const servers = this.props.globalServersList
        for (i = 0; i < servers.length; i++) {
            if (servers[i].name === serverName) {
                return servers[i]
            }
        }
        return null
    }

    render() {

        let managerServerSelector = (
            <div id="server-dropdown-div">
                <label id="server-dropdown">Choose a Server:</label>
                <select name="servers" id="servers" onChange={this.onServerSelect}>
                    <optgroup label="Servers">
                    <option value="none" selected disabled>Select an Option </option>
                    <option value="none" selected disabled>{this.props.globalServerSelected} </option>
                        {this.serverDropdownList()}
                    </optgroup>
                </select>
            </div>
        )

        return (
            <div>
                {IsManager && managerServerSelector}
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    globalServerSelected: state.servers.globalServerSelected,
    globalServersList: state.servers.globalServersList,
    globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
})

export default connect(
    mapStateToProps,
    { serverSelected, serversListUpdate, tornjakServerInfoUpdate, serverInfoUpdate, agentsListUpdate }
)(SelectServer)