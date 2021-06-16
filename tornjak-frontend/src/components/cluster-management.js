import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tabs, Tab } from 'carbon-components-react';
import ClusterCreate from './cluster-create';
import ClusterEdit from './cluster-edit';
import './style.css';

class ClusterManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    return (
      <div className="cluster-management-tabs">
        <Tabs scrollIntoView={false} >
          <Tab className="cluster-management-tab1"
            href="#"
            id="tab-1"
            label="Create Cluster"
          >
            <ClusterCreate />
          </Tab>
          <Tab
            href="#"
            id="tab-2"
            label="Assign Agents"
          >
            <ClusterEdit />
          </Tab>
        </Tabs>
      </div>
    )
  }
}

export default ClusterManagement;
