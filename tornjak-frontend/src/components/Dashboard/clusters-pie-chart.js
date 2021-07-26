import React from 'react';
import Title from './title';
import { connect } from 'react-redux';
import PieChart1 from "charts/PieChart";


class ClustersPieChart extends React.Component {
  cluster(entry) {
    return {
      "group": entry.name,
      "value": entry.agentsList.length
    }
  }

  clusterList() {
    if (typeof this.props.globalClustersList !== 'undefined') {
      return this.props.globalClustersList.map(currentCluster => {
        return this.cluster(currentCluster);
      })
    } else {
      return ""
    }
  }

  render() {
    var sections = this.clusterList()
    return (
      <React.Fragment>
        <Title># of Agents per Cluster</Title>
        {sections.length == 0 &&
                <p className="no-data">No Data To Display</p>
        }
        <PieChart1
          data={sections}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  globalClustersList: state.clusters.globalClustersList,
})

export default connect(mapStateToProps, {})(ClustersPieChart)