import React from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import Cookies from 'universal-cookie';
import logo from '../NewsApp/logo.png';
import { ToastContainer } from 'react-toastify';
import { Menu, SideBar, Footer } from 'newscout';
import * as serviceWorker from './serviceWorker';
import { SUBSCRIPTION_URL, GROUP_GROUPTYPE_URL } from '../../utils/Constants';
import { getRequest, postRequest, fileUploadHeaders, authHeaders, putRequest, deleteRequest, notify } from '../../utils/Utils';
import { Button, Form, FormGroup, Input, Label, FormText, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Table } from 'reactstrap';

import './index.css';
import config_data from '../NewsApp/config.json';

import 'newscout/assets/Menu.css'
import 'newscout/assets/Sidebar.css'

const cookies = new Cookies();

class Subscription extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			modal: false,
			fields: {},
			errors: {},
			rows: {},
			formSuccess: false,
			groups: [],
			grouptypes: [],
			results: [],
			next: null,
			previous: null,
			loading: false,
			q: "",
			page: 0,
			isSideOpen: true,
			isChecked: false,
			username: USERNAME,
			isChecked: false,
			active_page: ACTIVE_PAGE
		};
	}

	handleValidation = () => {
		let fields = this.state.fields;
		let errors = {};
		let formIsValid = true;
		let required_msg = "This fields is required";

		if (!fields["ad_text"]) {
			formIsValid = false;
			errors["ad_text"] = required_msg;
		}

		if (!fields["ad_url"]) {
			formIsValid = false;
			errors["ad_url"] = required_msg;
		} else if (!this.valid_url(fields["ad_url"])) {
			formIsValid = false;
			errors["ad_url"] = "Not a valid url eg: https://example.com";
		}

		this.setState({ errors: errors });
		return formIsValid;
	}

	valid_url = (url) => {
		var regexp = /^(https:\/\/)|(http:\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
		if (regexp.test(url)) {
			return true;
		} else {
			return false;
		}
	}

	handleQueryChange = (event) => {
		var value = event.target.value;
		this.setState({
			q: value
		})
	}

	handleKeyPress = (event) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			this.setState({
				results: []
			})
			var url = SUBSCRIPTION_URL + "?q=" + this.state.q;
			getRequest(url, this.getSubscriptionData, authHeaders);
		}
	}

	handleChange = (field, e) => {
		let fields = this.state.fields;
		if (field === "adgroup") {
			fields[field] = { value: e.value, label: e.label };
		}
	}

	advertisementSubmitResponse = (data, extra_data) => {
		let rows = this.state.rows;
		rows[data.body.id] = false;
		if (extra_data.clean_results) {
			this.setState({ formSuccess: true, results: [], loading: true, rows: rows, fields: {} });
		} else {
			this.setState({ 'formSuccess': true, rows: rows, fields: {} });
		}
		setTimeout(() => {
			this.setState({ 'modal': false, 'formSuccess': false });
			this.getSubs();
		}, 3000);
	}

	advertisementSubmit = (e) => {
		e.preventDefault();
		if (this.handleValidation()) {
			const body = new FormData();
			body.set('adgroup', this.state.fields.adgroup.value)
			body.set('ad_type', this.state.fields.ad_type.value)
			body.set('ad_text', this.state.fields.ad_text)
			body.set('ad_url', this.state.fields.ad_url)
			body.set('file', this.state.fields.media)
			body.set('is_active', true)
			var extra_data = { "clean_results": true };
			postRequest(SUBSCRIPTION_URL, body, this.advertisementSubmitResponse, "POST", fileUploadHeaders, extra_data);
		} else {
			this.setState({ 'formSuccess': false });
		}
	}

	updateAdvertisementSubmit = (e) => {
		e.preventDefault();

		if (this.handleValidation()) {
			const body = new FormData();
			let id = e.target.getAttribute('data-index');
			body.set('adgroup', this.state.fields.adgroup.value);
			body.set('ad_type', this.state.fields.ad_type.value);
			body.set('ad_text', this.state.fields.ad_text);
			body.set('ad_url', this.state.fields.ad_url);
			body.set('file', this.state.fields.media);
			body.set('is_active', this.state.fields.is_active);
			var extra_data = { "clean_results": true };
			var url = SUBSCRIPTION_URL + id + "/";
			putRequest(url, body, this.advertisementSubmitResponse, "PUT", fileUploadHeaders, extra_data);
		} else {
			this.setState({ 'formSuccess': false });
		}
	}

	editRow = (e) => {
		let dataindex = e.target.getAttribute('data-index');
		let rows = this.state.rows;
		rows[dataindex] = true
		let fields = {}
		this.state.results.map((item, index) => {
			if (item.id === parseInt(dataindex)) {
				fields["adgroup"] = { value: item.adgroup.id, label: item.adgroup.campaign.name };
				fields["ad_type"] = { value: item.ad_type.id, label: item.ad_type.type };
				fields["ad_text"] = item.ad_text;
				fields["ad_url"] = item.ad_url;
				fields["is_active"] = item.is_active;
			}
		})
		this.setState({ rows: rows, fields: fields });
	}

	cancelRow = (e) => {
		var dataindex = e.target.getAttribute('data-index');
		let rows = this.state.rows;
		rows[dataindex] = false
		this.setState({ rows: rows, fields: {} });
	}

	getSubs = (data) => {
		this.setState({ loading: true })
		var url = SUBSCRIPTION_URL;
		getRequest(url, this.getSubscriptionData, authHeaders);
	}

	getSubscriptionData = (data) => {
		if (!Array.isArray(data.body)) {
			var results = [
				...this.state.results,
				...data.body.results
			]
		} else {
			var results = [
				...this.state.results
			]
		}
		this.setState({
			results: results,
			next: data.body.next,
			previous: data.body.previous,
			loading: false
		})
	}

	getNext = () => {
		this.setState({
			loading: true,
			page: this.state.page + 1
		})
		getRequest(this.state.next, this.getSubscriptionData, authHeaders);
	}

	handleScroll = () => {
		if ($(window).scrollTop() == $(document).height() - $(window).height()) {
			if (!this.state.loading && this.state.next) {
				this.getNext();
			}
		}
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
		this.getSubs();
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
		var { menus, isSideOpen, username, isChecked, active_page } = this.state;
		let result_array = this.state.results;
		let results = [];
		let state = this.state;
		let current_date = new Date()
		result_array.map((el, index) => {
			if (state.fields.adgroup === undefined) {
				var adgroup_value = { value: el.subs_type, label: el.subs_type }
			} else {
				var adgroup_value = state.fields.adgroup;
			}
			var data = <tr key={index} data-row={el.id}>
				<th scope="row">{index + 1}</th>
				<td>
					<span>{el.email}</span>
				</td>
				<td>
					<span>{el.subs_type}</span>
				</td>
				<td>
					<span>{el.created_at}</span>
				</td>
				<td>
					<span>{el.created_at && el.expires_on ? el.created_at : '-'}</span>
				</td>
				<td>
					<span>{el.expires_on ? el.expires_on : '-'}</span>
				</td>
				{el.expires_on <= current_date ?
					<React.Fragment>
						<td className="text-success font-weight-bold">Active</td>
					</React.Fragment>
				:
					<React.Fragment>
						<td className="text-info font-weight-bold">Pause</td>
					</React.Fragment>
				}
				<td>
					<a href={`/dashboard/subscription/${el.id}`} className="btn btn-sm btn-warning">Edit</a>
				</td>
			</tr>
			results.push(data);
		})

		return (
			<React.Fragment>
				<ToastContainer />
				<div className="group">
					<Menu
						logo={logo}
						navitems={config_data.dashboardmenu}
						isSlider={true}
						isSideBarToogle={this.isSideBarToogle}
						isSideOpen={isSideOpen}
						domain="dashboard"
						username={username}
						toggleSwitch={this.toggleSwitch}
						isChecked={isChecked} />
					<div className="container-fluid">
						<div className="row">
							<SideBar menuitems={config_data.dashboardmenu} class={isSideOpen} domain="dashboard" isChecked={isChecked} active_page={active_page} />
							<div className={`main-content ${isSideOpen ? 'offset-lg-2 col-lg-10' : 'col-lg-12'}`}>
								<div className="pt-50 mb-3">
									<div className="clearfix">
										<div className="float-left">
											<h1 className="h5 mt-2">Subscriptions</h1>
										</div>
										<div className="float-right">
											<ul className="list-inline m-0">
												<li className="list-inline-item">
													<h6 className="text-info fnt-sm"><strong>Total {this.state.results.length} Users</strong></h6>
												</li>
												<li className="list-inline-item">
													<Form>
														<Input type="text" name="query" className="form-control" placeholder="search" onChange={this.handleQueryChange} value={this.state.q} onKeyPress={event => { this.handleKeyPress(event) }} />
													</Form>
												</li>
											</ul>
										</div>
									</div>
								</div>
								<div className="mb-5 mt-2">
									<Table striped responsive hover id="group-table">
										<thead>
											<tr>
												<th style={{ width: "5%" }}>#</th>
												<th style={{ width: "5%" }}>Email</th>
												<th style={{ width: "25%" }}>Subscription Type</th>
												<th style={{ width: "20%" }}>Start date</th>
												<th style={{ width: "10%" }}>Duration</th>
												<th style={{ width: "15%" }}>Expires On</th>
												<th style={{ width: "10%" }}>Status</th>
												<th style={{ width: "10%" }}></th>
											</tr>
										</thead>
										<tbody>
											{results}
										</tbody>
									</Table>
									{
										this.state.loading ?
											<React.Fragment>
												<div className="lds-ring col-sm-12 col-md-7 offset-md-5"><div></div><div></div><div></div><div></div></div>
											</React.Fragment>
											: ""
									}
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

export default Subscription;

ReactDOM.render(<Subscription />, document.getElementById('root'));
serviceWorker.unregister();
