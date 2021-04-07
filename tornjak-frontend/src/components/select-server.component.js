import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import {
    serverSelected,
    serversListUpdate
} from 'actions';

const ServerDropdown = props => (
    <option value={props.value}>{props.name}</option>
)

class SelectServer extends Component {
    constructor(props) {
        super(props);
        this.serverDropdownList = this.serverDropdownList.bind(this);
        this.onServerSelect = this.onServerSelect.bind(this);
        this.state = {
        };
    }

    componentDidMount() {
        if (IsManager) {
            this.populateServers()
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
    globalServersList: state.servers.globalServersList
})

export default connect(
    mapStateToProps,
    { serverSelected, serversListUpdate }
)(SelectServer)