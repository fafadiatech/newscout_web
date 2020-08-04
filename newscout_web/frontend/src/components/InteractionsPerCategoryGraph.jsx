import React, { PureComponent } from 'react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import {RED_COLOR, BLUE_COLOR} from '../utils/Constants';


class InteractionsPerCategoryGraph extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            loading: props.loading,
            no_data: props.no_data
        };
    }

    componentWillReceiveProps(newProps){
        this.setState({
            data: newProps.data,
            loading: newProps.loading,
            no_data: newProps.no_data
        })
    }

    render() {
        return (
            <div className="col-lg-12">
            {
                this.state.no_data ?
                    <h6 className="text-danger">No Enough Data To Generate Graph</h6>
                :
                    ""
            }
            {
                this.state.loading ?
                    <React.Fragment>
                        <div className="lds-ring mt20 col-sm-12 col-md-7 offset-md-5"><div></div><div></div><div></div><div></div></div>
                    </React.Fragment>
                :
                    <React.Fragment>
                        <div style={{ height: 450 }}>
                            <ResponsiveContainer>
                                <ComposedChart
                                    width={500}
                                    height={400}
                                    data={this.state.data}
                                    margin={{
                                        top: 20, right: 20, bottom: 20, left: 20,
                                    }}
                                >
                                    <CartesianGrid stroke="#f5f5f5" />
                                    <XAxis dataKey="category_name" interval={0} textAnchor="end" angle={330} height={100} />
                                    <YAxis />
                                    <Legend />
                                    <Bar dataKey="total_interactions" barSize={5} fill={RED_COLOR} />
                                    <Line type="monotone" dataKey="total_interactions" stroke={BLUE_COLOR} />
                                    <Tooltip />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </React.Fragment>
            }
            </div>
            );
        }
    }

export default InteractionsPerCategoryGraph;
