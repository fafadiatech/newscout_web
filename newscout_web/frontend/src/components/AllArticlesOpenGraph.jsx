import React, { PureComponent } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
  ResponsiveContainer, Label } from 'recharts';
import {RED_COLOR, BLUE_COLOR} from '../utils/Constants';


class AllArticlesOpenGraph extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
        data: props.data,
        loading: props.loading,
        no_data: props.no_data,
        max: {}
    };
  }

  componentWillReceiveProps(newProps){
    this.setState({
        data: newProps.data.data,
        loading: newProps.loading,
        no_data: newProps.no_data,
        max: newProps.data.max
    })
}

render() {
    return (
        <div className="col-lg-12">
        <h4>All Articles Open</h4>
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
                        <LineChart
                            width={500}
                            height={400}
                            data={this.state.data}
                            margin={{
                                top: 20, right: 50, left: 20, bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="dateStr" interval={0} textAnchor="end" angle={330} height={100} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <ReferenceLine x={this.state.max.dateStr} stroke={BLUE_COLOR} label="Max Articles Date" />
                            <ReferenceLine y={this.state.max.count} label="Max Count" stroke={BLUE_COLOR} />
                            <Line type="monotone" dataKey="count" stroke={RED_COLOR} />
                        </LineChart>
                    </ResponsiveContainer>
                    </div>
                </React.Fragment>
        }
        </div>
        );
    }
}

export default AllArticlesOpenGraph;