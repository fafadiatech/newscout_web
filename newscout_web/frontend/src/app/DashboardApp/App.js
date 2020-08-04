import React from 'react';
import Datetime from 'react-datetime';
import logo from '../NewsApp/logo.png';
import Cookies from 'universal-cookie';
import { getRequest, authHeaders } from '../../utils/Utils';
import { Menu, SideBar, Footer } from 'newscout';
import { Button, FormGroup, Label, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

import AllArticlesOpenGraph from '../../components/AllArticlesOpenGraph';
import ArticlesPerAuthorGraph from '../../components/ArticlesPerAuthorGraph';
import ArticlesPerPlatformGraph from '../../components/ArticlesPerPlatformGraph';
import ArticlesPerCategoryGraph from '../../components/ArticlesPerCategoryGraph';
import InteractionsPerCategoryGraph from '../../components/InteractionsPerCategoryGraph';
import InteractionsPerAuthorGraph from '../../components/InteractionsPerAuthorGraph';
import ArticlesPerSessionGraph from '../../components/ArticlesPerSessionGraph';
import InteractionsPerSessionGraph from '../../components/InteractionsPerSessionGraph';
import {
	ANALYTICS_ALLARTICLESOPEN_URL, ANALYTICS_ARTICLESPERPLATFORM_URL,
	ANALYTICS_ARTICLESPERCATEGORY_URL,
	ANALYTICS_INTERACTIONSPERCATEGORY_URL,
	ANALYTICS_ARTICLESPERAUTHOR_URL,
	ANALYTICS_INTERACTIONSPERAUTHOR_URL,
	ANALYTICS_ARTICLESPERSESSION_URL,
	ANALYTICS_INTERACTIONSPERSESSION_URL
} from '../../utils/Constants';

import config_data from '../NewsApp/config.json';

import 'newscout/assets/Menu.css'
import 'newscout/assets/Sidebar.css'

const cookies = new Cookies();

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			AllArticlesOpenData: [],
			AllArticlesOpenNoData: false,
			AllArticlesOpenLoading: true,
			ArticlesPerPlatformData: [],
			ArticlesPerPlatformNoData: false,
			ArticlesPerPlatformLoading: false,
			ArticlesPerCategoryData: [],
			ArticlesPerCategoryNoData: false,
			ArticlesPerCategoryLoading: true,
			InteractionsPerCategoryData: [],
			InteractionsPerCategoryNoData: false,
			InteractionsPerCategoryLoading: true,
			ArticlesPerAuthorData: [],
			ArticlesPerAuthorNoData: false,
			ArticlesPerAuthorLoading: true,
			InteractionsPerAuthorData: [],
			InteractionsPerAuthorNoData: false,
			InteractionsPerAuthorLoading: true,
			ArticlesPerSessionData: [],
			ArticlesPerSessionNoData: false,
			ArticlesPerSessionLoading: true,
			InteractionsPerSessionData: [],
			InteractionsPerSessionNoData: false,
			InteractionsPerSessionLoading: true,
			dropdownOpen: false,
			custom: false,
			selectedValue: "",
			disabled: true,
			start_date: "",
			end_date: "",
			date_err: "",
			AllArticlesOpenAvgCount: 0,
			ArticlesPerPlatformAvgCount: 0,
			ArticlesPerCategoryAvgCount: 0,
			InteractionsPerCategoryAvgCount: 0,
			ArticlesPerAuthorAvgCount: 0,
			InteractionsPerAuthorAvgCount: 0,
			ArticlesPerSessionAvgCount: 0,
			InteractionsPerSessionAvgCount: 0,
			isSideOpen: true,
			username: USERNAME,
			isChecked: false,
			active_page: ACTIVE_PAGE
		};
	}

	SetResponseData = (data, extraData) => {
		if (extraData.loading == "AllArticlesOpenLoading") {
			var key = "AllArticlesOpenLoading";
			var DataKey = "AllArticlesOpenData";
			var NoDataKey = "AllArticlesOpenNoData";
			var AvgCountKey = "AllArticlesOpenAvgCount";
			var DiffKey = "AllArticleOpenDiff";
			var DiffColor = "AllArticleColor";
		} else if (extraData.loading == "ArticlesPerPlatformLoading") {
			var key = "ArticlesPerPlatformLoading";
			var DataKey = "ArticlesPerPlatformData";
			var NoDataKey = "ArticlesPerPlatformNoData";
			var AvgCountKey = "ArticlesPerPlatformAvgCount";
			var DiffKey = "ArticlesPerPlatformOpenDiff";
			var DiffColor = "ArticlesPerPlatformColor";
		} else if (extraData.loading == "ArticlesPerCategoryLoading") {
			var key = "ArticlesPerCategoryLoading";
			var DataKey = "ArticlesPerCategoryData";
			var NoDataKey = "ArticlesPerCategoryNoData";
			var AvgCountKey = "ArticlesPerCategoryAvgCount";
			var DiffKey = "ArticlesPerCategoryOpenDiff";
			var DiffColor = "ArticlesPerCategoryColor";
		} else if (extraData.loading == "InteractionsPerCategoryLoading") {
			var key = "InteractionsPerCategoryLoading";
			var DataKey = "InteractionsPerCategoryData";
			var NoDataKey = "InteractionsPerCategoryNoData";
			var AvgCountKey = "InteractionsPerCategoryAvgCount";
			var DiffKey = "InteractionsPerCategoryOpenDiff";
			var DiffColor = "InteractionsPerCategoryColor";
		} else if (extraData.loading == "ArticlesPerAuthorLoading") {
			var key = "ArticlesPerAuthorLoading";
			var DataKey = "ArticlesPerAuthorData";
			var NoDataKey = "ArticlesPerAuthorNoData";
			var AvgCountKey = "ArticlesPerAuthorAvgCount";
			var DiffKey = "ArticlesPerAuthorOpenDiff";
			var DiffColor = "ArticlesPerAuthorColor";
		} else if (extraData.loading == "InteractionsPerAuthorLoading") {
			var key = "InteractionsPerAuthorLoading";
			var DataKey = "InteractionsPerAuthorData";
			var NoDataKey = "InteractionsPerAuthorNoData";
			var AvgCountKey = "InteractionsPerAuthorAvgCount";
			var DiffKey = "InteractionsPerAuthorOpenDiff";
			var DiffColor = "InteractionsPerAuthorColor";
		} else if (extraData.loading == "ArticlesPerSessionLoading") {
			var key = "ArticlesPerSessionLoading";
			var DataKey = "ArticlesPerSessionData";
			var NoDataKey = "ArticlesPerSessionNoData";
			var AvgCountKey = "ArticlesPerSessionAvgCount";
			var DiffKey = "ArticlesPerSessionOpenDiff";
			var DiffColor = "ArticlesPerSessionColor";
		} else if (extraData.loading == "InteractionsPerSessionLoading") {
			var key = "InteractionsPerSessionLoading";
			var DataKey = "InteractionsPerSessionData";
			var NoDataKey = "InteractionsPerSessionNoData";
			var AvgCountKey = "InteractionsPerSessionAvgCount";
			var DiffKey = "InteractionsPerSessionOpenDiff";
			var DiffColor = "InteractionsPerSessionColor";
		}
		var state = this.state;
		state[key] = false
		state[DataKey] = data.body.result;
		state[NoDataKey] = data.body.no_data;
		state[AvgCountKey] = data.body.avg_count;
		state[DiffKey] = data.body.diff;
		if (data.body.diff > 0) {
			state[DiffColor] = "text-success";
		} else if (data.body.diff < 0) {
			state[DiffColor] = "text-danger";
		}
		this.setState(state);
	}

	GetAllArticlesOpenData = (url) => {
		var URL = url || ANALYTICS_ALLARTICLESOPEN_URL;
		var extraData = { "loading": "AllArticlesOpenLoading" }
		getRequest(URL, this.SetResponseData, authHeaders, extraData);
	}

	GetArticlesPerPlatformData = (url) => {
		var URL = url || ANALYTICS_ARTICLESPERPLATFORM_URL;
		var extraData = { "loading": "ArticlesPerPlatformLoading" }
		getRequest(URL, this.SetResponseData, authHeaders, extraData);
	}

	GetArticlesPerCategoryData = (url) => {
		var URL = url || ANALYTICS_ARTICLESPERCATEGORY_URL;
		var extraData = { "loading": "ArticlesPerCategoryLoading" }
		getRequest(URL, this.SetResponseData, authHeaders, extraData);
	}

	GetInteractionsPerCategoryData = (url) => {
		var URL = url || ANALYTICS_INTERACTIONSPERCATEGORY_URL;
		var extraData = { "loading": "InteractionsPerCategoryLoading" }
		getRequest(URL, this.SetResponseData, authHeaders, extraData);
	}

	GetArticlesPerAuthorData = (url) => {
		var URL = url || ANALYTICS_ARTICLESPERAUTHOR_URL;
		var extraData = { "loading": "ArticlesPerAuthorLoading" }
		getRequest(URL, this.SetResponseData, authHeaders, extraData);
	}

	GetInteractionsPerAuthorData = (url) => {
		var URL = url || ANALYTICS_INTERACTIONSPERAUTHOR_URL;
		var extraData = { "loading": "InteractionsPerAuthorLoading" }
		getRequest(URL, this.SetResponseData, authHeaders, extraData);
	}

	GetArticlesPerSessionData = (url) => {
		var URL = url || ANALYTICS_ARTICLESPERSESSION_URL;
		var extraData = { "loading": "ArticlesPerSessionLoading" }
		getRequest(URL, this.SetResponseData, authHeaders, extraData);
	}

	GetInteractionsPerSessionData = (url) => {
		var URL = url || ANALYTICS_INTERACTIONSPERSESSION_URL;
		var extraData = { "loading": "InteractionsPerSessionLoading" }
		getRequest(URL, this.SetResponseData, authHeaders, extraData);
	}

	toggle = () => {
		this.setState({
			dropdownOpen: !this.state.dropdownOpen
		})
	}

	onChangeSelect = (e) => {
		var selectedValue = e.target.value;
		var state = this.state;
		state.selectedValue = selectedValue;
		state.disabled = false;
		if (selectedValue == "custom") {
			state.custom = true
		} else {
			state.custom = false
		}
		this.setState(state);
	}

	handleSubmitBtn = () => {
		var state = this.state;
		state.disabled = true;
		state.AllArticlesOpenLoading = true;
		state.ArticlesPerPlatformLoading = true;
		state.ArticlesPerCategoryLoading = true;
		state.InteractionsPerCategoryLoading = true;
		state.ArticlesPerAuthorLoading = true;
		state.InteractionsPerAuthorLoading = true;
		state.ArticlesPerSessionLoading = true;
		state.InteractionsPerSessionLoading = true;
		this.setState(state);
		if (state.selectedValue === "custom") {
			var start_date = this.state.start_date.format('MM/DD/YYYY HH:mm:ss');
			var end_date = this.state.end_date.format('MM/DD/YYYY HH:mm:ss');
			var date_range = "?date_range=" + start_date + "-" + end_date;
		} else {
			var date_range = "?date_range=" + state.selectedValue;
		}

		var FILTER_ANALYTICS_ALLARTICLESOPEN_URL = ANALYTICS_ALLARTICLESOPEN_URL + date_range;
		var FILTER_ANALYTICS_ARTICLESPERPLATFORM_URL = ANALYTICS_ARTICLESPERPLATFORM_URL + date_range;
		var FILTER_ANALYTICS_ARTICLESPERCATEGORY_URL = ANALYTICS_ARTICLESPERCATEGORY_URL + date_range;
		var FILTER_ANALYTICS_INTERACTIONSPERCATEGORY_URL = ANALYTICS_INTERACTIONSPERCATEGORY_URL + date_range;
		var FILTER_ANALYTICS_ARTICLESPERAUTHOR_URL = ANALYTICS_ARTICLESPERAUTHOR_URL + date_range;
		var FILTER_ANALYTICS_INTERACTIONSPERAUTHOR_URL = ANALYTICS_INTERACTIONSPERAUTHOR_URL + date_range;
		var FILTER_ANALYTICS_ARTICLESPERSESSION_URL = ANALYTICS_ARTICLESPERSESSION_URL + date_range;
		var FILTER_ANALYTICS_INTERACTIONSPERSESSION_URL = ANALYTICS_INTERACTIONSPERSESSION_URL + date_range;
		this.GetAllArticlesOpenData(FILTER_ANALYTICS_ALLARTICLESOPEN_URL);
		this.GetArticlesPerPlatformData(FILTER_ANALYTICS_ARTICLESPERPLATFORM_URL);
		this.GetArticlesPerCategoryData(FILTER_ANALYTICS_ARTICLESPERCATEGORY_URL);
		this.GetInteractionsPerCategoryData(FILTER_ANALYTICS_INTERACTIONSPERCATEGORY_URL);
		this.GetArticlesPerAuthorData(FILTER_ANALYTICS_ARTICLESPERAUTHOR_URL);
		this.GetInteractionsPerAuthorData(FILTER_ANALYTICS_INTERACTIONSPERAUTHOR_URL);
		this.GetArticlesPerSessionData(FILTER_ANALYTICS_ARTICLESPERSESSION_URL);
		this.GetInteractionsPerSessionData(FILTER_ANALYTICS_INTERACTIONSPERSESSION_URL);
	}

	isValidDate = (current) => {
		var d = new Date();
		if (current > d) {
			return false;
		} return true;
	}

	onDateChange = (selected_date, date_str) => {
		var state = this.state;
		if (date_str === "start_date") {
			state.start_date = selected_date
		} else {
			state.end_date = selected_date
		}
		if (state.start_date && state.end_date && state.start_date > state.end_date) {
			state.date_err = "Invalid date selection"
			state.disabled = true
		} else if (state.start_date && state.end_date && state.end_date > new Date()) {
			state.date_err = "Invalid date selection"
			state.disabled = true
		} else {
			state.date_err = ""
			state.disabled = false
		}
		this.setState(state)
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
		this.GetAllArticlesOpenData()
		this.GetArticlesPerPlatformData()
		this.GetArticlesPerCategoryData()
		this.GetInteractionsPerCategoryData()
		this.GetArticlesPerAuthorData()
		this.GetInteractionsPerAuthorData()
		this.GetArticlesPerSessionData()
		this.GetInteractionsPerSessionData()
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
	
	render() {
		var { menus, isSideOpen, username, isChecked, active_page } = this.state
		return (
			<div className="App">
				<Menu
					logo={logo}
					navitems={config_data.dashboardmenu}
					isSlider={true}
					isSideBarToogle={this.isSideBarToogle}
					isSideOpen={isSideOpen}
					domain="dashboard"
					username={username}
					toggleSwitch={this.toggleSwitch}
					isChecked={isChecked}
				/>
				<div className="container-fluid">
					<div className="row">
						<SideBar menuitems={config_data.dashboardmenu} class={isSideOpen} domain="dashboard" isChecked={isChecked} active_page={active_page} />
						<div className={`main-content ${isSideOpen ? 'offset-lg-2 col-lg-10' : 'col-lg-12'}`}>

							<div className="row pt-50">
								<div className="col-md-4">
									<FormGroup>
										<Label for="date_range">Select Date Range</Label>
										<Input type="select" name="date_range" id="date_range" onChange={(e) => this.onChangeSelect(e)}>
											<option value="today">Today</option>
											<option value="yesterday">Yesterday</option>
											<option value="7days">Last 7 Days</option>
											<option value="30days" selected>Last 30 Days</option>
											<option value="last_month">Last Month</option>
											<option value="custom">Custom</option>
										</Input>
									</FormGroup>
								</div>
								{this.state.custom ?
									<div className="col-md-4">
										<FormGroup>
											<Label for="" className="d-block">Start Date</Label>
											<Datetime value={this.state.start_date} isValidDate={this.isValidDate} onChange={(e) => this.onDateChange(e, "start_date")} />
										</FormGroup>
										<FormGroup>
											<Label for="" className="d-block">End Date</Label>
											<Datetime value={this.state.end_date} isValidDate={this.isValidDate} onChange={(e) => this.onDateChange(e, "end_date")} />
											<p className="text-danger">{this.state.date_err}</p>
										</FormGroup>
									</div>
									:
									""
								}
								<div className="col-md-4">
									<Label for="" className="d-block text-transparent">Select Date Range</Label>
									<Button color="danger" onClick={this.handleSubmitBtn} disabled={this.state.disabled}>Submit</Button>
								</div>
							</div>
							
							<div className="accordion mt-4" id="average-cards">
								<div className="card mb-4 avg-article-per-category">
									<div className="card-header" id="headingOne" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
										<div className="row">
											<div className="col-lg-4">
												<h6 className="m-0 mt-2 font-weight-bold">Average Articles Per Category</h6>
											</div>
											<div className="col-lg-4">
												<div className="skewed-bg">
													<h3 className="text-center mb-0">{this.state.ArticlesPerCategoryAvgCount}&nbsp;<span className={`sm-data ${this.state.ArticlesPerCategoryColor}`} style={{ fontSize: '40%' }}>{this.state.ArticlesPerCategoryOpenDiff}</span></h3>
												</div>
											</div>
											<div className="col-lg-4 text-right mt-2">
												<FontAwesomeIcon icon={faChevronDown} />
											</div>
										</div>
									</div>
									<div id="collapseOne" className="collapse show" aria-labelledby="headingOne" data-parent="#average-cards">
										<div className="card-body">
											<ArticlesPerCategoryGraph data={this.state.ArticlesPerCategoryData} loading={this.state.ArticlesPerCategoryLoading} no_data={this.state.ArticlesPerCategoryNoData} />
										</div>
									</div>
								</div>

								<div className="card mb-4 avg-article-open">
									<div className="card-header" id="headingTwo" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
										<div className="row">
											<div className="col-lg-4">
												<h6 className="m-0 mt-2 font-weight-bold">Average Articles Open</h6>
											</div>
											<div className="col-lg-4">
												<div className="skewed-bg">
													<h3 className="text-center mb-0">{this.state.AllArticlesOpenAvgCount}&nbsp;<span className={`sm-data ${this.state.AllArticleColor}`} style={{ fontSize: '40%' }}>{this.state.AllArticleOpenDiff}</span></h3>
												</div>
											</div>
											<div className="col-lg-4 text-right mt-2">
												<FontAwesomeIcon icon={faChevronDown} />
											</div>
										</div>
									</div>

									<div id="collapseTwo" className="collapse" aria-labelledby="headingTwo" data-parent="#average-cards">
										<div className="card-body">
											<AllArticlesOpenGraph data={this.state.AllArticlesOpenData} loading={this.state.AllArticlesOpenLoading} no_data={this.state.AllArticlesOpenNoData} />
										</div>
									</div>
								</div>
								
								<div className="card mb-4 avg-article-per-platform">
									<div className="card-header" id="headingThree" data-toggle="collapse" data-target="#collapseThree" aria-expanded="true" aria-controls="collapseThree">
										<div className="row">
											<div className="col-lg-4">
												<h6 className="m-0 mt-2 font-weight-bold">Average Articles Per Platform</h6>
											</div>
											<div className="col-lg-4">
												<div className="skewed-bg">
													<h3 className="text-center mb-0">{this.state.ArticlesPerPlatformAvgCount}&nbsp;<span className={`sm-data ${this.state.ArticlesPerPlatformColor}`} style={{ fontSize: '40%' }}>{this.state.ArticlesPerPlatformOpenDiff}</span></h3>
												</div>
											</div>
											<div className="col-lg-4 text-right mt-2">
												<FontAwesomeIcon icon={faChevronDown} />
											</div>
										</div>
									</div>

									<div id="collapseThree" className="collapse" aria-labelledby="headingThree" data-parent="#average-cards">
										<div className="card-body">
											<ArticlesPerPlatformGraph data={this.state.ArticlesPerPlatformData} loading={this.state.ArticlesPerPlatformLoading} no_data={this.state.ArticlesPerPlatformNoData} />
										</div>
									</div>
								</div>

								<div className="card mb-4 avg-interactions-per-category">
									<div className="card-header" id="headingFour" data-toggle="collapse" data-target="#collapseFour" aria-expanded="true" aria-controls="collapseFour">
										<div className="row">
											<div className="col-lg-4">
												<h6 className="m-0 mt-2 font-weight-bold">Average Interactions Per Category</h6>
											</div>
											<div className="col-lg-4">
												<div className="skewed-bg">
													<h3 className="text-center mb-0">{this.state.InteractionsPerCategoryAvgCount}&nbsp;<span className={`sm-data ${this.state.InteractionsPerCategoryColor}`} style={{ fontSize: '40%' }}>{this.state.InteractionsPerCategoryOpenDiff}</span></h3>
												</div>
											</div>
											<div className="col-lg-4 text-right mt-2">
												<FontAwesomeIcon icon={faChevronDown} />
											</div>
										</div>
									</div>

									<div id="collapseFour" className="collapse" aria-labelledby="headingFour" data-parent="#average-cards">
										<div className="card-body">
											<InteractionsPerCategoryGraph data={this.state.InteractionsPerCategoryData} loading={this.state.InteractionsPerCategoryLoading} no_data={this.state.InteractionsPerCategoryNoData} />
										</div>
									</div>
								</div>

								<div className="card mb-4 avg-interactions-per-session">
									<div className="card-header" id="headingFive" data-toggle="collapse" data-target="#collapseFive" aria-expanded="true" aria-controls="collapseFive">
										<div className="row">
											<div className="col-lg-4">
												<h6 className="m-0 mt-2 font-weight-bold">Average Interactions Per Session</h6>
											</div>
											<div className="col-lg-4">
												<div className="skewed-bg">
													<h3 className="text-center mb-0">{this.state.InteractionsPerSessionAvgCount}&nbsp;<span className={`sm-data ${this.state.InteractionsPerSessionColor}`} style={{ fontSize: '40%' }}>{this.state.InteractionsPerSessionOpenDiff}</span></h3>
												</div>
											</div>
											<div className="col-lg-4 text-right mt-2">
												<FontAwesomeIcon icon={faChevronDown} />
											</div>
										</div>
									</div>

									<div id="collapseFive" className="collapse" aria-labelledby="headingFive" data-parent="#average-cards">
										<div className="card-body">
											<InteractionsPerSessionGraph data={this.state.InteractionsPerSessionData} loading={this.state.InteractionsPerSessionLoading} no_data={this.state.InteractionsPerSessionNoData} />
										</div>
									</div>
								</div>

								<div className="card mb-4 avg-article-per-author">
									<div className="card-header" id="headingSix" data-toggle="collapse" data-target="#collapseSix" aria-expanded="true" aria-controls="collapseSix">
										<div className="row">
											<div className="col-lg-4">
												<h6 className="m-0 mt-2 font-weight-bold">Average Articles Per Author</h6>
											</div>
											<div className="col-lg-4">
												<div className="skewed-bg">
													<h3 className="text-center mb-0">{this.state.ArticlesPerAuthorAvgCount}&nbsp;<span className={`sm-data ${this.state.ArticlesPerAuthorColor}`} style={{ fontSize: '40%' }}>{this.state.ArticlesPerAuthorOpenDiff}</span></h3>
												</div>
											</div>
											<div className="col-lg-4 text-right mt-2">
												<FontAwesomeIcon icon={faChevronDown} />
											</div>
										</div>
									</div>

									<div id="collapseSix" className="collapse" aria-labelledby="headingSix" data-parent="#average-cards">
										<div className="card-body">
											<ArticlesPerAuthorGraph data={this.state.ArticlesPerAuthorData} loading={this.state.ArticlesPerAuthorLoading} no_data={this.state.ArticlesPerAuthorNoData} />
										</div>
									</div>
								</div>

								<div className="card mb-4 avg-interactions-per-author">
									<div className="card-header" id="headingSeven" data-toggle="collapse" data-target="#collapseSeven" aria-expanded="true" aria-controls="collapseSeven">
										<div className="row">
											<div className="col-lg-4">
												<h6 className="m-0 mt-2 font-weight-bold">Average Interactions Per Author</h6>
											</div>
											<div className="col-lg-4">
												<div className="skewed-bg">
													<h3 className="text-center mb-0">{this.state.InteractionsPerAuthorAvgCount}&nbsp;<span className={`sm-data ${this.state.InteractionsPerAuthorColor}`} style={{ fontSize: '40%' }}>{this.state.InteractionsPerAuthorOpenDiff}</span></h3>
												</div>
											</div>
											<div className="col-lg-4 text-right mt-2">
												<FontAwesomeIcon icon={faChevronDown} />
											</div>
										</div>
									</div>

									<div id="collapseSeven" className="collapse" aria-labelledby="headingSeven" data-parent="#average-cards">
										<div className="card-body">
											<InteractionsPerAuthorGraph data={this.state.InteractionsPerAuthorData} loading={this.state.InteractionsPerAuthorLoading} no_data={this.state.InteractionsPerAuthorNoData} />
										</div>
									</div>
								</div>

								<div className="card mb-4 avg-article-per-session">
									<div className="card-header" id="headingEight" data-toggle="collapse" data-target="#collapseEight" aria-expanded="true" aria-controls="collapseEight">
										<div className="row">
											<div className="col-lg-4">
												<h6 className="m-0 mt-2 font-weight-bold">Average Articles Per Session</h6>
											</div>
											<div className="col-lg-4">
												<div className="skewed-bg">
													<h3 className="text-center mb-0">{this.state.ArticlesPerSessionAvgCount}&nbsp;<span className={`sm-data ${this.state.ArticlesPerSessionColor}`} style={{ fontSize: '40%' }}>{this.state.ArticlesPerSessionOpenDiff}</span></h3>
												</div>
											</div>
											<div className="col-lg-4 text-right mt-2">
												<FontAwesomeIcon icon={faChevronDown} />
											</div>
										</div>
									</div>

									<div id="collapseEight" className="collapse" aria-labelledby="headingEight" data-parent="#average-cards">
										<div className="card-body">
											<ArticlesPerSessionGraph data={this.state.ArticlesPerSessionData} loading={this.state.ArticlesPerSessionLoading} no_data={this.state.ArticlesPerSessionNoData} />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<Footer privacyurl="#" facebookurl="#" twitterurl="#" />
			</div>
		);
	}
}

export default App;