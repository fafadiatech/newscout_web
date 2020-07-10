import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import Cookies from 'universal-cookie';
import Skeleton from 'react-loading-skeleton';
import { Menu, VerticleCardItem, SideBar, Footer, VerticleCardAd } from 'newscout';

import { BASE_URL, MENUS, ARTICLE_POSTS, ARTICLE_LOGOUT, SUGGESTIONS, SCHEDULES_URL, ALL_ARTICLE_BOOKMARK, ARTICLE_BOOKMARK } from '../../utils/Constants';
import { getRequest } from '../../utils/Utils';

import Auth from './Auth';

import 'newscout/assets/Menu.css'
import 'newscout/assets/ImageOverlay.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/Sidebar.css'

var article_array = [];
const submenu_array = [];
const URL = "/news/search/"
const cookies = new Cookies();

class MenuPosts extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			category: CATEGORY,
			newsPosts: [],
			subCategories: [],
			menus: [],
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
			options: [],
			cat_name: "",
			ads_article: {
				id: 0,
				description: '',
				source_url: '',
				image: ''
			},
			bookmark_ids: [],
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

	getNewsData = (data) => {
		var final_category = '';
		data.body.results.map((item, index) => {
			if (item.heading) {
				var heading = item.heading.name.replace(" ", "-").toLowerCase();
				if (heading === CATEGORY) {
					item.heading.submenu.map((item, index) => {
						submenu_array.push(item);
						var final_data = submenu_array.sort(function (a, b) {
							return a.category_id - b.category_id
						})
						this.setState({
							subCategories: final_data
						})
						// console.log(final_data[0])
						// if (final_data.length === 1) {
						final_category = final_data[0].name
						// }
					})
				}
			}
		})
		if(final_category !== undefined && final_category !== null){
			this.getPosts(final_category)
		}
	}

	getPosts = (cat_name) => {
		var url = ARTICLE_POSTS + "?" + this.state.domain + "&category=" + cat_name
		this.setState({ cat_name: cat_name })
		getRequest(url, this.newsData)
	}

	handleCategories = (e) => {
		var selected_category = e.target.innerText;
		this.setState({ newsPosts: [], isLoading: true })
		this.getPosts(selected_category)
	}

	newsData = (data) => {
		var news_array = []
		if (data.body.results !== undefined && data.body.results != "") {
			data.body.results.map((item, index) => {
				if (item.cover_image) {
					var article_dict = {}
					article_dict['id'] = item.id
					article_dict['header'] = item.title
					article_dict['altText'] = item.title
					article_dict['caption'] = item.blurb
					article_dict['source'] = item.source
					article_dict['source_url'] = item.source_url
					article_dict['slug'] = "/news/article/" + item.slug
					article_dict['category'] = item.category
					article_dict['hash_tags'] = item.hash_tags
					article_dict['published_on'] = moment(item.published_on).format('MMMM D, YYYY')
					article_dict['src'] = "http://images.newscout.in/unsafe/368x200/left/top/" + decodeURIComponent(item.cover_image)
					article_dict['src_xs'] = "http://images.newscout.in/unsafe/300x200/left/top/" + decodeURIComponent(item.cover_image)
					news_array.push(article_dict)
				}
			})
			var results = [
				...this.state.newsPosts,
				...news_array
			]
			this.setState({
				newsPosts: results,
				next: data.body.next,
				previous: data.body.previous,
				loadingPagination: false
			})
			setTimeout(() => {
				this.setState({ isLoading: false })
			}, 1000)
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
		var bookmark_obj = data.body.bookmark_article;
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

	fetchAds = () => {
		var url = SCHEDULES_URL + "?" + this.state.domain + "&category=" + this.state.cat_name
		getRequest(url, this.fetchAdsResponse)
	}

	fetchAdsResponse = (data) => {
		var result = data.body
		this.setState({
			ads_article: {
				id: result.id,
				description: result.ad_text,
				source_url: result.ad_url,
				image: "http://images.newscout.in/unsafe/368x276/left/top/" + result.media,
			}
		})
	}

	getNext = () => {
		this.setState({
			loadingPagination: true,
			page: this.state.page + 1
		})
		getRequest(this.state.next, this.newsData);
	}

	handleScroll = () => {
		if ($(window).scrollTop() >= ($(document).height() - $(window).height()) * 0.3) {
			if (!this.state.loadingPagination && this.state.next) {
				this.getNext();
				this.fetchAds()
			}
		}
	}

	componentDidMount() {
		window.addEventListener('scroll', this.handleScroll, true);
		getRequest(MENUS + "?" + this.state.domain, this.getMenu);
		getRequest(MENUS + "?" + this.state.domain, this.getNewsData);
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
		var { menus, newsPosts, isSideOpen, isLoading, username, is_loggedin, modal, isChecked, options, subCategories, bookmark_ids, ads_article, cat_name, category } = this.state;

		var subcategories = subCategories.map((item, index) => {
			return (
				<React.Fragment key={index}>
					<li className={`list-inline-item ${cat_name === item.name ? 'active' : ''}`} onClick={this.handleCategories}>{item.name}</li>
				</React.Fragment>
			)
		})
		var items = newsPosts.map((item, index) => {
			return (
				<div className="col-lg-4 col-md-4 mb-4" key={index + "-news"}>
					{isLoading ?
						<Skeleton height={525} />
						:
						<VerticleCardItem
							id={item.id}
							image={item.src}
							title={item.header}
							description={item.caption}
							uploaded_by={item.source}
							source_url={item.source_url}
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

		var resultsRender = [];
		for (var i = 0; i < items.length; i++) {
			resultsRender.push(items[i]);
			if ((i + 1) % 25 === 0) {
				resultsRender.push(
					<div className="col-lg-4 col-md-4 mb-4" key={i}>
						<VerticleCardAd
							id={ads_article.id}
							image={ads_article.image}
							description={ads_article.description}
							source_url={ads_article.source_url}
						/>
					</div>
				);
			}
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
						<SideBar menuitems={menus} class={isSideOpen} isChecked={isChecked} active={category} />
						<div className={`main-content ${isSideOpen ? 'offset-lg-2 col-lg-10' : 'col-lg-12'}`}>
							<div className="container">
								<div className="pt-50">
									<div className="row">
										<div className="col-lg-12">
											<div className="subcategory-menu mb-5 text-center">
												<ul className="list-inline m-0">{subcategories}</ul>
											</div>
										</div>
									</div>
									<div className="row">
										<div className="col-lg-12">
											<div className="row">
												{
													this.state.loadingPagination ?
														<React.Fragment>
															<div className="lds-ring text-center"><div></div><div></div><div></div><div></div></div>
														</React.Fragment>
														: ""
												}
												{resultsRender}
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
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("menu-posts");
wrapper ? ReactDOM.render(<MenuPosts />, wrapper) : null;