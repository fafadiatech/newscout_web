import React from 'react';
import moment from 'moment';
import logo from './logo.png';
import ReactDOM from 'react-dom';
import Slider from "react-slick";
import Cookies from 'universal-cookie';
import Skeleton from 'react-loading-skeleton';
import { CardItem, Menu, ImageOverlay, SideBar, Footer } from 'newscout';

import { MENUS, ARTICLE_POSTS, ARTICLE_LOGOUT } from '../../utils/Constants';
import { getRequest } from '../../utils/Utils';

import Auth from './Auth';

import 'newscout/assets/Menu.css'
import 'newscout/assets/ImageOverlay.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/Sidebar.css'

import config_data from './config.json';

var article_array = [];
const submenu_array = [];
const URL = "/news/search/"
const cookies = new Cookies();

const settings = {
	dots: false,
	infinite: false,
	speed: 500,
	slidesToShow: 4,
	slidesToScroll: 4,
	initialSlide: 0,
	responsive: [
		{
			breakpoint: 1024,
			settings: {
				slidesToShow: 4,
				slidesToScroll: 4,
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

class MenuPosts extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			category: CATEGORY,
			newsPosts: [],
			menus: [],
			isSideOpen: true,
			domain: "domain="+DOMAIN,
			isLoading: false,
			modal: false,
			is_loggedin: false,
			is_loggedin_validation: false,
			username: cookies.get('full_name'),
			bookmark_ids: [],
			isChecked: false
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
		if(data === true){
			var head  = document.getElementsByTagName('head')[0];
			var link  = document.createElement('link');
			link.id = 'dark_style'
			link.rel  = 'stylesheet';
			link.type = 'text/css';
			link.href = '/static/css/dark-style.css';
			link.media = 'all';
			head.appendChild(link);
			cookies.set('isChecked', true, { path: '/' });
		} else {
			if(document.getElementById("dark_style")){
				document.getElementById("dark_style").disabled = true;
			}
			cookies.remove('isChecked', { path: '/' });
		}
	};

	getTheme = () => {
		if(cookies.get('isChecked')){
			var head  = document.getElementsByTagName('head')[0];
			var link  = document.createElement('link');
			link.id = 'dark_style'
			link.rel  = 'stylesheet';
			link.type = 'text/css';
			link.href = '/static/css/dark-style.css';
			link.media = 'all';
			head.appendChild(link);
			this.setState({ isChecked: true })
		} else {
			if(document.getElementById("dark_style")){
				document.getElementById("dark_style").disabled = true;
			}
			this.setState({ isChecked: false })
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
				var heading = item.heading.name.replace(" ", "-").toLowerCase()
				if(heading === CATEGORY){
					this.getPosts(item.heading.name, item.heading.category_id, item.heading.submenu)
				}
			}
		})
	}

	getPosts = (cat_name, cat_id, submenu) => {
		submenu.map((item, index) => {
			this.setState({isLoading: true})
			var url = ARTICLE_POSTS+"?"+this.state.domain+"&category="+item.name
			getRequest(url, this.newsData, false, item)
		})
	}

	newsData = (data, extra_data) => {
		var news_dict = {}
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
				article_dict['published_on'] = moment(item.published_on).format('MMMM D, YYYY')
				article_dict['src'] = "http://images.newscout.in/unsafe/368x200/left/top/"+decodeURIComponent(item.cover_image)
				if(news_array.length <= 9){
					news_array.push(article_dict)
				}
			}
		})
		news_dict['menuname'] = extra_data.name
		news_dict['menuid'] = extra_data.category_id
		news_dict['posts'] = news_array
		submenu_array.push(news_dict)
		var final_data = submenu_array.sort(function(a, b){
			return a.menuid - b.menuid
		})
		this.setState({
			newsPosts: final_data,
			isLoading: false
		})
	}

	isSideOpen = (data) => {
		this.setState({
			isSideOpen: data
		})
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
			is_captcha: true,
			bookmark_ids: []
		})
    }

	componentDidMount() {
		getRequest(MENUS+"?"+this.state.domain, this.getMenu);
		getRequest(MENUS+"?"+this.state.domain, this.getNewsData);
		if(cookies.get('full_name')){
			this.setState({is_loggedin:true})
		}
		if(cookies.get('isChecked')){
			this.setState({ isChecked: true })
		} else {
			this.setState({ isChecked: false })
		}
		this.getTheme()
	}

	render() {
		var { menus, newsPosts, isSideOpen, isLoading, username, is_loggedin, modal, isChecked } = this.state;
		
		var result = newsPosts.map((item, index) => {
			return (
				<React.Fragment key={index}>
					<div className="row">
						<div className="col-lg-12 col-12 mb-2">
							<div className="section-title">
								<h2 className="m-0 section-title">{item.menuname}</h2>
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-lg-12 mb-5">
							<Slider {...settings}>
								{item.posts.map((sub_item, sub_index) => {
									return (
										<React.Fragment>
											{isLoading ?
												<Skeleton height={525} />
											:
												<ImageOverlay 
													image={sub_item.src}
													title={sub_item.header}
													description={sub_item.caption}
													uploaded_by={sub_item.source}
													source_url={sub_item.source_url}
													slug_url={sub_item.slug}
													category={sub_item.category}
													size="sm"
												/>
											}
										</React.Fragment>
									)
								})}
								<div className="card-container">
									<div className="view-all">
										<a href={`/news/${CATEGORY}/${item.menuname.replace(" ", "-").toLowerCase()}/`}>View All +</a>
									</div>
								</div>
							</Slider>
						</div>
					</div>
				</React.Fragment>
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
					toggleSwitch={this.toggleSwitch}
					isChecked={isChecked}
				/>
				<div className="container-fluid">
					<div className="row">
						<SideBar menuitems={menus} class={isSideOpen} />
						<div className={`main-content ${isSideOpen ? 'col-lg-10' : 'col-lg-12'}`}>
							<div className="p-70 pb-5">{result}</div>
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