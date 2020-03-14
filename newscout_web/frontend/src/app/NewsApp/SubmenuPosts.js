import React from 'react';
import moment from 'moment';
import logo from './logo.png';
import ReactDOM from 'react-dom';
import Cookies from 'universal-cookie';
import Skeleton from 'react-loading-skeleton';
import { CardItem, Menu, SectionTitle, SideBar, VerticleCardItem, Footer } from 'newscout';

import Auth from './Auth';

import { BASE_URL, MENUS, ARTICLE_POSTS, ARTICLE_BOOKMARK, ALL_ARTICLE_BOOKMARK } from '../../utils/Constants';
import { getRequest, postRequest } from '../../utils/Utils';

import './style.css';
import 'newscout/assets/Menu.css'
import 'newscout/assets/ImageOverlay.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/SectionTitle.css'
import 'newscout/assets/Sidebar.css'

import config_data from './config.json';

var article_array = [];
const URL = "/news/search/"
const cookies = new Cookies();

class SubmenuPosts extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			category: CATEGORY,
			subcategory: SUBCATEGORY,
			newsPosts: [],
			menus: [],
			loadingPagination: false,
			page : 0,
			next: null,
			previous: null,
			domain: "domain="+DOMAIN,
			isLoading: false,
			isSideOpen: true,
			modal: false,
			is_loggedin: false,
			is_loggedin_validation: false,
			username: cookies.get('full_name'),
			bookmark_ids: []
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

	getArticleId = (articleId) => {
		if(cookies.get('full_name')){
			this.fetchArticleBookmark(articleId)
		} else {
			this.toggle()
		}
	}

	fetchArticleBookmark = (articleId) => {
		var headers = {"Authorization": "Token "+cookies.get('token'), "Content-Type": "application/json"}
		var url = ARTICLE_BOOKMARK+"?"+this.state.domain;
		var body = JSON.stringify({article_id: articleId})
		postRequest(url, body, this.articleBookmarkResponse, "POST", headers)
	}

	articleBookmarkResponse = (data) => {
		var bookmark_obj = data.body.bookmark_article
		var index = article_array.indexOf(bookmark_obj.article);
		
		if (article_array.includes(bookmark_obj.article) === false && bookmark_obj.status === 1) {
			article_array.push(bookmark_obj.article)
		}
		
		if (article_array.includes(bookmark_obj.article) === true && bookmark_obj.status === 0) {
			article_array.splice(index, 1);
		}
		this.setState({
			bookmark_ids: article_array
		})
	}

	getNext = () => {
		this.setState({
			loadingPagination: true,
			page : this.state.page + 1
		})
		getRequest(this.state.next, this.newsData);
	}

	handleScroll = () => {
		if ($(window).scrollTop() >= ($(document).height() - $(window).height()) * 0.3) {
			if (!this.state.loadingPagination && this.state.next){
				this.getNext();
			}
		}
	}

	getMenu = (data) => {
		var menus_array = []
		data.body.results.map((item, index) => {
			if(item.heading){
				var heading_dict = {}
				heading_dict['itemtext'] = item.heading.name
				heading_dict['itemurl'] = "news/"+item.heading.name.replace(" ", "-").toLowerCase()
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
		data.body.results.map((item, index) => {
			if(item.heading){
				var heading_dict = {}
				heading_dict['itemtext'] = item.heading.name
				heading_dict['itemurl'] = item.heading.name.replace(" ", "-").toLowerCase()
				heading_dict['item_id'] = item.heading.category_id
				if(heading_dict['itemurl'] === CATEGORY){
					item.heading.submenu.map((sub_item, sub_index) => {
						if(sub_item.name.replace(" ", "-").toLowerCase() === SUBCATEGORY){
							this.getPosts(sub_item.name, sub_item.category_id)
						}
					})
				}
			}
		})
	}

	getPosts = (cat_name, cat_id) => {
		var url = ARTICLE_POSTS+"?"+this.state.domain+"&category="+cat_name
		this.setState({isLoading: true})
		getRequest(url, this.newsData)
	}

	newsData = (data) => {
		var news_array = []
		data.body.results.map((item, index) => {
			if(item.cover_image){
				var article_dict = {}
				article_dict['id'] = item.id
				article_dict['header'] = item.title
				article_dict['altText'] = item.title
				article_dict['caption'] = item.blurb
				article_dict['source'] = item.source
				article_dict['slug'] = "/news/article/"+item.slug
				article_dict['category'] = item.category
				article_dict['hash_tags'] = item.hash_tags
				article_dict['published_on'] = moment(item.published_on).format('D MMMM YYYY')
				article_dict['src'] = "http://images.newscout.in/unsafe/368x276/left/top/"+decodeURIComponent(item.cover_image)
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
			loadingPagination: false,
			isLoading: false
		})
	}

	isSideOpen = (data) => {
		this.setState({
			isSideOpen: data
		})
	}

	getBookmarksArticles = (data) => {
		var article_array = []
		var article_ids = data.body.results;
		for(var i = 0; i < article_ids.length; i++){
			if(this.state.bookmark_ids.indexOf(article_ids[i].article) === -1){
				article_array.push(article_ids[i].article)
				this.setState({
					bookmark_ids: article_array
				})
			}
		}
	}

	componentDidMount() {
		window.addEventListener('scroll', this.handleScroll, true);
		getRequest(MENUS+"?"+this.state.domain, this.getMenu);
		getRequest(MENUS+"?"+this.state.domain, this.getNewsData);
		if(cookies.get('full_name')){
			var headers = {"Authorization": "Token "+cookies.get('token'), "Content-Type": "application/json"}
			getRequest(ALL_ARTICLE_BOOKMARK+"?"+this.state.domain, this.getBookmarksArticles, headers);
		}
	}

	componentWillUnmount = () => {
		window.removeEventListener('scroll', this.handleScroll)
	}

	render() {
		var { menus, newsPosts, isSideOpen, isLoading, modal, is_loggedin, bookmark_ids } = this.state;
		var result = newsPosts.map((item, index) => {
			return (
				<div className="col-lg-3 mb-4">
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

		return(
			<React.Fragment>
				<Menu logo={logo} navitems={menus} url={URL} isSlider={true} isSideOpen={this.isSideOpen} />
				
				<div className="container-fluid pb-50">
					<div className="row">
						<SideBar menuitems={menus} class={isSideOpen} />
						<div className={`main-content ${isSideOpen ? 'col-lg-10' : 'col-lg-12'}`}>
							<div className="pt-70">
								<div className="row">
									<div className="col-lg-12 mb-2">
										<div className="section-title">
											<h2 className="m-0 section-title">{SUBCATEGORY.replace("-", " ")}</h2>
										</div>
									</div>
								</div>
								<div className="row">
									<div className="col-lg-12 p-5">
										<div className="row">{result}</div>
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
				<Footer privacyurl="#" facebookurl="#" twitterurl="#" />
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("submenu-posts");
wrapper ? ReactDOM.render(<SubmenuPosts />, wrapper) : null;