import React from 'react';
import ReactDOM from 'react-dom';

import { Button, Form, FormGroup, Label, Input, FormText, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { getRequest } from '../../utils/Utils';

import config_data from './config.json';

const URL = "/news/search/";

class Auth extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			modal: this.props.is_open,
			auth_section: true
		};
	}

	toggle = () => {
		this.setState({
			modal: this.props.is_open
		}, function(){
			this.props.toggle(this.state.modal)
		})
	}

	handleAuth = () => {
		this.setState({
			auth_section: !this.state.auth_section
		})
	}

	render() {
		let { is_open } = this.props
		return(
			<Modal isOpen={is_open} toggle={this.toggle} className="{className}">
				{this.state.auth_section ?
					<React.Fragment>
						<ModalHeader toggle={this.toggle}>Login</ModalHeader>
						<ModalBody>
							<Form>
								<FormGroup>
									<Label for="email">Email</Label>
									<Input type="email" name="email" id="email" placeholder="Email" />
								</FormGroup>
								<FormGroup>
									<Label for="password">Password</Label>
									<Input type="password" name="password" id="password" placeholder="******" />
								</FormGroup>
								<FormGroup>
									<Button color="primary" onClick={this.toggle}>Login</Button>
								</FormGroup>
							</Form>
						</ModalBody>
						<ModalFooter>
							<p onClick={this.handleAuth}>Signup</p>
						</ModalFooter>
					</React.Fragment>
				:
					<React.Fragment>
						<ModalHeader toggle={this.toggle}>Signup</ModalHeader>
						<ModalBody>
							<Form>
								<div className="row">
									<div className="col-lg-6">
										<FormGroup>
											<Label for="firstname">First Name</Label>
											<Input type="text" name="first_name" id="firstname" placeholder="First Name" />
										</FormGroup>
									</div>
									<div className="col-lg-6">
										<FormGroup>
											<Label for="lastname">Last Name</Label>
											<Input type="text" name="last_name" id="lastname" placeholder="Last Name" />
										</FormGroup>
									</div>
									<div className="col-lg-6">
										<FormGroup>
											<Label for="email">Email</Label>
											<Input type="email" name="email" id="email" placeholder="Email" />
										</FormGroup>
									</div>
									<div className="col-lg-6">
										<FormGroup>
											<Label for="password">Password</Label>
											<Input type="password" name="password" id="password" placeholder="******" />
										</FormGroup>
									</div>
									<div className="col-lg-12">
										<FormGroup>
											<Button color="primary" onClick={this.toggle}>Signup</Button>
										</FormGroup>
									</div>
								</div>
							</Form>
						</ModalBody>
						<ModalFooter>
							<p onClick={this.handleAuth}>Login</p>
						</ModalFooter>
					</React.Fragment>
				}
			</Modal>
		)
	}
}

export default Auth