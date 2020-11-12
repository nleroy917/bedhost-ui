import React from "react";
import MaterialTable, { MTableToolbar } from "material-table";
import { Paper } from "@material-ui/core";
import { tableIcons } from "./tableIcons";
import { Link } from "react-router-dom";

export default class ResultsBed extends React.Component {
    constructor(props) {
        super();
        this.state = {
            columns: [],
            data: []
        }
    }

    componentDidMount() {
        let cols = ["name", "md5sum"]
        cols = cols.concat(Object.keys(this.props.data[0][23]))

        let data = []
        data.push(this.props.data.map((bed) => {
            let row = { name: bed[3], md5sum: bed[1] }
            row = Object.assign({}, row, bed[23]);
            return row
        }))

        this.setState({
            columns: cols,
            data: data[0]
        })
    }

    getColumns() {
        let tableColumns = []

        for (var i = 0; i < this.state.columns.length; i++) {
            if (this.state.columns[i] === 'md5sum'||this.state.columns[i] === 'description') {
                tableColumns.push({ title: this.state.columns[i], field: this.state.columns[i], hidden: true })
            } else if (this.state.columns[i] === 'name') {
                tableColumns.push({
                    title: this.state.columns[i],
                    field: this.state.columns[i],
                    width: 550,
                    render: rowData => <Link className="home-link" to={{
                        pathname: '/bedsplash/' + rowData.md5sum
                    }}>{rowData.name}
                    </Link>
                })
            } else {
                tableColumns.push({ title: this.state.columns[i], field: this.state.columns[i], width: 100 })
            }
        }
        return tableColumns
    }


    render() {
        // console.log('props: ', this.props.data)
        return (
            <div>
                <MaterialTable
                    icons={tableIcons}
                    columns={this.getColumns()}
                    data={this.state.data}
                    title=""
                    options={{
                        headerStyle: {
                            backgroundColor: "#264653",
                            color: "#FFF",
                            fontWeight: "bold",
                        },
                        paging: true,
                        search: false,
                    }}
                    // detailPanel={rowData => {
                    //     return (
                    //         <p>{rowData.description}</p>
                    //     )
                    // }}
                    components={{
                        Container: props => <Paper {...props} elevation={0}/>
                    }}
                />
            </div>
        );
    }
}
