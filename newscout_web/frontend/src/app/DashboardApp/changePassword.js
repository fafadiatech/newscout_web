import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import Cookies from 'universal-cookie';
import logo from '../NewsApp/logo.png';
import { ToastContainer, toast } from 'react-toastify';
import { Menu, SideBar, Footer } from 'newscout';
import * as serviceWorker from './serviceWorker';
import { CHANGE_PASSWORD_URL } from '../../utils/Constants';
import { postRequest, authHeaders } from '../../utils/Utils';
import { Button, Form, FormGroup, Label, FormText } from 'reactstrap';

import './index.css';
import config_data from '../NewsApp/config.json';

import 'newscout/assets/Menu.css'
import 'newscout/assets/Sidebar.css'

const cookies = new Cookies();

class ChangePassword extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			fields: {
				old_password: "",
				password: "",
				confirm_password: ""
			},
			errors: {},
			username: USERNAME,
			isChecked: false,
		};
	}

	isSideBarToogle = (data) => {
		if (data === true) {
			this.setState({ isSideOpen: true })
			cookies.set('isSideOpen', true, { path: '/' });
		} else {
			this.setState({ isSideOpen: false })
			cookies.remove('isSideOpen', { path: '/' });
		}
	}

	onChange = (field, e) => {
		let fields = this.state.fields;
		fields[field] = e.target.value;
		this.setState({ fields });
	}

	handleValidation = () => {
		let fields = this.state.fields;
		let errors = {};
		let formIsValid = true;
		let required_msg = "This fields is required";

		if (!fields["old_password"]) {
			formIsValid = false;
			errors["old_password"] = required_msg;
		}

		if (!fields["password"]) {
			formIsValid = false;
			errors["password"] = required_msg;
		}

		if (!fields["confirm_password"]) {
			formIsValid = false;
			errors["confirm_password"] = required_msg;
		}

		this.setState({ errors: errors });
		return formIsValid;
	}

	handleSubmit = (event) => {
		event.preventDefault();
		if (this.handleValidation()) {
			var body = JSON.stringify(this.state.fields)
			postRequest(CHANGE_PASSWORD_URL, body, this.changePasswordResponse, "POST", authHeaders);
		}
	}

	changePasswordResponse = (data) => {
		if (data.body) {
			toast.success(data.body.Msg);
			setTimeout(() => {
				window.location.href = "/"
			}, 3000);
		} else {
			let errors = {};
			let formIsValid = true;
			let error_msg = data.errors.Msg;
			formIsValid = false;
			errors[data.errors.field] = error_msg;
			this.setState({ errors: errors });
		}
	}

	toggleSwitch = (data) => {
		if (data === true) {
			if (document.getElementById("dark_style")) {
				document.getElementById("dark_style").disabled = false;
			} else {
				var head = document.getElementsByTagName('head')[0];
				var link = document.createElement('link');
				link.id = 'dark_style'
				link.rel = 'stylesheet';
				link.type = 'text/css';
				link.href = '/static/css/dark-style.css';
				link.media = 'all';
				head.appendChild(link);
			}
			this.setState({ isChecked: true })
			cookies.set('isChecked', true, { path: '/' });
		} else {
			if (document.getElementById("dark_style")) {
				document.getElementById("dark_style").disabled = true;
			}
			this.setState({ isChecked: false })
			cookies.remove('isChecked', { path: '/' });
		}
	}

	getTheme = () => {
		if (cookies.get('isChecked')) {
			if (document.getElementById("dark_style")) {
				document.getElementById("dark_style").disabled = false;
			} else {
				var head = document.getElementsByTagName('head')[0];
				var link = document.createElement('link');
				link.id = 'dark_style';
				link.rel = 'stylesheet';
				link.type = 'text/css';
				link.href = '/static/css/dark-style.css';
				link.media = 'all';
				head.appendChild(link);
			}
		} else {
			if (document.getElementById("dark_style")) {
				document.getElementById("dark_style").disabled = true;
			}
		}
	}

	componentDidMount() {
		window.addEventListener('scroll', this.handleScroll, true);
		if (cookies.get('isSideOpen')) {
			this.setState({ isSideOpen: true })
		} else {
			this.setState({ isSideOpen: false })
		}
		if (cookies.get('isChecked')) {
			this.setState({ isChecked: true })
		} else {
			this.setState({ isChecked: false })
		}
		this.getTheme();
	}

	componentWillUnmount = () => {
		window.removeEventListener('scroll', this.handleScroll)
	}

	render() {
		var { menus, isSideOpen, isChecked, username, isChecked } = this.state;

		return (
			<React.Fragment>
				<ToastContainer />
				<div className="campaign">
					<Menu
						logo={logo}
						navitems={config_data.dashboardmenu}
						isSlider={true}
						isSideBarToogle={this.isSideBarToogle}
						isSideOpen={isSideOpen}
						domain="dashboard"
						isChecked={isChecked}
						username={username}
						toggleSwitch={this.toggleSwitch}
						isChecked={isChecked} />
					<div className="container-fluid">
						<div className="row">
							<SideBar menuitems={config_data.dashboardmenu} class={isSideOpen} domain="dashboard" isChecked={isChecked} />
							<div className={`main-content ${isSideOpen ? 'offset-lg-2 col-lg-10' : 'col-lg-12'}`}>
								<div className="pt-50 mb-3">
									<h1 className="h2">Change Password</h1>
									<div className="row">
										<div className="col-lg-4 mt-4">
											<Form onSubmit={this.handleSubmit}>
												<FormGroup>
													<Label for="old-password">Old Password</Label>
													<input refs="old-password" type="password" name="password" className="form-control" placeholder="******" value={this.state.fields.old_password} onChange={(e) => this.onChange("old_password", e)} />
													<FormText color="danger">{this.state.errors["old_password"]}</FormText>
												</FormGroup>
												<FormGroup>
													<Label for="new-password">New Password</Label>
													<input refs="new-password" type="password" name="password" className="form-control" placeholder="******" value={this.state.fields.password} onChange={(e) => this.onChange("password", e)} />
													<FormText color="danger">{this.state.errors["password"]}</FormText>
												</FormGroup>
												<FormGroup>
													<Label for="cnf-password">Confirm Password</Label>
													<input refs="cnf-password" type="password" name="password" className="form-control" placeholder="******" value={this.state.fields.confirm_password} onChange={(e) => this.onChange("confirm_password", e)} />
													<FormText color="danger">{this.state.errors["confirm_password"]}</FormText>
												</FormGroup>
												<Button color="success" type="submit">Submit</Button>
											</Form>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<Footer privacyurl="#" facebookurl="#" twitterurl="#" />
			</React.Fragment>
		);
	}
}

export default ChangePassword;

ReactDOM.render(<ChangePassword />, document.getElementById('root'));
serviceWorker.unregister();
