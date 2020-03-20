import React from 'react';
import moment from 'moment';
import logo from './logo.png';
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

import { BASE_URL, MENUS, TRENDING_NEWS, ARTICLE_POSTS, ARTICLE_BOOKMARK, ALL_ARTICLE_BOOKMARK, ARTICLE_LOGOUT } from '../../utils/Constants';
import { getRequest, postRequest } from '../../utils/Utils';

import config_data from './config.json';

var article_array = [];
const URL = "/news/search/"
const cookies = new Cookies();

class Trending extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			page : 0,
			menus: [],
			next: null,
			trending: [],
			previous: null,
			loadingPagination: false,
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
		getRequest(this.state.next, this.getTrending);
	}

	handleScroll = () => {
		if ($(window).scrollTop() >= ($(document).height() - $(window).height()) * 0.6) {
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

	getTrending = (data) => {
		var trending_data = []
		var results = data.body.results.sort((a, b) => 
			new Date(a.created_at) - new Date(b.created_at)
		)
		
		results.map((item, index) => {
			if(item.articles) {
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
			loadingPagination: false,
			isLoading: false
		})
	}

	getTrendingPosts = () => {
		this.setState({isLoading: true})
		getRequest(TRENDING_NEWS+"?"+this.state.domain, this.getTrending);
	}

	isSideOpen = (data) => {
		this.setState({
			isSideOpen: data
		})
	}

	getArticleId = (articleId) => {
		if(cookies.get('full_name')){
			this.fetchArticleBookmark(articleId)
		} else {
			this.toggle()
		}
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

	handleLogout = () => {
		var headers = {"Authorization": "Token "+cookies.get('token'), "Content-Type": "application/json"}
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

	componentDidMount() {
		window.addEventListener('scroll', this.handleScroll, true);
		getRequest(MENUS+"?"+this.state.domain, this.getMenu);
		this.getTrendingPosts()
		if(cookies.get('full_name')){
			this.setState({is_loggedin:true})
			var headers = {"Authorization": "Token "+cookies.get('token'), "Content-Type": "application/json"}
			getRequest(ALL_ARTICLE_BOOKMARK+"?"+this.state.domain, this.getBookmarksArticles, headers);
		}
	}

	componentWillUnmount = () => {
		window.removeEventListener('scroll', this.handleScroll)
	}

	render() {
		var { menus, trending, isLoading, isSideOpen, modal, is_loggedin, bookmark_ids, username } = this.state;

		var result = trending.map((item, index) => {
			return (
					<div className="col-lg-6 mb-4" key={index}>
						{isLoading ?
							<React.Fragment>
								<h3>Loading</h3>
								<Skeleton height={525} />
							</React.Fragment>
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

		return(
			<React.Fragment>
				<Menu
					logo={logo}
					navitems={menus}
					url={URL}
					isSlider={true}
					isSideOpen={this.isSideOpen}
					toggle={this.toggle}
					is_loggedin={is_loggedin}
					username={username}
					handleLogout={this.handleLogout}
				/>
				<div className="container-fluid">
					<div className="row">
						<SideBar menuitems={menus} class={isSideOpen} />
						<div className={`main-content ${isSideOpen ? 'col-lg-10' : 'col-lg-12'}`}>
							<div className="container">
								<div className="pt-50 pb-5">
									<div className="row">
										<div className="col-lg-12 mb-4">
											<div className="section-title">
												<h2 className="m-0 section-title">Trending</h2>
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