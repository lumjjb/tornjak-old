import React, { Component } from 'react';
import { connect } from 'react-redux';
import IsManager from './is_manager';
import { populateTornjakServerInfo, populateLocalTornjakServerInfo, populateServerInfo } from './tornjak-api-helpers';
import {
  serverSelected,
  serverInfoUpdate,
  tornjakServerInfoUpdate,
  tornjakMessege,
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
    this.state = {};
  }

  componentDidMount() {
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        populateTornjakServerInfo(this.props.globalServerSelected, this.props);
      }
    } else {
      populateLocalTornjakServerInfo(this.props);
    }
  }

  componentDidUpdate(prevProps) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        populateTornjakServerInfo(this.props.globalServerSelected, this.props)
      }
    } 
  }

  tornjakServerInfo() {
    if (this.props.globalTornjakServerInfo === "") {
      return ""
    } else {
      return <TornjakServerInfoDisplay tornjakServerInfo={this.props.globalTornjakServerInfo} />
    }
  }

  render() {
    return (
      <div>
        <h3>Server Info</h3>
        {this.props.globalErrorMessege !== "OK" &&
          <div className="alert-primary" role="alert">
            <pre>
              {this.props.globalErrorMessege}
            </pre>
          </div>
        }
        {IsManager}
        <br /><br />
        {this.tornjakServerInfo()}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalServerInfo: state.servers.globalServerInfo,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessege: state.tornjak.globalErrorMessege,
})

export default connect(
  mapStateToProps,
  { serverSelected, tornjakServerInfoUpdate, serverInfoUpdate, tornjakMessege }
)(TornjakServerInfo)