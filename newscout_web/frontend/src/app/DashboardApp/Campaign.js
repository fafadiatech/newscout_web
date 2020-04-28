import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import Datetime from 'react-datetime';
import logo from '../NewsApp/logo.png';
import Cookies from 'universal-cookie';
import { ToastContainer } from 'react-toastify';
import { Menu, SideBar, Footer } from 'newscout';
import * as serviceWorker from './serviceWorker';
import {CAMPAIGN_URL} from '../../utils/Constants';
import { getRequest, postRequest, putRequest, deleteRequest, notify, authHeaders } from '../../utils/Utils';
import { Button, Form, FormGroup, Input, Label, FormText, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Table } from 'reactstrap';

import './index.css';
import config_data from '../NewsApp/config.json';

import 'newscout/assets/Menu.css'
import 'newscout/assets/Sidebar.css'

const cookies = new Cookies();

class Campaign extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			modal: false,
			fields: {},
			errors: {},
			rows: {},
			formSuccess: false,
			results: [],
			next: null,
			previous: null,
			loading: false,
			q: "",
			page : 0,
			isSideOpen: true,
			username: USERNAME
		};
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
			var url = CAMPAIGN_URL + "?q=" + this.state.q;
			getRequest(url, this.getCampaignsData, authHeaders);
		}
	}

	handleValidation = () => {
		let fields = this.state.fields;
		let errors = {};
		let formIsValid = true;
		let required_msg = "This fields is required";

		//Campaign Name
		if(!fields["name"]){
			formIsValid = false;
			errors["name"] = required_msg;
		} else {
			errors["name"] = "";
		}

		if(typeof fields["name"] !== "undefined"){
			if(!fields["name"].match(/^[a-zA-Z ]+$/)){
				formIsValid = false;
				errors["name"] = "Only characters allowed";
			} else {
				errors["name"] = "";
			}
		}

		//Daily Budget
		if(typeof fields["daily_budget"] !== "undefined"){
			if(!fields["daily_budget"].match(/^\d+(?:\.\d{1,2})?$/)){
				formIsValid = false;
				errors["daily_budget"] = "Only numbers allowed";
			}
		}

		//Daily Budget
		if(typeof fields["max_bid"] !== "undefined"){
			if(!fields["max_bid"].match(/^\d+(?:\.\d{1,2})?$/)){
				formIsValid = false;
				errors["max_bid"] = "Only numbers allowed";
			}
		}

		//Start Date
		if(!fields["start_date"]){
			formIsValid = false;
			errors["start_date"] = required_msg;
		}

		//End Date
		if(!fields["end_date"]){
			formIsValid = false;
			errors["end_date"] = required_msg;
		}

		if(fields["end_date"] < fields["start_date"]){
			formIsValid = false;
			errors["end_date"] = "End date should be greater than start date";
		}

		this.setState({errors: errors});
		return formIsValid;
	}

	handleChange = (field, e) => {
		let fields = this.state.fields;
		if(field === "start_date" || field === "end_date"){
			fields[field] = e;
		} else if(field === "is_active") {
			fields[field] = e.target.checked;
		} else {
			fields[field] = e.target.value;
		}
		if(this.handleValidation()){
			this.setState({fields});
		}
	}

	campaignSubmitResponse = (data, extra_data) => {
		if (extra_data.clean_results) {
			this.setState({'formSuccess': true, loading: true, results: []});
		} else {
			this.setState({'formSuccess': true});
		}

		setTimeout(() => {
			this.setState({'modal': false, 'formSuccess': false, 'fields': {}});
			this.getCampaigns()
        }, 3000);
	}

	campaignSubmit = (e) => {
		e.preventDefault();

		if(this.handleValidation()){
			this.state.fields["is_active"] = true;
			const body = JSON.stringify(this.state.fields)
			var extra_data = {"clean_results": true};
			postRequest(CAMPAIGN_URL, body, this.campaignSubmitResponse, "POST", authHeaders, extra_data);
		}else{
			this.setState({'formSuccess': false});
		}
	}

	toggle = () => {
		this.setState(prevState => ({
			modal: !prevState.modal,
			fields: {}
		}));
	}

	submitRow = (e) => {
		e.preventDefault();

		if(this.handleValidation()){
			const body = JSON.stringify(this.state.fields)
			var url = CAMPAIGN_URL + this.state.fields.id + "/";
			var extra_data = {"clean_results": true};
			putRequest(url, body, this.campaignUpdateResponse, "PUT", authHeaders, extra_data);
		}
	}

	campaignUpdateResponse = (data, extra_data) => {
		notify("Campaign Updated successfully")
		let dataindex = data.body.id;
		let rows = this.state.rows;
		rows[dataindex] = false;
		if(extra_data.clean_results) {
			this.setState({rows: rows, results: [], loading: true, fields: {}});
		} else {
			this.setState({rows: rows});
		}
		this.getCampaigns();
	}

	editRow = (e) => {
		let index = e.target.getAttribute('index');
		let dataindex = e.target.getAttribute('data-id');
		let rows = this.state.rows;
		let fields = this.state.results[index]
		rows[dataindex] = true
		this.setState({rows, fields});
	}

	cancelRow = (e) => {
		let index = e.target.getAttribute('index');
		let dataindex = e.target.getAttribute('data-id');
		let rows = this.state.rows;
		rows[dataindex] = false
		this.setState({rows});
	}

	deleteCampaignResponse = (data) => {
		this.setState({results: [], loading: true})
		this.getCampaigns();
		notify(data.body.Msg)
	}

	deleteRow = (e) => {
		let dataindex = e.target.getAttribute('data-id');
		let findrow = document.body.querySelector('[data-row="'+dataindex+'"]');
		let url = CAMPAIGN_URL + dataindex + "/";
		deleteRequest(url, this.deleteCampaignResponse, authHeaders)
	}

	getCampaigns = () => {
		var url = CAMPAIGN_URL;
		getRequest(url, this.getCampaignsData, authHeaders);
	}

	getCampaignsData = (data) => {
		if(!Array.isArray(data.body)){
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
			page : this.state.page + 1
		})
		getRequest(this.state.next, this.getCampaignsData, authHeaders);
	}

	handleScroll = () => {
		if ($(window).scrollTop() == $(document).height() - $(window).height()) {
			if (!this.state.loading && this.state.next){
				this.getNext();
			}
		}
	}

	isSideBarToogle = (data) => {
		if(data === true){
			this.setState({ isSideOpen: true })
			cookies.set('isSideOpen', true, { path: '/' });
		} else {
			this.setState({ isSideOpen: false })
			cookies.remove('isSideOpen', { path: '/' });
		}
	}

	componentDidMount() {
		window.addEventListener('scroll', this.handleScroll, true);
		this.getCampaigns()
		if(cookies.get('isSideOpen')){
			this.setState({ isSideOpen: true })
		} else {
			this.setState({ isSideOpen: false })
		}
	}

	componentWillUnmount = () => {
		window.removeEventListener('scroll', this.handleScroll)
	}

	render(){
		var { menus, isSideOpen, username } = this.state
		
		let result_array = this.state.results
		let results = []

		result_array.map((el, index) => {
			var start_date = moment(el.start_date).format('YYYY-MM-DD m:ss A');
			var end_date = moment(el.end_date).format('YYYY-MM-DD m:ss A');

			var data = <tr key={index} data-row={el.id}>
				<th scope="row">{index+1}</th>
				<td>
					{this.state.rows[el.id] ?
						<React.Fragment>
							<input refs="name" type="text" name="name" className="form-control" placeholder="Campaign Name" id="name" onChange={(e) => this.handleChange("name", e)} defaultValue={el.name} />
							<FormText color="danger">{this.state.errors["name"]}</FormText>
						</React.Fragment>
					:
						<span>{el.name}</span>
					}
				</td>
				<td>
					{this.state.rows[el.id] ?
						<React.Fragment>
							<input refs="daily_budget" type="text" name="daily_budget" className="form-control" placeholder="Daily Budget" id="daily_budget" onChange={(e) => this.handleChange("daily_budget", e)} defaultValue={el.daily_budget} />
							<FormText color="danger">{this.state.errors["daily_budget"]}</FormText>
						</React.Fragment>
					:
						<span>{el.daily_budget}</span>
					}
				</td>
				<td>
					{this.state.rows[el.id] ?
						<React.Fragment>
							<input refs="max_bid" type="text" name="max_bid" className="form-control" placeholder="Max Bid" id="max_bid" onChange={(e) => this.handleChange("max_bid", e)} defaultValue={el.max_bid} />
							<FormText color="danger">{this.state.errors["max_bid"]}</FormText>
						</React.Fragment>
					:
						<span>{el.max_bid}</span>
					}
				</td>
				<td>
					{this.state.rows[el.id] ?
						<React.Fragment>
							<Datetime refs="start_date" defaultValue={start_date} dateFormat="YYYY-MM-DD" timeFormat={true} placeholder="YYYY-MM-DD" id="start_date" onChange={(e) => this.handleChange("start_date", e)} />
							<FormText color="danger">{this.state.errors["start_date"]}</FormText>
						</React.Fragment>
					:
						<span>{start_date}</span>
					}
				</td>
				<td>
					{this.state.rows[el.id] ?
						<React.Fragment>
							<Datetime refs="end_date" defaultValue={end_date} dateFormat="YYYY-MM-DD" timeFormat={true} placeholder="YYYY-MM-DD" id="end_date" onChange={(e) => this.handleChange("end_date", e)} />
							<FormText color="danger">{this.state.errors["end_date"]}</FormText>
						</React.Fragment>
					:
						<span>{end_date}</span>
					}
				</td>
				{this.state.rows[el.id] ?
					<td><input type="checkbox" name="is_active" checked={el.is_active} onChange={(e) => this.handleChange("is_active", e)} /></td>
				:
					<td className="text-success">{el.is_active ? "Active" : ""}</td>
				}
				<td>
					<ul className="list-inline m-0">
						{this.state.rows[el.id] ?
							<React.Fragment>
								<li className="list-inline-item btn btn-sm btn-success" data-id={el.id} onClick={this.submitRow}>Save
								</li>
								<li className="list-inline-item btn btn-sm btn-danger" index={index} data-id={el.id} onClick={this.cancelRow}>Cancel</li>
							</React.Fragment>
						:
							<React.Fragment>
								<li className="list-inline-item btn btn-sm btn-warning" index={index} data-id={el.id} onClick={this.editRow}>Edit</li>
								<li className="list-inline-item btn btn-sm btn-danger" data-id={el.id} onClick={this.deleteRow}>Delete</li>
							</React.Fragment>
						}
					</ul>
				</td>
			</tr>
			results.push(data);
		})

		return(
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
						username={username} />
					<div className="container-fluid">
						<div className="row">
							<SideBar menuitems={config_data.dashboardmenu} class={isSideOpen} domain="dashboard" />
							<div className={`main-content ${isSideOpen ? 'offset-lg-2 col-lg-10' : 'col-lg-12'}`}>
								<div className="pt-50 mb-3">
									<h1 className="h2">Campaigns</h1>
									<div className="clearfix">
										<div className="float-left">
											<Button color="success" size="md" onClick={this.toggle}>Add new</Button>
										</div>
										<div className="float-right">
											<Form>
												<Input type="text" name="query" className="form-control" placeholder="search" onChange={this.handleQueryChange} value={this.state.q} onKeyPress={event => {this.handleKeyPress(event)} }/>
											</Form>
										</div>
									</div>
								</div>
								<hr/>
								<div className="my-5">
									<h5 className="text-info">Total {this.state.results.length} Campaigns</h5>
									<Table striped id="campaign-table">
										<thead>
											<tr>
												<th style={{width:"5%"}}>#</th>
												<th style={{width:"17%"}}>Name</th>
												<th style={{width:"12%"}}>Daily Budget</th>
												<th style={{width:"12%"}}>Max Bid</th>
												<th style={{width:"17%"}}>Start Date</th>
												<th style={{width:"17%"}}>End Date</th>
												<th style={{width:"10%"}}>Status</th>
												<th style={{width:"10%"}}></th>
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
						<ModalHeader toggle={this.toggle}>Add new campaign</ModalHeader>
						<ModalBody>
							<Form>
								<FormGroup>
									<Label for="name">Campaign Name</Label>
									<input refs="name" type="text" name="name" className="form-control" placeholder="Campaign Name" id="name" onChange={(e) => this.handleChange("name", e)} value={this.state.fields["name"]} />
									<FormText color="danger">{this.state.errors["name"]}</FormText>
								</FormGroup>
								<Row form>
									<Col md={6}>
										<FormGroup>
											<Label for="daily_budget">Daily Budget</Label>
											<input refs="daily_budget" type="text" name="daily_budget" className="form-control" placeholder="Daily Budget" id="daily_budget" onChange={(e) => this.handleChange("daily_budget", e)} value={this.state.fields["daily_budget"]} />
											<FormText color="danger">{this.state.errors["daily_budget"]}</FormText>
										</FormGroup>
									</Col>
									<Col md={6}>
										<FormGroup>
											<Label for="max_bid">Max Bid</Label>
											<input refs="max_bid" type="text" name="max_bid" className="form-control" placeholder="Max Bid" id="max_bid" onChange={(e) => this.handleChange("max_bid", e)} value={this.state.fields["max_bid"]} />
											<FormText color="danger">{this.state.errors["max_bid"]}</FormText>
										</FormGroup>
									</Col>
								</Row>
								<Row form>
									<Col md={6}>
										<FormGroup>
											<Label for="start_date">Start Date</Label>
											<Datetime refs="start_date" value={this.state.fields["start_date"]} dateFormat="YYYY-MM-DD" timeFormat={true} placeholder="YYYY-MM-DD" id="start_date" onChange={(e) => this.handleChange("start_date", e)} />
											<FormText color="danger">{this.state.errors["start_date"]}</FormText>
										</FormGroup>
									</Col>
									<Col md={6}>
										<FormGroup>
											<Label for="end_date">End Date</Label>
											<Datetime refs="end_date" value={this.state.fields["end_date"]} dateFormat="YYYY-MM-DD" timeFormat={true} placeholder="YYYY-MM-DD" id="end_date" onChange={(e) => this.handleChange("end_date", e)} />
											<FormText color="danger">{this.state.errors["end_date"]}</FormText>
										</FormGroup>
									</Col>
								</Row>
							</Form>
						</ModalBody>
						<ModalFooter>
							<div className="clearfix" style={{width:"100%"}}>
								<div className="float-left">
									{this.state.formSuccess ?
										<h6 className="text-success m-0">Form submitted successfully.</h6>
									: ""}
								</div>
								<div className="float-right">
									<Button color="success" onClick={this.campaignSubmit} type="button">Submit</Button>&nbsp;&nbsp;
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

export default Campaign;

ReactDOM.render(<Campaign />, document.getElementById('root'));
serviceWorker.unregister();
