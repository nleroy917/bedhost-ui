import React from 'react';
import ResponsiveDialog from "./responsiveDialog"
import $ from 'jquery';
import queryBuilder from 'jQuery-QueryBuilder';
import axios from "axios";
import bedhost_api_url from "./const";
import "./style/queryBuilder.css";
import QueryResults from './queryResults';



console.log("bedhost_api_url:", bedhost_api_url);
const api = axios.create({
    baseURL: bedhost_api_url,
});

const setRules = {
    condition: 'AND',
    rules: [{
        id: 'name',
        operator: 'not_equal',
        value: 'testname'
    }]
};

const fileRules = {
    condition: 'AND',
    rules: [{
        id: 'name',
        operator: 'not_equal',
        value: 'null'
    }, {
        condition: 'OR',
        rules: [{
            id: 'gc_content',
            operator: 'greater',
            value: 0.4
        }, {
            id: 'md5sum',
            operator: 'equal',
            value: '23jhb4j324b32hj4b23hj4b23hb42'
        }]
    }]
};

export default class QueryBuilderWrapper extends React.Component {
    constructor(props) {
        super();
        this.queryBuilder = React.createRef()
        this.state = {
            rules: {},
            filters: {},
        };
    }

    async componentDidMount() {
        await this.getfilter()
        const element = this.queryBuilder.current;
        this.initializeQueryBuilder(element, this.state.filters);
        this.handleGetRulesClick()
    }

    componentWillUnmount() {
        $(this.queryBuilder.current).queryBuilder('destroy');
    }

    async componentDidUpdate(prevProps, prevState) {
        // only update query filter if the table_name has changed
        if (prevProps.table_name !== this.props.table_name) {
            await this.getfilter()
            $(this.queryBuilder.current).queryBuilder('setFilters', true, this.state.filters);
            if (this.props.table_name === 'bedsets') {
                var defaultRules = setRules
            } else if (this.props.table_name === 'bedfiles') {
                defaultRules = fileRules
            }
            const newRules = { ...defaultRules };
            $(this.queryBuilder.current).queryBuilder('setRules', newRules);
            this.setState({ rules: newRules });
            this.handleGetRulesClick()
        }
    }

    async getfilter() {
        let filters_res = await api
            .get("filters/" + this.props.table_name)
            .catch(function (error) {
                alert(error + "; is bedhost running at " + bedhost_api_url + "?");
            });
        this.setState({ filters: filters_res.data })
    }

    initializeQueryBuilder(element, filters, newRules) {
        const defaultRules = this.props.table_name === "bedfiles" ? fileRules : setRules
        const rules = newRules ? newRules : defaultRules;
        $(element).queryBuilder({ filters, rules });
    }

    // get data from jQuery Query Builder and pass to the react component
    handleGetRulesClick() {
        const rules = $(this.queryBuilder.current).queryBuilder('getSQL');
        this.setState({ rules: rules.sql, open: true });
        this.forceUpdate();
    }
    // reinitialize jQuery Query Builder based on react state
    handleSetRulesClick() {
        if (this.props.table_name === 'bedsets') {
            var defaultRules = setRules
        } else if (this.props.table_name === 'bedfiles') {
            defaultRules = fileRules
        }
        const newRules = { ...defaultRules };
        $(this.queryBuilder.current).queryBuilder('setRules', newRules);
        this.setState({ rules: newRules });
    }

    handleGetResultClick() {
        this.handleGetRulesClick()
    }

    render() {
        return (
            <div>
                <div id='query-builder' ref={this.queryBuilder} />
                <ResponsiveDialog onClick={this.handleGetRulesClick.bind(this)} message={JSON.stringify(this.state.rules, undefined, 2)} />
                <button className='btn btn-sm my-btn' onClick={this.handleGetRulesClick.bind(this)}>RESET RULES</button>
                <button className='float-right btn btn-sm my-btn' onClick={this.handleGetResultClick.bind(this)}>SEARCH</button>
                { Object.entries(this.state.rules).length !== 0 ? (<QueryResults table_name={this.props.table_name} query={JSON.stringify(this.state.rules, undefined, 2)} />):null}
                {/* <QueryResults table_name={this.props.table_name} query={JSON.stringify(this.state.rules, undefined, 2)} /> */}
            </div>
        );
    }
};