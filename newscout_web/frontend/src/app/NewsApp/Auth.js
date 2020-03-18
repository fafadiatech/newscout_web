import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'universal-cookie';

import { Button, Form, FormGroup, Label, Input, FormText, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';

import { ARTICLE_LOGIN, ARTICLE_SIGNUP, ARTICLE_FORGOTPASSWORD } from '../../utils/Constants';
import { getRequest, postRequest } from '../../utils/Utils';

import config_data from './config.json';

const URL = "/news/search/";
const cookies = new Cookies();

class Auth extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			modal: this.props.is_open,
			auth_section: "login",
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
			modal: this.props.is_open,
			fields: {
				email: "",
				password: "",
				first_name: "",
				last_name: ""
			},
			is_valid: false,
			first_name_validation: false,
			first_name_msg: "",
			last_name_validation: false,
			last_name_msg: "",
			email_validation: false,
			email_msg: "",
			password_validation: false,
			password_msg: "",
			success_msg: ""
		}, function(){
			this.props.toggle(this.state.modal)
		})
	}

	handleLoginSubmit = (event) => {
		event.preventDefault();

		let state = this.state;
		var email = state.fields.email
		var password = state.fields.password

		if(email === ""){
			state.email_validation = true
			state.email_msg = "This fields is required."
		}

		if(password === ""){
			state.password_validation = true
			state.password_msg = "This fields is required."
		}

		this.setState(state)

		if(email || password){
        	var body = JSON.stringify(this.state.fields)
        	postRequest(ARTICLE_LOGIN+"?"+this.state.domain, body, this.authLoginResponse, "POST");
        }
    }

    handleForgotPWDSubmit = (event) => {
		event.preventDefault();

		let state = this.state;
		var email = state.fields.email

		if(email === ""){
			state.email_validation = true
			state.email_msg = "This fields is required."
		}

		this.setState(state)
		
		if(email) {
        	var body = JSON.stringify(this.state.fields)
        	postRequest(ARTICLE_FORGOTPASSWORD+"?"+this.state.domain, body, this.authForgotPWDResponse, "POST");
        }
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
        if(data === "error" || data.errors) {
        	var error = data.errors.invalid_credentials
        	if(error){
        		this.setState({
        			password_validation: true,
	                password_msg: error
	            })
        	} else {
        		this.setState({
	                is_valid: true
	            })
        	}
        } else {
            let first_name = data.body.user.first_name;
            let last_name = data.body.user.last_name;
            let state = this.state;
            state.fields.first_name = first_name;
            state.fields.last_name = last_name;
            state.is_valid = false;
            this.setState(state)
            this.toggle()
    		
    		cookies.set('token', data.body.user.token, { path: '/' });
            cookies.set('full_name', first_name+" "+last_name, { path: '/' });
            this.props.loggedInUser(cookies.get('full_name'))
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
    		state.success_msg = data.body.Msg
    		this.setState(state)
    		setTimeout(function(){
    			window.location.reload()
    		}, 4000)
    	}
    }

    authForgotPWDResponse = (data) => {
    	console.log(data)
    	// if(data !== "error"){
     //        let state = this.state;
     //        state.is_valid = false;
     //        this.setState(state)
     //        this.toggle()
    		
    	// 	cookies.set('token', data.body.user.token);
     //        cookies.set('full_name', first_name+" "+last_name);
     //        this.props.loggedInUser(cookies.get('full_name'))
     //    } else {
     //        this.setState({
     //            is_valid: true
     //        })
     //    }
    }

	handleAuth = (e) => {
		var state = this.state;
		state.auth_section = e.target.dataset.authsection,
		state.fields.email = "",
		state.fields.password = "",
		state.fields.first_name = "",
		state.fields.last_name = "",
		state.is_valid = false,
		state.first_name_validation = false,
		state.first_name_msg = "",
		state.last_name_validation = false,
		state.last_name_msg = "",
		state.email_validation = false,
		state.email_msg = "",
		state.password_validation = false,
		state.password_msg = "",
		state.success_msg = ""
		this.setState(state)
	}

	render() {
		let { is_open } = this.props
		let { fields } = this.state
		return(
			<Modal isOpen={is_open} toggle={this.toggle}>
				{this.state.auth_section === "login" ?
					<React.Fragment>
						<ModalHeader toggle={this.toggle} className="text-danger"><strong>Login</strong></ModalHeader>
						<ModalBody>
							<Form onSubmit={this.handleLoginSubmit} className="authform">
								<FormGroup>
									<Label for="email">Email</Label>
									<Input type="email" name="email" id="email" placeholder="Email" onChange={(e) => this.handleChange("email", e)} value={fields.email} />
									{this.state.email_validation ?
										<span className="text-danger"><small>{this.state.email_msg}</small></span>
									:
										""
									}
								</FormGroup>
								<FormGroup>
									<Label for="password">Password</Label>
									<Input type="password" name="password" id="password" placeholder="******" onChange={(e) => this.handleChange("password", e)} />
									{this.state.password_validation ?
										<span className="text-danger"><small>{this.state.password_msg}</small></span>
									:
										""
									}
								</FormGroup>
								<FormGroup>
									<div class="clearfix">
										<div class="float-left">
											<button type="submit" class="btn btn-danger mr-3">Login</button>
										</div>
										<div class="float-left">
											<h6 onClick={this.handleAuth} className="authtitle mt-2" data-authsection="forgotpwd">Forgot Password</h6>
										</div>
									</div>
								</FormGroup>
							</Form>
							{this.state.is_valid ?
                                <Alert color="danger">Wrong email or password.</Alert>
                            : ""
                            }
						</ModalBody>
						<ModalFooter>
							<p onClick={this.handleAuth} className="authtitle" data-authsection="signup">Need an account? Signup</p>
						</ModalFooter>
					</React.Fragment>
				: this.state.auth_section === "signup" ?
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
							<p onClick={this.handleAuth} className="authtitle" data-authsection="login">Already registered? Login</p>
						</ModalFooter>
					</React.Fragment>
				:
					<React.Fragment>
						<ModalHeader toggle={this.toggle} className="text-danger"><strong>Forgot Password?</strong></ModalHeader>
						<ModalBody>
							<Form onSubmit={this.handleForgotPWDSubmit} className="authform">
								<FormGroup>
									<Label for="email">Email</Label>
									<Input type="email" name="email" id="email" placeholder="Email" onChange={(e) => this.handleChange("email", e)} value={fields.email} />
									{this.state.email_validation ?
										<span className="text-danger"><small>{this.state.email_msg}</small></span>
									:
										""
									}
								</FormGroup>
								<FormGroup>
									<button type="submit" class="btn btn-danger">Submit</button>
								</FormGroup>
							</Form>
							{this.state.is_valid ?
                                <Alert color="danger">Wrong email.</Alert>
                            : ""
                            }
						</ModalBody>
						<ModalFooter>
							<p onClick={this.handleAuth} className="authtitle" data-authsection="login">Already registered? Login</p>
						</ModalFooter>
					</React.Fragment>
				}
			</Modal>
		)
	}
}

export default Auth