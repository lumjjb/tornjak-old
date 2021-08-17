import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import DashboardDetails from './dashboard-details';
import TornjakHelper from '../tornjak-helper';

class DashboardDetailsRender extends Component {
    constructor(props) {
        super(props);
        this.TornjakHelper = new TornjakHelper();
        this.state = {};
    }
    render() {
        const { params } = this.props;
        return (
            <DashboardDetails selectedData={this.TornjakHelper.detailsDataParse(params, this.props)} />                   
        );
}
}

const mapStateToProps = (state) => ({
    globalClustersList: state.clusters.globalClustersList,
    globalAgentsList: state.agents.globalAgentsList,
    globalEntriesList: state.entries.globalEntriesList,
    globalAgentsWorkLoadAttestorInfo: state.agents.globalAgentsWorkLoadAttestorInfo,
})

export default connect(
    mapStateToProps,
    {}
)(DashboardDetailsRender)
