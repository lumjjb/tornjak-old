import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import Table from "tables/agentsListTable";
import { setSelectorInfo } from './selector-info';
import { populateLocalAgentsUpdate, populateAgentsUpdate, populateLocalTornjakServerInfo, populateServerInfo } from './tornjak-api-helpers';
import {
  serverSelected,
  agentsListUpdate,
  tornjakServerInfoUpdate,
  serverInfoUpdate,
  selectorInfo,
  tornjakMessege
} from 'actions';

const Agent = props => (
  <tr>
    <td>{props.agent.id.trust_domain}</td>
    <td>{"spiffe://" + props.agent.id.trust_domain + props.agent.id.path}</td>
    <td><div style={{ overflowX: 'auto', width: "400px" }}>
      <pre>{JSON.stringify(props.agent, null, ' ')}</pre>
    </div></td>

    <td>
      {/*
        // <Link to={"/agentView/"+props.agent._id}>view</Link> |
      */}
      <a href="#" onClick={() => { props.banAgent(props.agent.id) }}>ban</a>
      <br />
      <a href="#" onClick={() => { props.deleteAgent(props.agent.id) }}>delete</a>
    </td>
  </tr>
)

class AgentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
    };
  }

  componentDidMount() {
    setSelectorInfo(this.props);
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        populateAgentsUpdate(this.props.globalServerSelected, this.props)
      }
    } else {
      populateLocalAgentsUpdate(this.props);
      populateLocalTornjakServerInfo(this.props);
      if(this.props.globalTornjakServerInfo !== "")
        populateServerInfo(this.props);
    }
  }

  componentDidUpdate(prevProps) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        populateAgentsUpdate(this.props.globalServerSelected, this.props)
      }
    } else {
        if(prevProps.globalTornjakServerInfo !== this.props.globalTornjakServerInfo)
        {
          populateServerInfo(this.props);
        }
    }
  }

  agentList() {
    if (typeof this.props.globalagentsList !== 'undefined') {
      return this.props.globalagentsList.map(currentAgent => {
        return <Agent key={currentAgent.id.path}
          agent={currentAgent}
          banAgent={this.banAgent}
          deleteAgent={this.deleteAgent} />;
      })
    } else {
      return ""
    }
  }

  render() {
    return (
      <div>
        <h3>Agent List</h3>
        {this.props.globalErrorMessege !== "OK" &&
          <div className="alert-primary" role="alert">
            <pre>
              {this.props.globalErrorMessege}
            </pre>
          </div>
        }
        {IsManager}
        <br /><br />
        <div className="indvidual-list-table">
          <Table data={this.agentList()} id="table-1" />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalagentsList: state.agents.globalagentsList,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessege: state.tornjak.globalErrorMessege,
})

export default connect(
  mapStateToProps,
  { serverSelected, agentsListUpdate, tornjakServerInfoUpdate, serverInfoUpdate, selectorInfo, tornjakMessege }
)(AgentList)