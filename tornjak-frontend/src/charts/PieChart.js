import React from "react";
import { PieChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";
//import "./charts.css";
import { connect } from 'react-redux';
//import { Arrow16 } from '@carbon/icons-react';
// import {
//   individualPieChartClicked,
//   individualPieChartData
// } from '../actions';
class PieChart1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: {
        resizable: true,
        height: "300px",
        "legend": {
          "alignment": "center"
        },
        "pie": {
          "alignment": "center"
        }
      }
    };
    //this.handleClick = this.handleClick.bind(this);
  }

  // handleClick() {
  //   const { chartTitle, data } = this.props;
  //   this.props.individualPieChartClicked(true);
  //   this.props.individualPieChartData(data, chartTitle)
  // }

  render() {
    const { chartTitle, data } = this.props;
    return (
      <div>
        <div className="charttitle">
          {/* <a href="/#" onClick={this.handleClick}>
            <strong>{chartTitle}</strong>
          </a> */}
        </div>
          <PieChart
            data={data}
            options={this.state.options}
          />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  //chartInfo: state.filterDeals.chartInfo
})

export default connect(
  mapStateToProps,
  {}
  )(PieChart1);
