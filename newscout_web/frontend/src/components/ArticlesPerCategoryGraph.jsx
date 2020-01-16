import React, { PureComponent } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList
  } from 'recharts';
import {RED_COLOR} from '../utils/Constants';


class ArticlesPerCategoryGraph extends PureComponent {
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
            <h4>Articles Per Category</h4>
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
                        <div style={{ width: '80%', height: 450 }}>
                            <ResponsiveContainer>
                                <BarChart
                                    width={500}
                                    height={400}
                                    data={this.state.data}
                                    margin={{
                                        top: 5, right: 30, left: 20, bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="5 5" />
                                    <XAxis type="category" dataKey="category_name" interval={0} textAnchor="end" angle={330} height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill={RED_COLOR} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </React.Fragment>
            }
            </div>
            );
        }
    }

export default ArticlesPerCategoryGraph;
