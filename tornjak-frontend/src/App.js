import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route } from "react-router-dom";
import NavigationBar from "./components/navbar";
import SelectServer from "./components/select-server";
import ClusterList from "./components/cluster-list";
import ClusterManagement from "./components/cluster-management";
import AgentList from "./components/agent-list";
import CreateJoinToken from "./components/agent-create-join-token";
import EntryList from "./components/entry-list";
import EntryCreate from "./components/entry-create";
import ServerManagement from "./components/server-management";
import TornjakServerInfo from "./components/tornjak-server-info";
import TornjakDashBoard from "./components/dashboard/tornjak-dashboard";
import { Provider } from 'react-redux'; //enables all components to have access to everything inside our react app
import store from 'redux/store';
import IsManager from './components/is_manager';
import './App.css';
import DashboardDetails from 'components/dashboard/dashboard-details';
import TornjakHelper from 'components/tornjak-helper';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.TornjakHelper = new TornjakHelper();
        this.state = {
            entity: "",
            id: ""
        };
    }
    render() {
        return (
            <Provider store={store}>
                <Router>
                    <div>
                        <div className="nav-comp">
                            <NavigationBar />
                        </div>
                        <div className="rest-body">
                            <SelectServer />
                            <br />
                            {IsManager && <br />}
                            <Route path="/" exact component={AgentList} />
                            <Route path="/clusters" exact component={ClusterList} />
                            <Route path="/agents" exact component={AgentList} />
                            <Route path="/entries" exact component={EntryList} />
                            <Route path="/entry/create" exact component={EntryCreate} />
                            <Route path="/agent/createjointoken" exact component={CreateJoinToken} />
                            <Route path="/cluster/clustermanagement" exact component={ClusterManagement} />
                            <Route path="/tornjak/serverinfo" exact component={TornjakServerInfo} />
                            <Route path="/tornjak/dashboard" exact component={TornjakDashBoard} />
                            <Route
                                path="/tornjak/dashboard/details/:entity/:id"
                                render={(props) => (
                                    <DashboardDetails {...props} selectedData={this.TornjakHelper.detailsDataParse(props.match.params, this.props)} />
                                )}
                            />
                            <Route path="/server/manage" exact component={ServerManagement} />
                            <br /><br /><br />
                            <svg className="endbanneroutput">
                                <rect className="endbanneroutput"></rect>
                            </svg>
                        </div>
                    </div>
                </Router>
            </Provider>
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
)(App)
