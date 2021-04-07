import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import {
  serverSelected,
  serverInfoUpdate
} from 'actions';

const TornjakServerInfoDisplay = props => (
    <p>
    <pre>
        {props.tornjakServerInfo}
    </pre>
    </p>
)

class TornjakServerInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
        message: "",
    };
  }

  componentDidMount() {
      if (IsManager) {
        if(this.props.globalServerSelected !== ""){
          this.populateTornjakServerInfo(this.props.globalServerSelected)
        }
      } else {
        this.populateLocalTornjakServerInfo()
      }
  }

  componentDidUpdate(prevProps) {
    if (IsManager) {
      if(prevProps.globalServerSelected !== this.props.globalServerSelected){
        this.populateTornjakServerInfo(this.props.globalServerSelected)
      }
    }
  }

  populateTornjakServerInfo(serverName) {
      axios.get(GetApiServerUri('/manager-api/tornjak/serverinfo/') + serverName, {     crossdomain: true })
      .then(response =>{
        console.log(response);
        this.props.serverInfoUpdate(response.data["serverinfo"]);
      }).catch(error => {
          this.setState({
              message: "Error retrieving " + serverName + " : "+ error.message,
              agents: [],
          });
      });

  }

  populateLocalTornjakServerInfo() {
    axios.get(GetApiServerUri('/api/tornjak/serverinfo'), { crossdomain: true })
      .then(response => {
        this.props.serverInfoUpdate(response.data["serverinfo"]);
      })
      .catch((error) => {
        console.log(error);
      })
  }

  tornjakServerInfo() {
    if (this.props.globalServerInfo === "") {
        return ""
    } else {
        return <TornjakServerInfoDisplay tornjakServerInfo={this.props.globalServerInfo} />
    }
  }

  render() {

    return (
      <div>
        <h3>Server Info</h3>
        <div className="alert-primary" role="alert">
        <pre>
           {this.state.message}
        </pre>
        </div>
        {IsManager}
        <br/><br/>
        {this.tornjakServerInfo()}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalServerInfo: state.servers.globalServerInfo,
})

export default connect(
  mapStateToProps,
  { serverSelected, serverInfoUpdate }
)(TornjakServerInfo)