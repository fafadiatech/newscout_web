import React from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import Cookies from 'universal-cookie';
import logo from '../NewsApp/logo.png';
import { ToastContainer } from 'react-toastify';
import { Menu, SideBar, Footer } from 'newscout';
import * as serviceWorker from './serviceWorker';
import { ADVERTISEMENT_URL, GROUP_GROUPTYPE_URL } from '../../utils/Constants';
import { getRequest, postRequest, fileUploadHeaders, authHeaders, putRequest, deleteRequest, notify } from '../../utils/Utils';
import { Button, Form, FormGroup, Input, Label, FormText, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Table } from 'reactstrap';

import './index.css';
import config_data from '../NewsApp/config.json';

import 'newscout/assets/Menu.css'
import 'newscout/assets/Sidebar.css'

const cookies = new Cookies();

class Advertisement extends React.Component {
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
			var url = ADVERTISEMENT_URL + "?q=" + this.state.q;
			getRequest(url, this.getAdvertisementData, authHeaders);
		}
	}

	handleChange = (field, e) => {
		let fields = this.state.fields;
		if (field === "adgroup" || field === "ad_type") {
			fields[field] = { value: e.value, label: e.label };
		} else if (e.target.files) {
			fields[field] = e.target.files[0];
		} else if (field === "is_active") {
			fields[field] = e.target.checked;
		} else {
			fields[field] = e.target.value;
		}
		if (this.handleValidation()) {
			this.setState({ fields });
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
			this.getAdvertisements()
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
			postRequest(ADVERTISEMENT_URL, body, this.advertisementSubmitResponse, "POST", fileUploadHeaders, extra_data);
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
			var url = ADVERTISEMENT_URL + id + "/";
			putRequest(url, body, this.advertisementSubmitResponse, "PUT", fileUploadHeaders, extra_data);
		} else {
			this.setState({ 'formSuccess': false });
		}
	}

	toggle = () => {
		this.setState(prevState => ({
			modal: !prevState.modal,
			fields: {}
		}));
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

	deleteAdvertisementResponse = (data) => {
		notify(data.body.Msg)
	}

	deleteRow = (e) => {
		let dataindex = e.target.getAttribute('data-index');
		let findrow = document.body.querySelector('[data-row="' + dataindex + '"]');
		let url = ADVERTISEMENT_URL + dataindex + "/";
		deleteRequest(url, this.deleteAdvertisementResponse, authHeaders)
		setTimeout(function () {
			findrow.style.transition = '0.8s';
			findrow.style.opacity = '0';
			document.getElementById("group-table").deleteRow(findrow.rowIndex);
		}, 1000);
	}

	getGroupAndGroupType = (data) => {
		let groups_array = []
		let groupstype_array = []

		if (data.body.groups) {
			data.body.groups.map((item, index) => {
				let group_dict = {}
				group_dict['value'] = item.id
				group_dict['label'] = item.campaign.name
				group_dict['name'] = item.campaign.name
				groups_array.push(group_dict)
			})
		}

		if (data.body.types) {
			data.body.types.map((item, index) => {
				let types_dict = {}
				types_dict['value'] = item.id
				types_dict['label'] = item.type
				types_dict['name'] = item.type
				groupstype_array.push(types_dict)
			})
		}

		this.setState({
			"groups": groups_array,
			"grouptypes": groupstype_array
		})
	}

	getAdvertisements = (data) => {
		this.setState({
			loading: true
		})
		var url = ADVERTISEMENT_URL;
		getRequest(url, this.getAdvertisementData, authHeaders);
	}

	getAdvertisementData = (data) => {
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
		getRequest(this.state.next, this.getAdvertisementData, authHeaders);
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
		this.getAdvertisements()
		var group_type_url = GROUP_GROUPTYPE_URL;
		getRequest(group_type_url, this.getGroupAndGroupType, authHeaders)
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
		var { menus, isSideOpen, username, isChecked } = this.state

		let result_array = this.state.results
		let results = []
		let state = this.state;

		result_array.map((el, index) => {
			if (state.fields.adgroup === undefined) {
				var adgroup_value = { value: el.adgroup.id, label: el.adgroup.campaign.name }
			} else {
				var adgroup_value = state.fields.adgroup;
			}
			if (state.fields.adgroup === undefined) {
				var adtype_value = { value: el.ad_type.id, label: el.ad_type.type }
			} else {
				var adtype_value = state.fields.ad_type;
			}

			if (state.fields.ad_text === undefined) {
				var ad_text_value = el.ad_text;
			} else {
				var ad_text_value = state.fields.ad_text;
			}

			if (state.fields.ad_url === undefined) {
				var ad_url_value = el.ad_url;
			} else {
				var ad_url_value = state.fields.ad_url;
			}

			if (state.fields.is_active === undefined) {
				var is_active_value = el.is_active;
			} else {
				var is_active_value = state.fields.is_active;
			}
			var data = <tr key={index} data-row={el.id}>
				<th scope="row">{index + 1}</th>
				<td>
					{this.state.rows[el.id] ?
						<React.Fragment>
							<Select refs="adgroup" value={adgroup_value} onChange={(e) => this.handleChange("adgroup", e)} options={this.state.groups} />
							<FormText color="danger">{this.state.errors["adgroup"]}</FormText>
						</React.Fragment>
						:
						<span>{el.adgroup.campaign.name}</span>
					}
				</td>
				<td>
					{this.state.rows[el.id] ?
						<React.Fragment>
							<Select refs="ad_type" value={adtype_value} onChange={(e) => this.handleChange("ad_type", e)} options={this.state.grouptypes} />
							<FormText color="danger">{this.state.errors["ad_type"]}</FormText>
						</React.Fragment>
						:
						<span>{el.ad_type.type}</span>
					}
				</td>
				<td>
					{this.state.rows[el.id] ?
						<React.Fragment>
							<input refs="ad_text" type="text" name="ad_text" className="form-control" placeholder="Advertisement Title" id="advertisementtext" onChange={(e) => this.handleChange("ad_text", e)} value={ad_text_value} />
							<FormText color="danger">{this.state.errors["ad_text"]}</FormText>
						</React.Fragment>
						:
						<span>{el.ad_text}</span>
					}
				</td>
				<td>
					{this.state.rows[el.id] ?
						<React.Fragment>
							<input refs="ad_url" type="text" name="ad_url" className="form-control" placeholder="Advertisement Url" id="ad-url" onChange={(e) => this.handleChange("ad_url", e)} value={ad_url_value} />
							<FormText color="danger">{this.state.errors["ad_url"]}</FormText>
						</React.Fragment>
						:
						<span><a href={el.ad_url} target="_blank">{el.ad_url}</a></span>
					}
				</td>
				{this.state.rows[el.id] ?
					<td><input refs="media" type="file" name="media" id="ad-media" onChange={(e) => this.handleChange("media", e)} />{el.media}</td>
					:
					<td className="text-primary">{el.media}</td>
				}
				{this.state.rows[el.id] ?
					<td><input type="checkbox" checked={is_active_value} name="is_active" onChange={(e) => this.handleChange("is_active", e)} /></td>
					:
					<React.Fragment>
						{el.is_active ?
							<React.Fragment>
								<td className="text-success font-weight-bold">Active</td>
							</React.Fragment>
							:
							<React.Fragment>
								<td className="text-info font-weight-bold">Pause</td>
							</React.Fragment>
						}
					</React.Fragment>
				}
				<td>
					<ul className="list-inline m-0">
						{this.state.rows[el.id] ?
							<React.Fragment>
								<li className="list-inline-item btn btn-sm btn-success" data-index={el.id} onClick={this.updateAdvertisementSubmit}>Save
								</li>
								<li className="list-inline-item btn btn-sm btn-danger" data-index={el.id} onClick={this.cancelRow}>Cancel</li>
							</React.Fragment>
							:
							<React.Fragment>
								<li className="list-inline-item btn btn-sm btn-warning" data-index={el.id} onClick={this.editRow}>Edit</li>
								<li className="list-inline-item btn btn-sm btn-danger" data-index={el.id} onClick={this.deleteRow}>Delete</li>
							</React.Fragment>
						}
					</ul>
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
							<SideBar menuitems={config_data.dashboardmenu} class={isSideOpen} domain="dashboard" isChecked={isChecked} />
							<div className={`main-content ${isSideOpen ? 'offset-lg-2 col-lg-10' : 'col-lg-12'}`}>
								<div className="pt-50 mb-3">
									<h1 className="h2">Advertisement</h1>
									<div className="clearfix">
										<div className="float-left">
											<Button color="success" size="md" onClick={this.toggle}>Add new</Button>
										</div>
										<div className="float-right">
											<Form>
												<Input type="text" name="query" className="form-control" placeholder="search" onChange={this.handleQueryChange} value={this.state.q} onKeyPress={event => { this.handleKeyPress(event) }} />
											</Form>
										</div>
									</div>
								</div>
								<hr />
								<div className="my-5">
									<h5 className="text-info">Total {this.state.results.length} Advertisement</h5>
									<Table striped id="group-table">
										<thead>
											<tr>
												<th style={{ width: "5%" }}>#</th>
												<th style={{ width: "10%" }}>Ad. Group</th>
												<th style={{ width: "10%" }}>Ad. Type</th>
												<th style={{ width: "20%" }}>Advertisement Title</th>
												<th style={{ width: "20%" }}>Advertisement Url</th>
												<th style={{ width: "15%" }}>Media</th>
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

					<Modal isOpen={this.state.modal} toggle={this.toggle}>
						<ModalHeader toggle={this.toggle}>Add new advertisement</ModalHeader>
						<ModalBody>
							<Form>
								<FormGroup>
									<Label for="adgroup">Campaign</Label>
									<Select refs="adgroup" value={this.state.fields["adgroup"] ? this.state.fields["adgroup"] : ''} onChange={(e) => this.handleChange("adgroup", e)} options={this.state.groups.reverse()} />
									<FormText color="danger">{this.state.errors["adgroup"]}</FormText>
								</FormGroup>
								<FormGroup>
									<Label for="ad_type">Bid Type</Label>
									<Select refs="ad_type" value={this.state.fields["ad_type"] ? this.state.fields["ad_type"] : ''} onChange={(e) => this.handleChange("ad_type", e)} options={this.state.grouptypes} />
									<FormText color="danger">{this.state.errors["ad_type"]}</FormText>
								</FormGroup>
								<FormGroup>
									<Label for="ad_text">Advertisement Title</Label>
									<input refs="ad_text" type="text" name="ad_text" className="form-control" placeholder="Advertisement Title" id="advertisementtext" onChange={(e) => this.handleChange("ad_text", e)} value={this.state.fields["ad_text"]} />
									<FormText color="danger">{this.state.errors["ad_text"]}</FormText>
								</FormGroup>
								<FormGroup>
									<Label for="ad_url">Advertisement Url</Label>
									<input refs="ad_url" type="text" name="ad_url" className="form-control" placeholder="Advertisement Url" id="ad-url" onChange={(e) => this.handleChange("ad_url", e)} value={this.state.fields["ad_url"]} />
									<FormText color="danger">{this.state.errors["ad_url"]}</FormText>
								</FormGroup>
								<FormGroup>
									<Label for="media">Media</Label>
									<input refs="media" type="file" name="media" className="form-control-file" id="ad-media" onChange={(e) => this.handleChange("media", e)} />
									<FormText color="danger">{this.state.errors["media"]}</FormText>
								</FormGroup>
							</Form>
						</ModalBody>
						<ModalFooter>
							<div className="clearfix" style={{ width: "100%" }}>
								<div className="float-left">
									{this.state.formSuccess ?
										<h6 className="text-success m-0">Ad created successfully.</h6>
										: ""}
								</div>
								<div className="float-right">
									<Button color="success" onClick={this.advertisementSubmit} type="button">Submit</Button>&nbsp;&nbsp;
									<Button color="secondary" onClick={this.toggle} type="button">Cancel</Button>
								</div>
							</div>
						</ModalFooter>
					</Modal>
				</div>
				<Footer privacyurl="#" facebookurl="#" twitterurl="#" />
			</React.Fragment>
		);
	}
}

export default Advertisement;

ReactDOM.render(<Advertisement />, document.getElementById('root'));
serviceWorker.unregister();
