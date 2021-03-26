import React from "react";
import { DataTable } from "carbon-components-react";
import ResetIcon from "@carbon/icons-react/es/reset--alt/20";
const {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TableHeader,
    TableSelectRow,
    TableSelectAll,
    TableToolbar,
    TableToolbarSearch,
    TableToolbarContent,
    TableBatchActions,
    TableBatchAction,
} = DataTable;

class DataTableRender extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listData: props.data,
            listTableData: [{}]
        };
        this.prepareTableData = this.prepareTableData.bind(this);
    }

    componentDidMount() {
        //this.prepareTableData();
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps !== this.props)
            this.prepareTableData();
    }

    prepareTableData() {
        const { data } = this.props;
        let listData = [...data];
        let listtabledata = [];
        let i = 0;
        for (i = 0; i < listData.length; i++) {
            listtabledata[i] = {}
            listtabledata[i]["id"] = i+1
            listtabledata[i]["trustdomain"] = listData[i].props.agent.id.trust_domain
            listtabledata[i]["spiffeid"] = "spiffe://" + listData[i].props.agent.id.trust_domain + listData[i].props.agent.id.path
            listtabledata[i]["info"] = <div style={{overflowX: 'auto', width: "400px"}}><pre>{JSON.stringify(listData[i].props.agent, null, ' ')}</pre></div>
            listtabledata[i]["actions"] = <div><a href="#" onClick={() => { listData[i].props.banAgent(listData[i].props.agent.id) }}>Ban</a> <br /> <a href="#" onClick={() => { listData[i].props.deleteAgent(listData[i].props.agent.id) }}>Delete</a></div>
        }
        this.setState({
            listTableData: listtabledata
        })
    }
    render() {
        const { listTableData } = this.state;
        console.log("listTableData", listTableData)
        const headerData = [
            {
                header: 'ID',
                key: 'id',
            },
            {
                header: 'Trust Domain',
                key: 'trustdomain',
            },
            {
                header: 'SPIFFE ID',
                key: 'spiffeid',
            },
            {
                header: 'Info',
                key: 'info',
            },
            {
                header: 'Actions',
                key: 'actions',
            },
        ];
        return (
            <DataTable
                isSortable
                rows={listTableData}
                headers={headerData}
                render={({
                    rows,
                    headers,
                    getHeaderProps,
                    getSelectionProps,
                    onInputChange,
                    getPaginationProps,
                    getBatchActionProps,
                    getTableContainerProps,
                }) => (
                    <TableContainer
                        {...getTableContainerProps()}
                    >
                        <TableToolbar>
                            <TableToolbarContent>
                                <TableToolbarSearch onChange={(e) => onInputChange(e)} />
                            </TableToolbarContent>
                            <TableBatchActions
                                {...getBatchActionProps()}
                            >
                                <TableBatchAction
                                    renderIcon={ResetIcon}
                                    iconDescription="Delete"
                                    onClick={() => {
                                        this.reCalculateAverage(selectedRows);
                                    }}
                                >
                                    Delete
                                </TableBatchAction>
                                <TableBatchAction
                                    renderIcon={ResetIcon}
                                    iconDescription="Ban"
                                    onClick={() => {
                                        this.performAction(selectedRows);
                                    }}
                                >
                                    Ban
                                </TableBatchAction>
                            </TableBatchActions>
                        </TableToolbar>
                        <Table size="short" useZebraStyles>
                            <TableHead>
                                <TableRow>
                                    <TableSelectAll {...getSelectionProps()} />
                                    {headers.map((header) => (
                                        <TableHeader {...getHeaderProps({ header })}>
                                            {header.header}
                                        </TableHeader>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableSelectRow {...getSelectionProps({ row })} />
                                        {row.cells.map((cell) => (
                                            <TableCell key={cell.id}>{cell.value}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            />
        );
    }
}

export default DataTableRender;