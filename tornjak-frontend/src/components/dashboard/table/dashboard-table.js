import React from "react";
import { connect } from 'react-redux';
import { DataGrid, GridToolbar, GridLinkOperator } from "@material-ui/data-grid";
import Title from '../title';
import {
  Button,
} from '@material-ui/core';
import {
  clickedDashboardTabelFunc,
  selectedDashboardTableData
} from 'redux/actions';

class TableDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: []
    };
    this.prepareSelectedRowsData = this.prepareSelectedRowsData.bind(this);
  }

  prepareSelectedRowsData() {
    var selectedRows = Array.from(this.state.selectedRows, ([name, value]) => ({ name, value }));
    this.props.selectedDashboardTableData(selectedRows)
  }

  render() {
    const { numRows, data, columns, title } = this.props;
    return (
      <React.Fragment>
        <Title>
          <Button
            color="inherit"
            size="large"
            onClick={() => { this.props.clickedDashboardTabelFunc(title.toLowerCase()); }}
          >
            {title}
          </Button>
        </Title>
        <Button //Selected Details Button
          style={{ width: 160, marginLeft: 1040, marginBottom: 20 }}
          color="primary"
          size="small"
          variant="outlined"
          onClick={() => {
            this.props.clickedDashboardTabelFunc(title.toLowerCase() + "details")
            this.prepareSelectedRowsData()
          }}
        >
          Selected Details
        </Button>
        <div style={{ width: "100%" }}>
          <DataGrid
            rows={data}
            columns={columns}
            pageSize={numRows}
            autoHeight={true}
            checkboxSelection
            onRowSelected={(selectedRows) => {
              this.setState({ selectedRows: selectedRows.api.current.getSelectedRows() })
              //console.log(selectedRows.api.current.getSelectedRows())
            }}
            components={{
              Toolbar: GridToolbar,
            }}
          // filterModel={{
          //   linkOperator: GridLinkOperator,
          // }}
          />
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable,
  globalSelectedDashboardData: state.tornjak.globalSelectedDashboardData
})

export default connect(
  mapStateToProps,
  { clickedDashboardTabelFunc, selectedDashboardTableData }
)(TableDashboard);
