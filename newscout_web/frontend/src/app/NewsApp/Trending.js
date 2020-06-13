import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import Cookies from 'universal-cookie';
import Skeleton from 'react-loading-skeleton';
import { CardItem, Menu, VerticleCardItem, SideBar, Footer, ToogleCard } from 'newscout';

import Auth from './Auth';

import './style.css';
import 'newscout/assets/Menu.css';
import 'newscout/assets/Sidebar.css';
import 'newscout/assets/CardItem.css';
import 'newscout/assets/ToogleCard.css'
import 'newscout/assets/ImageOverlay.css';

import { BASE_URL, MENUS, TRENDING_NEWS, ARTICLE_POSTS, ARTICLE_BOOKMARK, ALL_ARTICLE_BOOKMARK, ARTICLE_LOGOUT, SUGGESTIONS, EVENT_TRACK_URL, ACCESS_SESSION } from '../../utils/Constants';
import { getRequest, postRequest } from '../../utils/Utils';

import config_data from './config.json';

var article_array = [];
const URL = "/news/search/"
const cookies = new Cookies();

class Trending extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			page: 0,
			menus: [],
			next: null,
			trending: [],
			previous: null,
			loadingPagination: false,
			domain: "domain=" + DOMAIN,
			isLoading: true,
			isSideOpen: true,
			modal: false,
			is_loggedin: false,
			is_loggedin_validation: false,
			username: cookies.get('full_name'),
			bookmark_ids: [],
			isChecked: false,
			options: [],
			active_page: ACTIVE_PAGE,
		};
	}

	loggedInUser = (data) => {
		this.setState({
			username: data,
			is_loggedin: true
		})
	}

	toggle = (data) => {
		this.setState({
			modal: !data,
		})
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

	fetchArticleBookmark = (articleId) => {
		var headers = { "Authorization": "Token " + cookies.get('token'), "Content-Type": "application/json" }
		var url = ARTICLE_BOOKMARK + "?" + this.state.domain;
		var body = JSON.stringify({ article_id: articleId })
		postRequest(url, body, this.articleBookmarkResponse, "POST", headers)
	}

	articleBookmarkResponse = (data) => {
		var bookmark_obj = data.body.bookmark_article
		var index = article_array.findIndex(i => i.id === bookmark_obj.article.id);

		if (article_array.includes(bookmark_obj.article) === false && bookmark_obj.status === 1) {
			article_array.push(bookmark_obj.article)
		}

		if (article_array.some(item => item.id === bookmark_obj.article.id) && bookmark_obj.status === 0) {
			article_array.splice(index, 1);
		}
		this.setState({
			bookmark_ids: article_array
		})
	}

	getNext = () => {
		this.setState({
			loadingPagination: true,
			page: this.state.page + 1
		})
		getRequest(this.state.next, this.getTrending);
	}

	handleScroll = () => {
		if ($(window).scrollTop() >= ($(document).height() - $(window).height()) * 0.6) {
			if (!this.state.loadingPagination && this.state.next) {
				this.getNext();
			}
		}
	}

	getMenu = (data) => {
		var menus_array = []
		data.body.results.map((item, index) => {
			if (item.heading) {
				var heading_dict = {}
				heading_dict['itemtext'] = item.heading.name
				heading_dict['itemurl'] = "news/" + item.heading.name.replace(" ", "-").toLowerCase()
				heading_dict['item_id'] = item.heading.category_id
				heading_dict['item_icon'] = item.heading.icon
				menus_array.push(heading_dict)
			}
		})
		this.setState({
			menus: menus_array
		})
	}

	getTrending = (data) => {
		var trending_data = []
		var results = data.body.results.sort((a, b) =>
			new Date(a.created_at) - new Date(b.created_at)
		)

		results.map((item, index) => {
			if (item.articles) {
				var sorted_articles = item.articles.sort((a, b) =>
					new Date(b.published_on) - new Date(a.published_on)
				)
				trending_data.push(sorted_articles)
			}
		})

		var final_results = [
			...this.state.trending,
			...trending_data
		]
		this.setState({
			trending: final_results,
			next: data.body.next,
			previous: data.body.previous,
			loadingPagination: false
		})
		setTimeout(() => {
			this.setState({ isLoading: false })
		},1000)
	}

	getTrendingPosts = () => {
		getRequest(TRENDING_NEWS + "?" + this.state.domain, this.getTrending);
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

	getArticleId = (articleId) => {
		if (cookies.get('full_name')) {
			this.fetchArticleBookmark(articleId)
		} else {
			this.toggle()
		}
	}

	getBookmarksArticles = (data) => {
		var article_ids = data.body.results;
		for (var i = 0; i < article_ids.length; i++) {
			if (this.state.bookmark_ids.indexOf(article_ids[i].article) === -1) {
				article_array.push(article_ids[i].article)
				this.setState({
					bookmark_ids: article_array
				})
			}
		}
	}

	handleLogout = () => {
		var headers = { "Authorization": "Token " + cookies.get('token'), "Content-Type": "application/json" }
		getRequest(ARTICLE_LOGOUT, this.authLogoutResponse, headers);
	}

	authLogoutResponse = (data) => {
		cookies.remove('token', { path: '/' })
		cookies.remove('full_name', { path: '/' })
		this.setState({
			is_loggedin: false,
			bookmark_ids: []
		})
	}

	handleSearch = (query) => {
		var url = SUGGESTIONS + "?q=" + query + "&" + this.state.domain
		getRequest(url, this.getSuggestionsResponse)
	}

	getSuggestionsResponse = (data) => {
		var options_array = []
		var results = data.body.result;
		results.map((item, indx) => {
			options_array.push(item.value)
		})
		this.setState({
			options: options_array
		})
	}

	getSessionId = (data) => {
		cookies.set('sessionID', data.body.results, { path: '/' });
		setTimeout(() => {
			cookies.remove('sessionID', { path: '/' })
		}, 900000);
	}

	setEventTracker = () => {
		console.log("data")
	}

	componentDidMount() {
		if (cookies.get("sessionID")) {
			getRequest(EVENT_TRACK_URL + "?domain=newscout&action=trending_list_click&platform=web&type=ENGAGE_VIEW&sid=" + cookies.get("sessionID"), this.setEventTracker);
		}
		else {
			getRequest(ACCESS_SESSION, this.getSessionId);
		}
		this.getTrendingPosts()
		window.addEventListener('scroll', this.handleScroll, true);
		getRequest(MENUS + "?" + this.state.domain, this.getMenu);
		if (cookies.get('full_name')) {
			this.setState({ is_loggedin: true })
			var headers = { "Authorization": "Token " + cookies.get('token'), "Content-Type": "application/json" }
			getRequest(ALL_ARTICLE_BOOKMARK + "?" + this.state.domain, this.getBookmarksArticles, headers);
		}
		if (cookies.get('isChecked')) {
			this.setState({ isChecked: true })
		} else {
			this.setState({ isChecked: false })
		}
		if (cookies.get('isSideOpen')) {
			this.setState({ isSideOpen: true })
		} else {
			this.setState({ isSideOpen: false })
		}
		this.getTheme()
	}

	componentWillUnmount = () => {
		window.removeEventListener('scroll', this.handleScroll)
	}

	render() {
		var { menus, trending, isLoading, isSideOpen, modal, is_loggedin, bookmark_ids, username, isChecked, options, active_page } = this.state;
		var result = trending.map((item, index) => {
			return (
				<div className="col-lg-6 mb-4" key={index}>
					{isLoading ?
						<Skeleton height={160} />
						:
						<ToogleCard
							items={item}
							is_loggedin={is_loggedin}
							toggle={this.toggle}
							is_open={modal}
							getArticleId={this.getArticleId}
							bookmark_ids={bookmark_ids}
							base_url={BASE_URL}
							index={index}
						/>
					}
				</div>
			)
		})

		return (
			<React.Fragment>
				<Menu
					navitems={menus}
					url={URL}
					isSlider={true}
					isSideBarToogle={this.isSideBarToogle}
					isSideOpen={isSideOpen}
					toggle={this.toggle}
					is_loggedin={is_loggedin}
					username={username}
					handleLogout={this.handleLogout}
					toggleSwitch={this.toggleSwitch}
					isChecked={isChecked}
					handleSearch={this.handleSearch}
					options={options}
				/>
				<div className="container-fluid">
					<div className="row">
						<SideBar menuitems={menus} class={isSideOpen} isChecked={isChecked} active={active_page} />
						<div className={`main-content ${isSideOpen ? 'offset-lg-2 col-lg-10' : 'col-lg-12'}`}>
							<div className="container">
								<div className="pt-50 pb-5">
									<div className="row">
										<div className="col-lg-12 mb-4">
											<div className="section-title">
												<h2 className="m-0 section-title">Trending</h2>
											</div>
										</div>
									</div>
									<div className="accordion" id="accordionExample">
										<div className="row">
											{result}
											{
												this.state.loadingPagination ?
													<React.Fragment>
														<div className="lds-ring text-center"><div></div><div></div><div></div><div></div></div>
													</React.Fragment>
													: ""
											}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<Auth is_open={modal} toggle={this.toggle} loggedInUser={this.loggedInUser} />

				<Footer privacyurl="#" facebookurl="#" twitterurl="#" />
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("trending");
wrapper ? ReactDOM.render(<Trending />, wrapper) : null;