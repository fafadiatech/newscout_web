import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import Slider from "react-slick";
import Cookies from 'universal-cookie';
import Skeleton from 'react-loading-skeleton';
import { Menu, ImageOverlay, VerticleCardItem, HorizontalCardItem, SideBar, Footer } from 'newscout';
import Auth from './Auth';

import { BASE_URL, MENUS, TRENDING_NEWS, ARTICLE_POSTS, ARTICLE_BOOKMARK, ALL_ARTICLE_BOOKMARK, ARTICLE_LOGOUT, SUGGESTIONS, ACCESS_SESSION, EVENT_TRACK_URL } from '../../utils/Constants';
import { getRequest, postRequest } from '../../utils/Utils';

import 'newscout/assets/Menu.css';
import 'newscout/assets/ImageOverlay.css';
import 'newscout/assets/ContentOverlay.css';
import 'newscout/assets/CardItem.css';
import 'newscout/assets/Sidebar.css';

var article_array = [];
const URL = "/news/search/"
const cookies = new Cookies();

const settings = {
	dots: false,
	infinite: false,
	speed: 1500,
	slidesToShow: 3,
	slidesToScroll: 3,
	initialSlide: 0,
	responsive: [
		{
			breakpoint: 1024,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 3,
				infinite: false,
				dots: false
			}
		},
		{
			breakpoint: 600,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 2,
				initialSlide: 2
			}
		},
		{
			breakpoint: 480,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1
			}
		}
	]
};

const settingsTrending = {
	dots: false,
	infinite: true,
	speed: 1500,
	autoplay: true,
	slidesToShow: 1,
	slidesToScroll: 1,
	initialSlide: 0,
	responsive: [
		{
			breakpoint: 1024,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				infinite: true,
				dots: false
			}
		},
		{
			breakpoint: 600,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				initialSlide: 1
			}
		},
		{
			breakpoint: 480,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1
			}
		}
	]
};

