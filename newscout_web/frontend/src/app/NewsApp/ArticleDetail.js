import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import Cookies from 'universal-cookie';
import Skeleton from 'react-loading-skeleton';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { JumboBox, Menu, SideBox, SideBar, Footer } from 'newscout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPowerOff } from '@fortawesome/free-solid-svg-icons'
import { Button, Form, FormGroup, Label, Input, FormText, Modal, ModalHeader, ModalBody, ModalFooter, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Breadcrumb, BreadcrumbItem } from 'reactstrap';

import Auth from './Auth';
import Comments from './Comments'

import {
	BASE_URL, MENUS, ARTICLE_DETAIL_URL, ARTICLE_LOGOUT, ARTICLE_COMMENT, CAPTCHA_URL, ARTICLE_BOOKMARK, ALL_ARTICLE_BOOKMARK, SUGGESTIONS, EVENT_TRACK_URL,
	ACCESS_SESSION
} from '../../utils/Constants';
import { getRequest, postRequest } from '../../utils/Utils';

import 'newscout/assets/Menu.css'
import 'newscout/assets/JumboBox.css'
import 'newscout/assets/ImageOverlay.css'
import 'newscout/assets/SideBox.css'
import 'newscout/assets/Sidebar.css'

import config_data from './config.json';

var article_array = [];
const URL = "/news/search/";
const cookies = new Cookies();

