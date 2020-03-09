import React from 'react';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRedo } from '@fortawesome/free-solid-svg-icons'
import ReactDOM from 'react-dom';

import { Button, Form, FormGroup, Label, Input, Alert } from 'reactstrap';

import { getRequest } from '../../utils/Utils';

import config_data from './config.json';

class Comments extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			modal: this.props.is_open,
			comment: "",
			is_valid: true,
			captcha: "",
		};
	}

	handleChange = (value_type, e) => {
		var value = e.target.value;
		var state = this.state
		if (value_type === "comment") {
			state.comment = value
		}
		else if (value_type === "captcha") {
			state.captcha = value
		}
		state.is_valid = false
		this.setState(state)
	}

	handleSubmit = (event) => {
		event.preventDefault();
		var data = {};
		data["comment"] = this.state.comment
		data["captcha"] = this.state.captcha
		this.props.handleSubmit(data);
	}

	toggle = () => {
		this.props.toggle(this.props.is_open)
	}

	render() {

		var state = this.state;
		let { comments, successComment, is_loggedin_validation, captchaImage,InvalidCaptcha, resetAll, is_captcha, is_loggedin } = this.props
		
		if(resetAll){
			state.comment = ""
			state.captcha = ""
			this.props.fetchCaptcha();
		}

		let all_comments;
		if (comments.length > 0) {
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
						<hr />
					</React.Fragment>
				)
			})
		} else {
			all_comments = <h4>Comments not available</h4>
		}

		return (
			<React.Fragment>
				{is_loggedin ?
					<div className="comment-post">
						<Form onSubmit={this.handleSubmit}>
							<FormGroup>
								<Input type="textarea" name="comment" id="exampleText" onChange={(e) => this.handleChange("comment", e)} value={this.state.comment} placeholder="Enter comments here..."/>
							</FormGroup>
							<FormGroup>
								<div className="clearfix">
									<div className="float-left" hidden={is_captcha}>
										<img src={captchaImage} alt={captchaImage} style={{padding:10}}/>
										<button type="button" class="btn btn-default btn-sm" onClick={() => this.props.fetchCaptcha()} style={{padding:10}}>
											<FontAwesomeIcon icon={faRedo} />
										</button>
										<input type="text" onChange={(e) => this.handleChange("captcha", e)} placeholder="Enter Captcha" value={this.state.captcha}  style={{padding:10}}></input>
									</div>
									<div className="float-left ml-2" style={{padding:10}}>
										<React.Fragment>
											{successComment ?
												<Alert color="success" className="success-comment">Comment submitted successfully.</Alert>
												:
												""
											}

											{is_loggedin_validation ?
												<Alert color="danger" className="success-comment">Please Login or Sigup.</Alert>
												:
												""
											}
											{InvalidCaptcha ?
												<Alert color="danger" className="success-comment">Enter correct captcha.</Alert>
												:
												""
											}
										</React.Fragment>
									</div>
									<div className="float-right" style={{padding:10}}>
										<button className="btn btn-danger" disabled={(this.state.comment && this.state.captcha) === "" ? true : false}>Submit</button>
									</div>
								</div>
							</FormGroup>
						</Form>
					</div>
				:
					<div className="row">
						<div className="col-lg-2 offset-lg-5">
							<button className="btn btn-danger btn-block" style={{fontWeight:600}} onClick={this.toggle}>Login</button>
						</div>
					</div>
				}
				<div className="comment-list mt-4">
					<div className="heading">
						<h5><strong>{`${comments.length > 0 ? comments.length : "0"}`} Comments</strong></h5>
					</div>
					{comments.length > 0 ?
						<div className="all-comment  mt-3">{all_comments}</div>
						: ""}
				</div>
			</React.Fragment>
		)
	}
}

export default Comments