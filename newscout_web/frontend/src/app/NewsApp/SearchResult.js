import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import Cookies from 'universal-cookie';
import Skeleton from 'react-loading-skeleton';
import { Menu, SideBar, Filter, VerticleCardItem, Footer } from 'newscout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

import Auth from './Auth';

import { BASE_URL, MENUS, ARTICLE_POSTS, ARTICLE_BOOKMARK, ALL_ARTICLE_BOOKMARK, ARTICLE_LOGOUT, SUGGESTIONS } from '../../utils/Constants';
import { getRequest, postRequest } from '../../utils/Utils';

import './style.css';
import 'newscout/assets/Menu.css'
import 'newscout/assets/ImageOverlay.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/Filter.css'
import 'newscout/assets/Sidebar.css'

import config_data from './config.json';

var query_array = [];
var final_query = "";
var article_array = [];
const URL = "/news/search/"
const cookies = new Cookies();

class SearchResult extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			menus: [],
			searchResult: [],
			isFilterOpen: false,
			filters: [],
			final_query: "",
			loadingPagination: false,
			page: 0,
			next: null,
			previous: null,
			isSideOpen: true,
			domain: "domain=" + DOMAIN,
			isLoading: true,
			modal: false,
			is_loggedin: false,
			is_loggedin_validation: false,
			username: cookies.get('full_name'),
			bookmark_ids: [],
			isChecked: false,
			cat_array: [],
			source_array: [],
			hashtags_array: [],
			options: []
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

	getArticleId = (articleId) => {
		if (cookies.get('full_name')) {
			this.fetchArticleBookmark(articleId)
		} else {
			this.toggle()
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
			isLoading: true,
			loadingPagination: true,
			page: this.state.page + 1
		})
		getRequest(this.state.next, this.getSearchResult, false, true);
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
				heading_dict['itemtext'] = item.heading.name;
				heading_dict['itemurl'] = "news/" + item.heading.name.replace(" ", "-").toLowerCase();
				heading_dict['item_id'] = item.heading.category_id;
				heading_dict['item_icon'] = item.heading.icon
				menus_array.push(heading_dict)
			}
		})
		this.setState({
			menus: menus_array
		})
	}

	toggleFilter = () => {
		this.setState({
			isFilterOpen: !this.state.isFilterOpen
		})
	}

	getSearchResult = (data, extra_data) => {
		const filters = [];
		var searchresult_array = [];
		var source_filters = data.body.filters.source;
		var hashtags_filters = data.body.filters.hash_tags;
		var cat_filters = data.body.filters.category;
		if (cat_filters && this.state.cat_array.length === 0) {
			cat_filters.map((item, index) => {
				if (item.key !== "") {
					var category_dict = {}
					category_dict['label'] = item.key
					category_dict['value'] = item.key
					this.state.cat_array.push(category_dict)
				}
			})
			filters.push({ "catitems": "Category", "subitem": this.state.cat_array })
			this.setState({
				filters: filters
			})
		}
		if (source_filters && this.state.source_array.length === 0) {
			source_filters.map((item, index) => {
				if (item.key !== "") {
					var source_dict = {}
					source_dict['label'] = item.key
					source_dict['value'] = item.key
					this.state.source_array.push(source_dict)
				}
			})
			filters.push({ "catitems": "Source", "subitem": this.state.source_array })
			this.setState({
				filters: filters
			})
		}
		if (hashtags_filters && this.state.hashtags_array.length === 0) {
			hashtags_filters.map((item, index) => {
				if (item.key !== "") {
					var hashtags_dict = {}
					hashtags_dict['label'] = item.key
					hashtags_dict['value'] = item.key
					this.state.hashtags_array.push(hashtags_dict)
				}
			})
			filters.push({ "catitems": "Hash Tags", "subitem": this.state.hashtags_array })
			this.setState({
				filters: filters
			})
		}

		data.body.results.map((item, index) => {
			if (item.cover_image) {
				var article_dict = {}
				article_dict['id'] = item.id
				article_dict['header'] = item.title
				article_dict['altText'] = item.title
				article_dict['caption'] = item.blurb
				article_dict['source'] = item.source
				article_dict['slug'] = "/news/article/" + item.slug
				article_dict['category'] = item.category
				article_dict['hash_tags'] = item.hash_tags
				article_dict['published_on'] = moment(item.published_on).format('D MMMM YYYY')
				article_dict['src'] = "http://images.newscout.in/unsafe/368x276/left/top/" + decodeURIComponent(item.cover_image)
				searchresult_array.push(article_dict)
			}
		})
		if (extra_data) {
			var results = [
				...this.state.searchResult,
				...searchresult_array
			]
		} else {
			var results = [
				...searchresult_array
			]
		}
		this.setState({
			searchResult: results,
			next: data.body.next,
			previous: data.body.previous,
			loadingPagination: false
		})
		setTimeout(() => { 
			this.setState({isLoading: false})
		}, 3000)
	}

	queryFilter = (data, checked) => {
		if (checked == true) {
			query_array.push(data);
		} else {
			query_array.splice(query_array.indexOf(data), 1);
		}
		final_query = query_array.join("&");
		this.setState({
			final_query: final_query,
			isLoading: true
		})

		if (history.pushState) {
			getRequest(ARTICLE_POSTS + "?" + this.state.domain + "&q=" + QUERY + "&" + final_query, this.getSearchResult);
			var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?q=" + QUERY;
			if (final_query) {
				newurl = newurl + "&" + final_query;
			}
			window.history.pushState({}, '', newurl);
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
			is_captcha: true,
			bookmark_ids: []
		})
	}

	handleSearch = (query) => {
		var url = SUGGESTIONS+"?q="+query+"&"+this.state.domain
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

	componentDidMount() {
		window.addEventListener('scroll', this.handleScroll, true);
		getRequest(MENUS + "?" + this.state.domain, this.getMenu);
		if (this.state.final_query) {
			getRequest(ARTICLE_POSTS + "?" + this.state.domain + "&q=" + QUERY + "&" + this.state.final_query, this.getSearchResult);
		} else {
			getRequest(ARTICLE_POSTS + "?" + this.state.domain + "&q=" + QUERY, this.getSearchResult);
		}
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
		var { menus, searchResult, filters, isFilterOpen, isSideOpen, isLoading, username, is_loggedin, modal, bookmark_ids, isChecked, options } = this.state;

		var result = searchResult.map((item, index) => {
			return (
				<div className="col-lg-4 mb-5">
					{isLoading ?
						<Skeleton height={525} />
						:
						<VerticleCardItem
							id={item.id}
							image={item.src}
							title={item.header}
							description={item.caption}
							uploaded_by={item.source}
							source_url={item.slug}
							slug_url={item.slug}
							category={item.category}
							hash_tags={item.hash_tags}
							uploaded_on={item.published_on}
							is_loggedin={is_loggedin}
							toggle={this.toggle}
							is_open={modal}
							getArticleId={this.getArticleId}
							bookmark_ids={bookmark_ids}
							base_url={BASE_URL}
						/>
					}
				</div>
			)
		})

		if (isFilterOpen === true) {
			document.getElementsByTagName("body")[0].style = "overflow:hidden !important";
		} else {
			document.getElementsByTagName("body")[0].style = "overflow:auto";
		}

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
						<SideBar menuitems={menus} class={isSideOpen} isChecked={isChecked} />
						<div className={`main-content ${isSideOpen ? 'offset-lg-2 col-lg-10' : 'col-lg-12'}`}>
							<div className="container">
								<div className="pt-50">
									<div className="row">
										<div className="col-lg-12">
											<div className="row">
												<div className="col-lg-12">
													<ul className="list-inline related-queries">
														<li className="list-inline-item"><strong>Related Queries:</strong></li>
														<li className="list-inline-item"><a href="http://newscout.in/news/search/?q=Ambani">Ambani</a></li>
														<li className="list-inline-item"><a href="http://newscout.in/news/search/?q=Money">Money</a></li>
														<li className="list-inline-item"><a href="http://newscout.in/news/search/?q=PM">PM</a></li>
														<li className="list-inline-item"><a href="http://newscout.in/news/search/?q=Corona">Corona</a></li>
													</ul>
												</div>
											</div>
										</div>
									</div>
									<div className="row">
										<div className="col-lg-12 mb-4">
											<div className="clerfix">
												<div className="float-right">
													<div className="filter" onClick={this.toggleFilter}>
														<FontAwesomeIcon icon={faFilter} /> Filter
													</div>
												</div>
												<div className="float-left">
													<div className="section-title">
														<h2 className="m-0 section-title">Search result: <span className="text-capitalize">{QUERY}</span></h2>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div className="row">
										{
											this.state.loadingPagination ?
												<React.Fragment>
													<div className="lds-ring text-center"><div></div><div></div><div></div><div></div></div>
												</React.Fragment>
												: ""
										}
										{result}
									</div>
								</div>
							</div>
						</div>
						<Filter filters={filters} toggleFilter={this.toggleFilter} isFilterOpen={isFilterOpen} query={this.queryFilter} />
					</div>
				</div>

				<Auth is_open={modal} toggle={this.toggle} loggedInUser={this.loggedInUser} />

				<Footer privacyurl="#" facebookurl="#" twitterurl="#" />
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("search-result");
wrapper ? ReactDOM.render(<SearchResult />, wrapper) : null;