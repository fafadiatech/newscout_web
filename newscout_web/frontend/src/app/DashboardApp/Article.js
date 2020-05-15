import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import Cookies from 'universal-cookie';
import logo from '../NewsApp/logo.png';
import { ToastContainer } from 'react-toastify';
import { Menu, SideBar, Footer } from 'newscout';
import * as serviceWorker from './serviceWorker';
import { ARTICLE_LIST_URL, ARTICLE_STATUS_URL } from '../../utils/Constants';
import DashboardMenu from '../../components/DashboardMenu';
import DashboardHeader from '../../components/DashboardHeader';
import { getRequest, postRequest, authHeaders } from '../../utils/Utils';
import { Button, Form, Input, Row, Col, Table } from 'reactstrap';

import './index.css';
import config_data from '../NewsApp/config.json';

import 'newscout/assets/Menu.css'
import 'newscout/assets/Sidebar.css'

const cookies = new Cookies();

class Article extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			results: [],
			page: 0,
			next: null,
			previous: null,
			loading: false,
			q: "",
			articleUpdateId: "",
			isSideOpen: true,
			isChecked: false,
			username: USERNAME,
			isChecked: false,
		};
	}

	getArticles = () => {
		var url = ARTICLE_LIST_URL;
		getRequest(url, this.setArticleData, authHeaders);
	}

	getNext = () => {
		this.setState({
			loading: true,
			page: this.state.page + 1
		})
		getRequest(this.state.next, this.setArticleData, authHeaders);
	}

	setArticleData = (data) => {
		if (!data.errors) {
			var results = [
				...this.state.results,
				...data.body.results
			]
			var next = data.body.next
			var previous = data.body.previous
		} else {
			var results = this.state.results
			var next = 0
			var previous = 0
		}
		this.setState({
			results: results,
			next: next,
			previous: previous,
			loading: false
		})
	}

	redirectArticleForm = () => {
		window.location.href = "/dashboard/article/create/";
	}

	handleScroll = () => {
		if ($(window).scrollTop() == $(document).height() - $(window).height()) {
			if (!this.state.loading && this.state.next) {
				this.getNext();
			}
		}
	}

	handleChange = (event) => {
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
			var url = ARTICLE_LIST_URL + "?q=" + this.state.q;
			getRequest(url, this.setArticleData, authHeaders);
		}
	}

	articleStatus = (event) => {
		var _id = event.currentTarget.dataset.id;
		var status = event.currentTarget.dataset.status;
		if (status === "activate") {
			var active = true;
		} else {
			var active = false;
		}
		var post_data = { "id": _id, "activate": active }
		var body = JSON.stringify(post_data)
		postRequest(ARTICLE_STATUS_URL, body, this.handleArticleStatus, "POST", authHeaders);
	}

	handleArticleStatus = (data) => {
		var results = this.state.results;
		var new_results = []
		results.map((el, index) => {
			if (el.id == data.body.id) {
				el.active = data.body.active
			}
			new_results.push(el)
		})
		this.setState({
			articleUpdateId: data.body.id,
			results: new_results
		});
		setTimeout(() => {
			this.setState({
				articleUpdateId: ""
			});
		}, 3000);
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
		this.getArticles();
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
		var { menus, isSideOpen, isChecked, username, isChecked } = this.state

		let result_array = this.state.results
		let results = []

		result_array.map((el, index) => {
			var published_on = moment(el.published_on).format('YYYY-MM-DD m:ss A');

			var data = <tr key={index} data-row={el.id}>
				<th scope="row">{index + 1}</th>

				<td>
					<span>{el.title}</span>
				</td>
				<td>
					<span>{published_on}</span>
				</td>
				{el.active ?
					<td className="text-success">Active</td>
					:
					<td className="text-danger">Not Active</td>
				}
				<td>
					<ul className="list-inline m-0">
						<React.Fragment>
							<li className="list-inline-item" index={index} data-id={el.id} ><a href={'/dashboard/article/edit/' + el.slug + '/'} className=" btn btn-sm btn-warning">Edit</a></li>
							{
								el.active ?
									<li className="list-inline-item btn btn-sm btn-danger" data-id={el.id} data-status=
										"deactivate" onClick={this.articleStatus}>Deactivate</li>
									:
									<li className="list-inline-item btn btn-sm btn-success" data-id={el.id} onClick={this.articleStatus} data-status="activate">Activate</li>
							}
							{
								el.id == this.state.articleUpdateId ?
									<div>
										<p className="text-success mt-2">Article Updated successfully</p>
									</div>
									:
									""
							}
						</React.Fragment>
					</ul>
				</td>
			</tr>
			results.push(data);
		})

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
									<h1 className="h2">Articles</h1>
									<div className="clearfix">
										<div className="float-left">
											<Button color="success" size="md" onClick={this.redirectArticleForm}>Add new</Button>
										</div>
										<div className="float-right">
											<Form>
												<Input type="text" name="query" className="form-control" placeholder="search" onChange={this.handleChange} value={this.state.q} onKeyPress={event => { this.handleKeyPress(event) }} />
											</Form>
										</div>
									</div>
								</div>
								<hr />
								<div className="my-5">
									<h5 className="text-info">Total {this.state.results.length} Articles</h5>
									<Table striped id="campaign-table">
										<thead>
											<tr>
												<th style={{ width: "5%" }}>#</th>
												<th style={{ width: "17%" }}>Title</th>
												<th style={{ width: "12%" }}>Published On</th>
												<th style={{ width: "12%" }}>Status</th>
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

export default Article;

ReactDOM.render(<Article />, document.getElementById('root'));
serviceWorker.unregister();