class ArticleDetail extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			menus: [],
			article: {},
			recommendations: [],
			domain: "domain=" + DOMAIN,
			article_id: "",
			modal: false,
			username: cookies.get('full_name'),
			articlecomments: [],
			successComment: false,
			is_loggedin: false,
			is_loggedin_validation: false,
			captchaData: {},
			captchaImage: "",
			InvalidCaptcha: false,
			resetAll: false,
			is_captcha: true,
			isSideOpen: true,
			bookmark_ids: [],
			isChecked: false,
			next_article: [],
			next_article_url: '',
			prev_article_url: '',
			options: [],
			isLoading: true,
			has_subscribed: SUBSCRIBED === 'True' ? true : false,
		};
	}

	getArticleId = (articleId) => {
		if (cookies.get('full_name')) {
			this.fetchArticleBookmark(articleId)
		} else {
			this.toggle()
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

	loggedInUser = (data) => {
		this.setState({
			username: data,
			is_loggedin: true
		})
		var headers = { "Authorization": "Token " + cookies.get('token'), "Content-Type": "application/json" }
		getRequest(ARTICLE_COMMENT + "?article_id=" + ARTICLEID, this.getArticleComment, headers);
		this.fetchCaptcha();
		this.setState({ is_captcha: false });
	}

	toggle = (data) => {
		this.setState({
			modal: !data,
		})
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

	fetchArticleBookmark = (articleId) => {
		var headers = { "Authorization": "Token " + cookies.get('token'), "Content-Type": "application/json" }
		var url = ARTICLE_BOOKMARK + "?" + this.state.domain;
		var body = JSON.stringify({ article_id: articleId })
		postRequest(url, body, this.articleBookmarkResponse, "POST", headers)
	}

	articleBookmarkResponse = (data) => {
		if (cookies.get("sessionID")) {
			getRequest(EVENT_TRACK_URL + "?domain=newscout&action=bookmark_article&platform=web&type=ENGAGE_VIEW&sid=" + cookies.get("sessionID"), this.setEventTracker);
		}
		else {
			getRequest(ACCESS_SESSION, this.getSessionId);
		}
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

	getNextArticleDetail = (data) => {
		var next_article = data.body.article;
		var next_article_url = data.body.next_article;
		var state = this.state;
		var current_article = {}
		current_article['id'] = next_article.id;
		current_article['slug'] = "/news/article/" + next_article.slug;
		current_article['title'] = next_article.title;
		current_article['altText'] = next_article.title;
		current_article['caption'] = next_article.blurb;
		current_article['source'] = next_article.source;
		current_article['source_url'] = next_article.source_url;
		current_article['root_category'] = next_article.root_category;
		current_article['category'] = next_article.category;
		current_article['hash_tags'] = next_article.hash_tags;
		current_article['date'] = moment(next_article.published_on).format('D MMMM YYYY');
		state.next_article_url = next_article_url;
		if (next_article.cover_image) {
			current_article['src'] = "http://images.newscout.in/unsafe/1080x610/smart/" + decodeURIComponent(next_article.cover_image);
		} else {
			current_article['src'] = "http://images.newscout.in/unsafe/fit-in/1080x610/smart/" + config_data.defaultImage;
		}
		state.next_article.push(current_article)
		state.isLoading = false
		this.setState(state)
	}

	getArticleDetail = (data) => {
		var article = data.body.article;
		var next_article_url = data.body.next_article;
		var prev_article_url = data.body.prev_article;
		var state = this.state;
		var article_dict = {}
		state.article.id = article.id;
		state.article.slug = "/news/article/" + article.slug;
		state.article.title = article.title;
		state.article.altText = article.title;
		state.article.caption = article.blurb;
		state.article.source = article.source;
		state.article.source_url = article.source_url;
		state.article.root_category = article.root_category;
		state.article.category = article.category;
		state.article.hash_tags = article.hash_tags;
		state.article.date = moment(article.published_on).format('D MMMM YYYY');
		state.next_article_url = next_article_url;
		state.prev_article_url = prev_article_url;
		if (article.cover_image) {
			state.article.src = "http://images.newscout.in/unsafe/1080x610/smart/" + decodeURIComponent(article.cover_image);
		} else {
			state.article.src = "http://images.newscout.in/unsafe/fit-in/1080x610/smart/" + config_data.defaultImage;
		}
		getRequest(ARTICLE_DETAIL_URL + state.article.id + "/recommendations/?" + this.state.domain, this.getRecommendationsResults);
		getRequest(ARTICLE_DETAIL_URL + next_article_url + "?" + this.state.domain, this.getNextArticleDetail);
		state.isLoading = false
		this.setState(state)
	}

	getRecommendationsResults = (data) => {
		var recommendations_array = []
		data.body.results.map((item, index) => {
			if (item.cover_image) {
				var article_dict = {}
				article_dict['id'] = item.id
				article_dict['title'] = item.title
				article_dict['altText'] = item.title
				article_dict['slug'] = "/news/article/" + item.slug
				article_dict['published_on'] = moment(item.published_on).format('D MMMM YYYY');
				article_dict['src'] = "http://images.newscout.in/unsafe/70x70/center/smart/" + decodeURIComponent(item.cover_image)
				if (recommendations_array.length < 5) {
					recommendations_array.push(article_dict)
				}
			}
		})
		this.setState({
			recommendations: recommendations_array
		})
	}

	getArticleComment = (data) => {
		var results = data.body.results.reverse()
		this.setState({
			articlecomments: results
		})
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

	handleSubmit = (data) => {
		var url = ARTICLE_COMMENT + "?article_id=" + ARTICLEID
		var captchaKey = this.state.captchaData
		var body = JSON.stringify({ comment: data["comment"], article_id: ARTICLEID, captcha_value: data["captcha"], captcha_key: captchaKey["new_captch_key"] })
		if (cookies.get('full_name') !== undefined) {
			var headers = { "Authorization": "Token " + cookies.get('token'), "Content-Type": "application/json" }
			postRequest(url, body, this.commentSubmitResponse, "POST", headers);
		} else {
			this.setState({
				is_loggedin_validation: true
			})
			setTimeout(() => {
				this.setState({
					is_loggedin_validation: false
				})
			}, 3000);
		}
	}

	setCaptcha = (data) => {
		var results = data.body.result;
		var captcha_image = BASE_URL + results.new_captch_image;
		var state = this.state
		state.captchaImage = captcha_image
		state.captchaData = results
		this.setState(state);
	}

	fetchCaptcha = () => {
		var headers = { "Authorization": "Token " + cookies.get('token'), "Content-Type": "application/json" }
		if (CAPTCHA_ENABLED === "True") {
			console.log(typeof CAPTCHA_ENABLED)
			getRequest(CAPTCHA_URL, this.setCaptcha, headers);
		}
	}

	commentSubmitResponse = (data) => {
		if (data.header.status === "1") {
			this.setState({
				InvalidCaptcha: false,
				successComment: true,
				resetAll: true
			});
			setTimeout(() => {
				this.setState({
					successComment: false
				})
			}, 3000);
			setTimeout(() => {
				this.setState({
					resetAll: false
				})
			}, 50);
			var headers = { "Authorization": "Token " + cookies.get('token'), "Content-Type": "application/json" }
			getRequest(ARTICLE_COMMENT + "?article_id=" + ARTICLEID, this.getArticleComment, headers);
		}
		else {
			this.setState({
				InvalidCaptcha: true
			})
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

	getSessionId = (data) => {
		cookies.set('sessionID', data.body.results, { path: '/' });
		setTimeout(() => {
			cookies.remove('sessionID', { path: '/' })
		}, 900000);
	}

	setEventTracker = () => {
		console.log("data")
	}

	getEventTracker = (article) => {
		if (cookies.get("sessionID")) {
			getRequest(EVENT_TRACK_URL + "?domain=newscout&action=article_detail&platform=web&type=ENGAGE_VIEW&category=" + article.category_id + "&category_name=" + article.category + "&sid=" + cookies.get("sessionID"), this.setEventTracker);
		}
		else {
			getRequest(ACCESS_SESSION, this.getSessionId);
		}

	}

	handleNextArticle = () => {
		this.setState({ isLoading: true })
		var new_url = BASE_URL + "/news/article/" + this.state.next_article_url;
		window.location.href = new_url;
	}

	handlePrevArticle = () => {
		this.setState({ isLoading: true })
		var new_url = BASE_URL + "/news/article/" + this.state.prev_article_url;
		window.location.href = new_url;
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

	getMore = () => {
		this.setState({
			isLoading: true
		})
		getRequest(ARTICLE_DETAIL_URL + this.state.next_article_url + "?" + this.state.domain, this.getNextArticleDetail);
	}

	handleScroll = () => {
		if ($(window).scrollTop() >= ($(document).height() - $(window).height()) * 0.7) {
			if (!this.state.isLoading) {
				// getRequest(ARTICLE_DETAIL_URL + this.state.next_article_url + "?" + this.state.domain, this.getNextArticleDetail);
				this.getMore();

			}
		}
	}

	componentDidMount() {
		window.addEventListener('scroll', this.handleScroll, true);
		getRequest(MENUS + "?" + this.state.domain, this.getMenu);
		getRequest(ARTICLE_DETAIL_URL + SLUG + "?" + this.state.domain, this.getArticleDetail);
		getRequest(ARTICLE_COMMENT + "?article_id=" + ARTICLEID, this.getArticleComment);
		if (cookies.get('full_name')) {
			this.fetchCaptcha();
			this.setState({ is_loggedin: true, is_captcha: false })
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
		var { menus, article, recommendations, username, modal, captchaImage,
			isSideOpen, is_loggedin, bookmark_ids, isChecked,
			isLoading, options, next_article } = this.state;
		var root_category = "";
		var category = "";
		if (article.root_category) {
			root_category = article.root_category.replace(" ", "-").toLowerCase()
		}
		if (article.category) {
			var category = article.category.replace(" ", "-").toLowerCase()
		}

		var next_article_description = next_article.caption;

		var description = article.caption;
		var source_url = "";
		if (source_url !== undefined) {
			source_url = article.source_url;
		}
		if (!this.state.has_subscribed) {
			source_url = "";
			description = article.caption
		}
		this.getEventTracker(article);

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
					options={options} />
				<div className="container-fluid">
					<div className="row">
						<SideBar menuitems={menus} class={isSideOpen} isChecked={isChecked} />
						<div className={`main-content ${isSideOpen ? 'offset-lg-2 col-lg-10' : 'col-lg-12'}`}>
							<div className="container">
								<div className="pt-50">
									<div className="row">
										<div className="col-lg-12 col-12">
											<div className="article-breadcrumb">
												<Breadcrumb className="mb-0">
													<BreadcrumbItem><a href="/">Home</a></BreadcrumbItem>
													{article.root_category ?
														<BreadcrumbItem><a href={`/news/${root_category}`}>{article.root_category}</a></BreadcrumbItem>
														: ""
													}
													{article.category ?
														<BreadcrumbItem><a href={`/news/${root_category}/${category}`}>{article.category}</a></BreadcrumbItem>
														: ""
													}
												</Breadcrumb>
											</div>
										</div>
									</div>
									<div className="row">
										<div className="col-lg-8 col-12 mb-4">
											<div className="row">
												<div className="col-lg-12">
													<div className="article-detail">
														{isLoading ?
															<Skeleton height={500} />
															:
															<JumboBox
																id={article.id}
																image={article.src}
																title={article.title}
																description={description}
																uploaded_by={article.source}
																source_url={article.source_url}
																slug_url={article.slug}
																category={article.category}
																hash_tags={article.hash_tags}
																uploaded_on={article.date}
																is_loggedin={is_loggedin}
																toggle={this.toggle}
																is_open={modal}
																getArticleId={this.getArticleId}
																bookmark_ids={bookmark_ids}
																base_url={BASE_URL}
															/>
														}
													</div>
												</div>
											</div>
											<div className="row">
												<div className="col-lg-12">
													<div className="sidebox my-5">
														<div className="heading">
															<div className="clearfix">
																<div className="float-left">
																	<h3 className="">Reviews</h3>
																</div>
																<div className="float-right">
																	{is_loggedin ?
																		<ul className="list-inline mb-0 usr">
																			<li className="list-inline-item">
																				<h6 className="h6-text mt-2 mb-0">{username}</h6>
																			</li>
																			<li className="list-inline-item">|</li>
																			<li className="list-inline-item text-danger" onClick={this.handleLogout}>
																				<FontAwesomeIcon icon={faPowerOff} />
																			</li>
																		</ul>
																		: ""
																	}
																</div>
															</div>
														</div>
														<div className="mt-4">
															{isLoading ?
																<Skeleton height={300} />
																:
																<Comments
																	comments={this.state.articlecomments}
																	handleSubmit={this.handleSubmit}
																	successComment={this.state.successComment}
																	is_loggedin_validation={this.state.is_loggedin_validation}
																	captchaImage={captchaImage}
																	InvalidCaptcha={this.state.InvalidCaptcha}
																	fetchCaptcha={this.fetchCaptcha}
																	resetAll={this.state.resetAll}
																	is_captcha={this.state.is_captcha}
																	is_loggedin={is_loggedin}
																	toggle={this.toggle}
																	is_open={modal}
																/>
															}
														</div>
													</div>
												</div>
											</div>
											{this.state.next_article.map((item) => {
												return (
													<div className="row">
														<div className="col-lg-12">
															<div className="article-detail mb-5">
																{isLoading ?
																	<Skeleton height={500} />
																	:
																	<JumboBox
																		id={item.id}
																		image={item.src}
																		title={item.title}
																		description={item.caption}
																		uploaded_by={item.source}
																		source_url={item.source_url}
																		slug_url={item.slug}
																		category={item.category}
																		hash_tags={item.hash_tags}
																		uploaded_on={item.date}
																		is_loggedin={is_loggedin}
																		toggle={this.toggle}
																		is_open={modal}
																		getArticleId={this.getArticleId}
																		bookmark_ids={bookmark_ids}
																		base_url={BASE_URL}
																	/>
																}
															</div>
														</div>
													</div>
												)
											})}
										</div>
										<div className="col-lg-4 col-12 mb-4">
											<div className="row">
												<div className="col-lg-12">
													<div className="sidebox">
														<div className="heading">
															<h3 className="text-center">More News</h3>
														</div>
														{isLoading ?
															<Skeleton height={400} />
															:
															<SideBox posts={recommendations} />
														}
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<Auth is_open={modal} toggle={this.toggle} loggedInUser={this.loggedInUser} />
				<Footer privacyurl="#" facebookurl="#" twitterurl="#" />

				<KeyboardEventHandler handleKeys={['right']} onKeyEvent={this.handleNextArticle} />
				<KeyboardEventHandler handleKeys={['left']} onKeyEvent={this.handlePrevArticle} />
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("article-detail");
wrapper ? ReactDOM.render(<ArticleDetail />, wrapper) : null;