class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			trending: [],
			menus: [],
			sector_update: [],
			regional_update: [],
			finance: [],
			economics: [],
			misc: [],
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
			isLoadingUncategories : true,
			isLoadingFinance : true,
			isLoadingEconomics : true,
			isLoadingMisc : true,
			isLoadingSectorUpdate : true,
			isLoadingRegionalUpdate : true,
		}
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
				this.getPosts(heading_dict['itemtext'], heading_dict['item_id'])
			}
		})
		this.setState({
			menus: menus_array
		})
	}

	getTrending = (data) => {
		var trending_array = []
		data.body.results.map((item, index) => {
			if (index <= 5) {
				var articles = item.articles[0];
				if (articles.cover_image) {
					var article_dict = {}
					article_dict['id'] = articles.id
					article_dict['header'] = articles.title
					article_dict['altText'] = articles.title
					article_dict['caption'] = articles.blurb
					article_dict['source'] = articles.source
					article_dict['source_url'] = articles.source_url
					article_dict['category'] = articles.category
					article_dict['slug'] = "/news/article/" + articles.slug
					article_dict['source_url'] = articles.source_url
					article_dict['src'] = "http://images.newscout.in/unsafe/1175x500/center/" + decodeURIComponent(articles.cover_image)
					article_dict['src_xs'] = "http://images.newscout.in/unsafe/350x325/center/" + decodeURIComponent(articles.cover_image)
					trending_array.push(article_dict)
				}
			}
		})
		this.setState({
			isLoading: false,
			trending: trending_array,
		})
	}

	getPosts = (cat_name, cat_id) => {
		var url = ARTICLE_POSTS + "?" + this.state.domain + "&category=" + cat_name
		if (cat_name == "Uncategorised") {
			this.setState({ isLoadingUncategories: false })
			getRequest(url, this.latestNewsPosts)
		} else if (cat_name == "Finance") {
			getRequest(url, this.financePosts)
		} else if (cat_name == "Economics") {
			getRequest(url, this.economicPosts)
		} else if (cat_name == "Misc") {
			getRequest(url, this.miscPosts)
		} else if (cat_name == "Sector Updates") {
			getRequest(url, this.sectorUpdatePosts)
		} else if (cat_name == "Regional Updates") {
			getRequest(url, this.regionalUpdatePosts)
		}
	}

	getArticleId = (articleId) => {
		if (cookies.get('full_name')) {
			this.fetchArticleBookmark(articleId)
		} else {
			this.toggle()
		}
	}

	sectorUpdatePosts = (data) => {
		var sectorupdateposts_array = []
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
				article_dict['published_on'] = moment(item.published_on).format('D MMMM YYYY')
				article_dict['src'] = "http://images.newscout.in/unsafe/368x276/left/top/" + decodeURIComponent(item.cover_image)
				if (sectorupdateposts_array.length < 3) {
					sectorupdateposts_array.push(article_dict)
				}
			}
		})
		this.setState({
			isLoadingSectorUpdate: false,
			sector_update: sectorupdateposts_array
		})
	}

	regionalUpdatePosts = (data) => {
		var regionalupdateposts_array = []
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
				article_dict['published_on'] = moment(item.published_on).format('D MMMM YYYY')
				article_dict['src'] = "http://images.newscout.in/unsafe/368x490/center/" + decodeURIComponent(item.cover_image)
				if (regionalupdateposts_array.length < 4) {
					regionalupdateposts_array.push(article_dict)
				}
			}
		})
		this.setState({
			isLoadingRegionalUpdate: false,
			regional_update: regionalupdateposts_array
		})
	}

	financePosts = (data) => {
		var financeposts_array = []
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
				article_dict['published_on'] = moment(item.published_on).format('D MMMM YYYY')
				article_dict['src'] = "http://images.newscout.in/unsafe/368x200/left/top/" + decodeURIComponent(item.cover_image)
				article_dict['src_xs'] = "http://images.newscout.in/unsafe/325x200/left/top/" + decodeURIComponent(item.cover_image)
				if (financeposts_array.length < 8) {
					financeposts_array.push(article_dict)
				}
			}
		})
		this.setState({
			isLoadingFinance: false,
			finance: financeposts_array
		})
	}

	economicPosts = (data) => {
		var economicposts_array = []
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
				article_dict['published_on'] = moment(item.published_on).format('D MMMM YYYY')
				article_dict['src'] = "http://images.newscout.in/unsafe/368x490/center/" + decodeURIComponent(item.cover_image)
				if (economicposts_array.length < 4) {
					economicposts_array.push(article_dict)
				}
			}
		})
		this.setState({
			isLoadingEconomics: false,
			economics: economicposts_array
		})
	}

	miscPosts = (data) => {
		var miscposts_array = []
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
				article_dict['published_on'] = moment(item.published_on).format('D MMMM YYYY')
				article_dict['src'] = "http://images.newscout.in/unsafe/368x322/left/top/" + decodeURIComponent(item.cover_image)
				if (miscposts_array.length < 3) {
					miscposts_array.push(article_dict)
				}
			}
		})
		this.setState({
			isLoadingMisc: false,
			misc: miscposts_array
		})
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

	setEventTracker = () => {
		console.log("data")
	}

	componentDidMount() {
		if (cookies.get("sessionID")) {
			getRequest(EVENT_TRACK_URL + "?domain=newscout&platform=web&type=ENGAGE_VIEW&sid=" + cookies.get("sessionID"), this.setEventTracker);
		}
		else {
			getRequest(ACCESS_SESSION, this.getSessionId);
		}
		getRequest(TRENDING_NEWS + "?" + this.state.domain, this.getTrending);
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
		this.getTheme();

		document.addEventListener('click', this.handleDocumentClick, true);
	}

	render() {
		var { menus, trending, finance, economics, sector_update, regional_update, misc, isLoading, isSideOpen, modal, is_loggedin, bookmark_ids, username, isChecked, options, isLoadingUncategories, isLoadingFinance, isLoadingEconomics, isLoadingMisc, isLoadingSectorUpdate, isLoadingRegionalUpdate } = this.state

		var sector_update = sector_update.map((item, index) => {
			return (
				<div className="col-lg-4 mb-4" key={index}>
					{isLoadingSectorUpdate ?
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

		var trendingSlider = trending.map((item, index) => {
			if (index !== 5) {
				return (
					<ImageOverlay
						id={item.id}
						image={item.src}
						image_xs={item.src_xs}
						title={item.header}
						description={item.caption}
						uploaded_by={item.source}
						source_url={item.source_url}
						slug_url={item.slug}
						category={item.category}
						is_loggedin={is_loggedin}
						toggle={this.toggle}
						is_open={modal}
						getArticleId={this.getArticleId}
						bookmark_ids={bookmark_ids}
						base_url={BASE_URL}
						key={index}
					/>
				)
			}
		})

		var regional_update = regional_update.map((item, index) => {
			return (
				<div className="col-lg-6 mb-4" key={index}>
					{isLoadingRegionalUpdate ?
						<Skeleton height={250} />
						:
						<HorizontalCardItem
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

		var finance = finance.map((item, index) => {
			return (
				<React.Fragment key={index}>
					{isLoadingFinance ?
						<Skeleton height={230} />
						:
						<ImageOverlay
							image={item.src}
							image_xs={item.src_xs}
							title={item.header}
							description={item.caption}
							uploaded_by={item.source}
							source_url={item.source_url}
							slug_url={item.slug}
							category={item.category}
							size="sm"
						/>
					}
				</React.Fragment>
			)
		})

		var economics = economics.map((item, index) => {
			return (
				<div className="col-lg-6 mb-4" key={index}>
					{isLoadingEconomics ?
						<Skeleton height={230} />
						:
						<HorizontalCardItem
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

		var misc = misc.map((item, index) => {
			return (
				<div className="col-lg-4 mb-4" key={index}>
					{isLoadingMisc ?
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
					isNavbarFilter={false}
				/>
				<div className="container-fluid">
					<div className="row">
						<SideBar menuitems={menus} class={isSideOpen} isChecked={isChecked} />
						<div className={`main-content ${isSideOpen ? 'offset-lg-2 col-lg-10' : 'col-lg-12'}`}>
							<div className="container">
								<div className="pt-50">
									<div className="row">
										<div className="col-lg-12 col-12 mb-4 trending-slider">
											{isLoading ?
												<Skeleton height={500} />
												:
												<Slider {...settingsTrending}>{trendingSlider}</Slider>
											}
										</div>
									</div>
								</div>

								<div className="pt-50">
									<div className="row">
										<div className="col-lg-12 col-12 mb-4">
											<div className="section-title">
												<h2 className="m-0 section-title"><a href="/news/sector-updates/"> Sector Updates</a></h2>
											</div>
										</div>
									</div>
									<div className="row">{sector_update}</div>
								</div>

								<div className="pt-50">
									<div className="row">
										<div className="col-lg-12 col-12 mb-4">
											<div className="section-title">
												<h2 className="m-0 section-title"><a href="/news/regional-updates/"> Regional Updates</a></h2>
											</div>
										</div>
									</div>
									<div className="row">{regional_update}</div>
								</div>

								<div className="p-5045">
									<div className="row">
										<div className="col-lg-12 col-12 mb-4">
											<div className="section-title slider-header">
												<h2 className="m-0 section-title"><a href="/news/finance/"> Finance</a></h2>
											</div>
										</div>
									</div>
									<div className="row">
										<div className="col-lg-12">
											<Slider {...settings}>{finance}</Slider>
										</div>
									</div>
								</div>

								<div className="pt-50">
									<div className="row">
										<div className="col-lg-12 col-12 mb-4">
											<div className="section-title">
												<h2 className="m-0 section-title"><a href="/news/economics/"> Economics</a></h2>
											</div>
										</div>
									</div>
									<div className="row">{economics}</div>
								</div>

								<div className="pt-50 pb-5">
									<div className="row">
										<div className="col-lg-12 col-12 mb-4">
											<div className="section-title">
												<h2 className="m-0 section-title"><a href="/news/misc/"> Misc</a></h2>
											</div>
										</div>
									</div>
									<div className="row">{misc}</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<Auth is_open={modal} toggle={this.toggle} loggedInUser={this.loggedInUser} />

				<Footer privacyurl="#" facebookurl="https://www.facebook.com/fafadiatech/" twitterurl="https://twitter.com/FafadiaTechHQ" />
			</React.Fragment>
		);
	}
}

const wrapper = document.getElementById("index");
wrapper ? ReactDOM.render(<App />, wrapper) : null;