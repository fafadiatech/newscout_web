import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';

import { Button, Form, FormGroup, Label, Input, Alert } from 'reactstrap';

import { getRequest } from '../../utils/Utils';

import config_data from './config.json';

class Comments extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			modal: this.props.is_open,
			auth_section: true,
			comment: "",
			is_valid: false
		};
	}

	handleChange = (value_type, e) => {
        var value = e.target.value;
        var state = this.state

        state.comment = value
        state.is_valid = false

        this.setState(state)
    }

	handleSubmit = (event) => {
		event.preventDefault();
		this.setState({
			comment: this.state.comment
		}, function(){
			this.props.handleSubmit(this.state.comment)
		})
	}

	render() {
		let { comments, successComment, is_login } = this.props
		let all_comments;
		if(comments.length > 0){
			all_comments = comments.map((item, index) => {
				return (
					<React.Fragment key={index}>
						<div className="comment">
							<div className="clearfix">
								<div className="float-left">
									<h6>{item.user_name}</h6>
								</div>
								<div className="float-right">
									<h6 className="text-danger"><small><strong>{moment(item.created_at).format('DD-MMMM-YYYY')}</strong></small></h6>
								</div>
							</div>
							<p>{item.comment}</p>
						</div>
						<hr/>
					</React.Fragment>
				)
			})
		} else {
			all_comments = <h4>Comments not available</h4>
		}

		return(
			<React.Fragment>
				<div className="comment-post">
					<Form onSubmit={this.handleSubmit}>
						<FormGroup>
							<Label for="email">Add your comment</Label>
							<Input type="textarea" name="comment" id="exampleText" onChange={(e) => this.handleChange("comment", e)} />
						</FormGroup>
						<FormGroup>
							<div className="clearfix">
								<div className="float-left">
									<button className="btn btn-danger" disabled={this.state.comment === "" ? true : false}>Submit</button>
								</div>
								<div className="float-left ml-2">
									<React.Fragment>
										{successComment ?
											<Alert color="success" className="success-comment">Comment submitted successfully.</Alert>
										:
											""
										}

										{is_login ?
											<Alert color="danger" className="success-comment">Please Login or Sigup.</Alert>
										:
											""
										}
									</React.Fragment>
								</div>
							</div>
						</FormGroup>
					</Form>
				</div>
				<div className="comment-list mt-4">
					<div className="heading">
						<h5><strong>{`${comments.length > 0 ? comments.length : "0" }`} Comments</strong></h5>
					</div>
					{comments.length > 0 ?
						<div className="all-comment  mt-3">{all_comments}</div>
					: "" }
				</div>
			</React.Fragment>
		)
	}
}

export default Comments