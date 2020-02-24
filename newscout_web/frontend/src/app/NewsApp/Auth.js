import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'universal-cookie';

import { Button, Form, FormGroup, Label, Input, FormText, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';

import { ARTICLE_LOGIN, ARTICLE_SIGNUP } from '../../utils/Constants';
import { getRequest, postRequest } from '../../utils/Utils';

import config_data from './config.json';

const URL = "/news/search/";
const cookies = new Cookies();

class Auth extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			modal: this.props.is_open,
			auth_section: true,
			fields: {
                email: "",
                password: "",
                first_name: "",
                last_name: ""
            },
            is_valid: false,
            domain: "device_name="+DOMAIN,
            first_name_validation: false,
			first_name_msg: "",
			last_name_validation: false,
			last_name_msg: "",
			email_validation: false,
			email_msg: "",
			password_validation: false,
			password_msg: "",
			success_msg: ""
		};
	}

	handleChange = (value_type, e) => {
        var value = e.target.value;
        var state = this.state

        if (value_type === "email") {
            state.fields.email = value
            state.email_validation = false
            state.email_msg = ""
        }

        if (value_type === "password") {
            state.fields.password = value
            state.password_validation = false
            state.password_msg = ""
        }

        if (value_type === "first_name") {
            state.fields.first_name = value
            state.first_name_validation = false
            state.first_name_msg = ""
        }

        if (value_type === "last_name") {
            state.fields.last_name = value
            state.last_name_validation = false
            state.last_name_msg = ""
        }
        this.setState(state)
    }

	toggle = () => {
		this.setState({
			modal: this.props.is_open
		}, function(){
			this.props.toggle(this.state.modal)
		})
	}

	handleLoginSubmit = (event) => {
		event.preventDefault();
        var body = JSON.stringify(this.state.fields)
        postRequest(ARTICLE_LOGIN+"?"+this.state.domain, body, this.authLoginResponse, "POST");
    }

    handleSignupSubmit = (event) => {
		event.preventDefault();

		let state = this.state;
		var first_name = state.fields.first_name
		var last_name = state.fields.last_name
		var email = state.fields.email
		var password = state.fields.password
		
		if(first_name === ""){
			state.first_name_validation = true
			state.first_name_msg = "This fields is required."
		}

		if(last_name === ""){
			state.last_name_validation = true
			state.last_name_msg = "This fields is required."
		}

		if(email === ""){
			state.email_validation = true
			state.email_msg = "This fields is required."
		}

		if(password === ""){
			state.password_validation = true
			state.password_msg = "This fields is required."
		}

		this.setState(state)

		if(first_name || last_name || email || password){
	        var body = JSON.stringify(this.state.fields)
	        postRequest(ARTICLE_SIGNUP+"?"+this.state.domain, body, this.authSignupResponse, "POST");
		}
    }

    authLoginResponse = (data) => {
        if(data !== "error"){
            let first_name = data.body.user.first_name;
            let last_name = data.body.user.last_name;
            let state = this.state;
            state.fields.first_name = first_name;
            state.fields.last_name = last_name;
            state.is_valid = false;
            this.setState(state)
            this.toggle()
    		
    		cookies.set('token', data.body.user.token);
            cookies.set('full_name', first_name+" "+last_name);
            this.props.loggedInUser(cookies.get('full_name'))

        } else {
            this.setState({
                is_valid: true
            })
        }
    }

    authSignupResponse = (data) => {
    	var state = this.state
    	if(data.errors){
    		data.errors.errorList.map((item, index) => {
    			if(item.field === "email"){
    				state.email_validation = true
    				state.email_msg = item.field_error
    			} else if(item.field === "first_name") {
    				state.first_name_validation = true
    				state.first_name_msg = item.field_error
    			} else if(item.field === "last_name") {
    				state.last_name_validation = true
    				state.last_name_msg = item.field_error
    			} else {
    				state.password_validation = true
    				state.password_msg = item.field_error
    			}
    		})
    		this.setState(state)
    	} else {
    		state.success_msg = data.Msg
    		this.setState(state)
    		window.location.reload()
    	}
    }

	handleAuth = () => {
		this.setState({
			auth_section: !this.state.auth_section
		})
	}

	render() {
		let { is_open } = this.props
		return(
			<Modal isOpen={is_open} toggle={this.toggle}>
				{this.state.auth_section ?
					<React.Fragment>
						<ModalHeader toggle={this.toggle} className="text-danger"><strong>Login</strong></ModalHeader>
						<ModalBody>
							<Form onSubmit={this.handleLoginSubmit} className="authform">
								<FormGroup>
									<Label for="email">Email</Label>
									<Input type="email" name="email" id="email" placeholder="Email" onChange={(e) => this.handleChange("email", e)} />
								</FormGroup>
								<FormGroup>
									<Label for="password">Password</Label>
									<Input type="password" name="password" id="password" placeholder="******" onChange={(e) => this.handleChange("password", e)} />
								</FormGroup>
								<FormGroup>
									<button type="submit" className="btn btn-danger">Login</button>
								</FormGroup>
							</Form>
							{this.state.is_valid ?
                                <Alert color="danger">Wrong password or email.</Alert>
                            : ""
                            }
						</ModalBody>
						<ModalFooter>
							<p onClick={this.handleAuth} className="authtitle">Need an account? Signup</p>
						</ModalFooter>
					</React.Fragment>
				:
					<React.Fragment>
						<ModalHeader toggle={this.toggle} className="text-danger"><strong>Signup</strong></ModalHeader>
						<ModalBody>
							<Form onSubmit={this.handleSignupSubmit} className="authform">
								<div className="row">
									<div className="col-lg-6">
										<FormGroup>
											<Label for="first_name">First Name <span className="text-danger">*</span></Label>
											<Input type="text" name="first_name" id="first_name" placeholder="First Name" onChange={(e) => this.handleChange("first_name", e)} />
											{this.state.first_name_validation ?
												<span className="text-danger"><small>{this.state.first_name_msg}</small></span>
											:
												""
											}
										</FormGroup>
									</div>
									<div className="col-lg-6">
										<FormGroup>
											<Label for="last_name">Last Name <span className="text-danger">*</span></Label>
											<Input type="text" name="last_name" id="last_name" placeholder="Last Name" onChange={(e) => this.handleChange("last_name", e)} />
											{this.state.last_name_validation ?
												<span className="text-danger"><small>{this.state.last_name_msg}</small></span>
											:
												""
											}
										</FormGroup>
									</div>
									<div className="col-lg-6">
										<FormGroup>
											<Label for="email">Email <span className="text-danger">*</span></Label>
											<Input type="email" name="email" id="email" placeholder="Email" onChange={(e) => this.handleChange("email", e)} />
											{this.state.email_validation ?
												<span className="text-danger"><small>{this.state.email_msg}</small></span>
											:
												""
											}
										</FormGroup>
									</div>
									<div className="col-lg-6">
										<FormGroup>
											<Label for="password">Password <span className="text-danger">*</span></Label>
											<Input type="password" name="password" id="password" placeholder="******" onChange={(e) => this.handleChange("password", e)} />
											{this.state.password_validation ?
												<span className="text-danger"><small>{this.state.password_msg}</small></span>
											:
												""
											}
										</FormGroup>
									</div>
									<div className="col-lg-12">
										<div className="clearfix">
											<div className="float-left">
												<FormGroup>
													<button type="submit" className="btn btn-danger">Signup</button>
												</FormGroup>
											</div>
											<div className="float-left ml-2">
												{this.state.success_msg !== "" ?
													<Alert color="success">{this.state.success_msg}</Alert>
												: ""
												}
											</div>
										</div>
									</div>
								</div>
							</Form>
						</ModalBody>
						<ModalFooter>
							<p onClick={this.handleAuth} className="authtitle">Already registered? Login</p>
						</ModalFooter>
					</React.Fragment>
				}
			</Modal>
		)
	}
}

export default Auth