import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
// Components
import {
    Container,
    Grid,
    Paper,
  } from '@material-ui/core';
  // Tables
import ClustersTable from './clusters-dashboard-table';
import AgentsTable from './agents-dashboard-table';
import EntriesTable from './entries-dashboard-table';

const styles = theme => ({
    seeMore: {
        marginTop: theme.spacing(3),
    },
    container: { //container for root
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
        marginLeft: 0
      },
      paper: { //container for all grids
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
        marginBottom: 20
      },
});

class DashboardDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { classes } = this.props;
        return (
            <div>
                {(this.props.globalClickedDashboardTable === "clustersdetails") &&
                    <div>
                        <Container maxWidth="lg" className={classes.container}>
                            <Grid item xs={12}>
                                <Paper className={classes.paper}>
                                    <p className="details-title">Cluster Name : <b>{this.props.globalSelectedDashboardData[0].value.name}</b></p>
                                    <p className="metadata-tag">Metadata</p>
                                    <hr className="dashboard-detals-line"></hr>
                                    <p className="metadata-details">Created : <b>{this.props.globalSelectedDashboardData[0].value.created} </b></p>
                                    <p className="metadata-details">Number of Nodes : <b>{this.props.globalSelectedDashboardData[0].value.numNodes} </b></p>
                                    <p className="metadata-details">Number of Entries: <b>{this.props.globalSelectedDashboardData[0].value.numEntries}</b> </p>
                                </Paper>
                            </Grid>
                        </Container>
                        <Container maxWidth="lg" className={classes.container}>
                            {/* Agents Table */}
                            <Grid item xs={12}>
                                <Paper className={classes.paper}>
                                    <AgentsTable
                                        numRows={100}
                                        selectedData={this.props.globalSelectedDashboardData} />
                                </Paper>
                            </Grid>
                        </Container>
                        <Container maxWidth="lg" className={classes.container}>
                            {/* Entries Table */}
                            <Grid item xs={12}>
                                <Paper className={classes.paper}>
                                    <EntriesTable
                                        numRows={100}
                                        selectedData={this.props.globalSelectedDashboardData} />
                                </Paper>
                            </Grid>
                        </Container>
                    </div>
                }
                {(this.props.globalClickedDashboardTable === "agentsdetails") &&
                    <div>
                        <Container maxWidth="lg" className={classes.container}>
                            <Grid item xs={12}>
                                <Paper className={classes.paper}>
                                    <p className="details-title">Agent Name : <b>{this.props.globalSelectedDashboardData[0].value.spiffeid}</b></p>
                                    <p className="metadata-tag">Metadata</p>
                                    <hr className="dashboard-detals-line"></hr>
                                    <p className="metadata-details">Belongs to Cluster : <b>{this.props.globalSelectedDashboardData[0].value.clusterName}</b> </p>
                                    <p className="metadata-details">Status : <b>{this.props.globalSelectedDashboardData[0].value.status}</b> </p>
                                    <p className="metadata-details">Platform Type : <b>{this.props.globalSelectedDashboardData[0].value.platformType}</b> </p>
                                    <p className="metadata-details">Number of Entries: <b>{this.props.globalSelectedDashboardData[0].value.numEntries}</b> </p>
                                </Paper>
                            </Grid>
                        </Container>
                        <Container maxWidth="lg" className={classes.container}>
                            {/* Clusters Table */}
                            <Grid item xs={12}>
                                <Paper className={classes.paper}>
                                    <ClustersTable
                                        numRows={100}
                                        selectedData={this.props.globalSelectedDashboardData} />
                                </Paper>
                            </Grid>
                        </Container>
                        <Container maxWidth="lg" className={classes.container}>
                            {/* Entries Table */}
                            <Grid item xs={12}>
                                <Paper className={classes.paper}>
                                    <EntriesTable
                                        numRows={100}
                                        selectedData={this.props.globalSelectedDashboardData} />
                                </Paper>
                            </Grid>
                        </Container>
                    </div>
                }
                {(this.props.globalClickedDashboardTable === "entriesdetails") &&
                    <div>
                        <Container maxWidth="lg" className={classes.container}>
                            <Grid item xs={12}>
                                <Paper className={classes.paper}>
                                    <p className="details-title">Entry ID : <b>{this.props.globalSelectedDashboardData[0].value.id}</b></p>
                                    <p className="metadata-tag">Metadata</p>
                                    <hr className="dashboard-detals-line"></hr>
                                    <p className="metadata-details">Entry Name : <b>{this.props.globalSelectedDashboardData[0].value.spiffeid}</b></p>
                                    <p className="metadata-details">Parent ID : <b>{this.props.globalSelectedDashboardData[0].value.parentId}</b> </p>
                                    <p className="metadata-details">Belongs to Cluster : <b>{this.props.globalSelectedDashboardData[0].value.clusterName}</b> </p>
                                    <p className="metadata-details">Platform Type : <b>{this.props.globalSelectedDashboardData[0].value.platformType}</b> </p>
                                    <p className="metadata-details">Is Admin : <b>{this.props.globalSelectedDashboardData[0].value.adminFlag.toString().toUpperCase()}</b> </p>
                                    <p className="metadata-details">Entry Expire Time: <b>{this.props.globalSelectedDashboardData[0].value.entryExpireTime}</b> </p>
                                </Paper>
                            </Grid>
                        </Container>
                        <Container maxWidth="lg" className={classes.container}>
                            {/* Clusters Table */}
                            <Grid item xs={12}>
                                <Paper className={classes.paper}>
                                    <ClustersTable
                                        numRows={100}
                                        selectedData={this.props.globalSelectedDashboardData} />
                                </Paper>
                            </Grid>
                        </Container>
                        <Container maxWidth="lg" className={classes.container}>
                            {/* Agents Table */}
                            <Grid item xs={12}>
                                <Paper className={classes.paper}>
                                    <AgentsTable
                                        numRows={100}
                                        selectedData={this.props.globalSelectedDashboardData} />
                                </Paper>
                            </Grid>
                        </Container>
                    </div>
                }
            </div>
        );
    }

}

const mapStateToProps = (state) => ({
    globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable,
    globalSelectedDashboardData: state.tornjak.globalSelectedDashboardData
})

export default withStyles(styles)(
    connect(mapStateToProps, {})(DashboardDetails)
)