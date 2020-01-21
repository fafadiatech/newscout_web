import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.png';
import { SectionTitle, Menu, SliderItem, SideBox, TabItem, JumboBox, ImageOverlay, ContentOverlay, CardItem } from 'newscout';
import { Navbar, NavbarBrand, Nav, NavItem } from 'reactstrap';

import { MENUS, TRENDING_NEWS, ARTICLE_POSTS } from '../../utils/Constants';
import { getRequest } from '../../utils/Utils';

import 'newscout/assets/Menu.css'
import 'newscout/assets/SideBox.css'
import 'newscout/assets/TabItem.css'
import 'newscout/assets/JumboBox.css'
import 'newscout/assets/SliderItem.css'
import 'newscout/assets/SectionTitle.css'
import 'newscout/assets/ImageOverlay.css'
import 'newscout/assets/ContentOverlay.css'
import 'newscout/assets/CardItem.css'

import config_data from './config.json';

const tabnav_array = [];
const URL = "/news/search/"
const DOMAIN = "domain=newscout";

class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			trending: [],
			menus: [],
			latest_news: [],
			sector_regional_update: [],
			finance: [],
			economics: [],
			misc: []
		}
	}

	getMenu = (data) => {
		var menus_array = []
		data.body.results.map((item, index) => {
			if(item.heading){
				var heading_dict = {}
				heading_dict['itemtext'] = item.heading.name
				heading_dict['itemurl'] = item.heading.name.replace(" ", "-").toLowerCase()
				heading_dict['item_id'] = item.heading.category_id
				menus_array.push(heading_dict)
				this.getPosts(heading_dict['itemtext'], heading_dict['item_id'])
			}
		})
		this.setState({
			menus: menus_array
		})
	}

	getPosts = (cat_name, cat_id) => {
		var url = ARTICLE_POSTS+"?"+DOMAIN+"&category="+cat_name
		if(cat_name == "Uncategorised"){
			getRequest(url, this.latestNewsPosts)
		} else if(cat_name == "Finance") {
			getRequest(url, this.financePosts)
		} else if(cat_name == "Economics") {
			getRequest(url, this.economicPosts)
		} else if(cat_name == "Misc") {
			getRequest(url, this.miscPosts)
		} else {
			getRequest(url, this.tabPosts, false, cat_name)
		}
	}

	tabPosts = (data, extra_data) => {
		var tabnav_dict = {}
		var tab_posts = []
		data.body.results.map((item, index) => {
			var article_dict = {}
			article_dict['id'] = item.id
			article_dict['header'] = item.title
			article_dict['altText'] = item.title
			article_dict['caption'] = item.blurb
			article_dict['source'] = item.source
			article_dict['url'] = item.source_url
			if(item.cover_image){
				article_dict['src'] = "http://images.newscout.in/unsafe/300x175/left/top/"+decodeURIComponent(item.cover_image)
			} else {
				article_dict['src'] = "http://images.newscout.in/unsafe/300x175/left/top/"+config_data.defaultImage
			}
			if(tab_posts.length < 4){
				tab_posts.push(article_dict)
			}
		})
		tabnav_dict['tab_title'] = extra_data
		tabnav_dict['tab_posts'] = tab_posts
		tabnav_array.push(tabnav_dict)
		this.setState({
			sector_regional_update: tabnav_array
		})
	}

	financePosts = (data) => {
		var financeposts_array = []
		data.body.results.map((item, index) => {
			var article_dict = {}
			article_dict['id'] = item.id
			article_dict['header'] = item.title
			article_dict['altText'] = item.title
			article_dict['caption'] = item.blurb
			article_dict['source'] = item.source
			article_dict['url'] = item.source_url
			if(item.cover_image){
				article_dict['src'] = "http://images.newscout.in/unsafe/150x80/left/top/"+decodeURIComponent(item.cover_image)
			} else {
				article_dict['src'] = "http://images.newscout.in/unsafe/150x80/left/top/"+config_data.defaultImage
			}
			if(financeposts_array.length < 4){
				financeposts_array.push(article_dict)
			}
		})
		this.setState({
			finance: financeposts_array
		})
	}

	economicPosts = (data) => {
		var economicposts_array = []
		data.body.results.map((item, index) => {
			var article_dict = {}
			article_dict['id'] = item.id
			article_dict['header'] = item.title
			article_dict['altText'] = item.title
			article_dict['caption'] = item.blurb
			article_dict['source'] = item.source
			article_dict['url'] = item.source_url
			if(item.cover_image){
				article_dict['src'] = "http://images.newscout.in/unsafe/150x80/left/top/"+decodeURIComponent(item.cover_image)
			} else {
				article_dict['src'] = "http://images.newscout.in/unsafe/150x80/left/top/"+config_data.defaultImage
			}
			if(economicposts_array.length < 4){
				economicposts_array.push(article_dict)
			}
		})
		this.setState({
			economics: economicposts_array
		})
	}

	miscPosts = (data) => {
		var miscposts_array = []
		data.body.results.map((item, index) => {
			var article_dict = {}
			article_dict['id'] = item.id
			article_dict['header'] = item.title
			article_dict['altText'] = item.title
			article_dict['caption'] = item.blurb
			article_dict['source'] = item.source
			article_dict['url'] = item.source_url
			if(item.cover_image){
				article_dict['src'] = "http://images.newscout.in/unsafe/600x338/left/top/"+decodeURIComponent(item.cover_image)
			} else {
				article_dict['src'] = "http://images.newscout.in/unsafe/600x338/left/top/"+config_data.defaultImage
			}
			if(miscposts_array.length < 4){
				miscposts_array.push(article_dict)
			}
		})
		this.setState({
			misc: miscposts_array
		})
	}

	getTrending = (data) => {
		var trending_array = []
		data.body.results.map((item, index) => {
			var articles = item.articles;
			if(articles.length < 3){
				for (var ele = 0; ele < articles.length; ele++) {
					if(articles[ele].cover_image){
						var article_dict = {}
						article_dict['id'] = item.id
						article_dict['header'] = articles[ele].title
						article_dict['altText'] = articles[ele].title
						article_dict['caption'] = articles[ele].blurb
						article_dict['source'] = articles[ele].source
						article_dict['category'] = articles[ele].category
						article_dict['slug'] = articles[ele].slug
						article_dict['source_url'] = articles[ele].source_url
						article_dict['src'] = "http://images.newscout.in/unsafe/870x550/left/top/"+decodeURIComponent(articles[ele].cover_image)
						trending_array.push(article_dict)
						break;
					}
				}
			}
		})
		this.setState({
			trending: trending_array
		})
	}

	componentDidMount() {
		getRequest(MENUS+"?"+DOMAIN, this.getMenu);
		getRequest(TRENDING_NEWS+"?"+DOMAIN, this.getTrending);
	}

	render() {
		var { menus, trending, latest_news, finance, economics, sector_regional_update, misc } = this.state
		console.log(trending)
		return (
			<React.Fragment>
				<Menu logo={logo} navitems={menus} url={URL} isSlider={false} />
				<div className="pt-50">
					<div className="container">
						<div className="row">
							<div className="col-lg-7 col-12 mb-4">
								{trending.length > 0 ?
									<ImageOverlay 
												image={trending[0].src}
												title={trending[0].header}
												description={trending[0].caption}
												uploaded_by={trending[0].source}
												source_url={trending[0].source_url}
												slug_url={trending[0].slug}
												category={trending[0].category}
									/>
								: ''
								}
							</div>
							<div className="col-lg-5 col-12 mb-4">
								{trending.length > 0 ?
									<ContentOverlay
												title={trending[1].header}
												description={trending[1].caption}
												uploaded_by={trending[1].source}
												source_url={trending[1].source_url}
												slug_url={trending[1].slug}
												category={trending[1].category}
									/>
								: ''
								}
							</div>
						</div>
					</div>
				</div>
				<div className="pt-50">
					<div className="container">
						<div className="row">
							<div className="col-lg-12 col-12 mb-4">
								<h2>Sector Updates</h2>
							</div>
						</div>
						<div className="row">
							<div className="col-lg-4">
								{trending.length > 0 ?
									<CardItem
										image={trending[0].src}
										title={trending[0].header}
										description={trending[0].caption}
										uploaded_by={trending[0].source}
										source_url={trending[0].source_url}
										slug_url={trending[0].slug}
										category={trending[0].category}
									/>
								: ''
								}
							</div>
							<div className="col-lg-4">
								{trending.length > 0 ?
									<CardItem
										image={trending[0].src}
										title={trending[0].header}
										description={trending[0].caption}
										uploaded_by={trending[0].source}
										source_url={trending[0].source_url}
										slug_url={trending[0].slug}
										category={trending[0].category}
									/>
								: ''
								}
							</div>
							<div className="col-lg-4">
								{trending.length > 0 ?
									<CardItem
										image={trending[0].src}
										title={trending[0].header}
										description={trending[0].caption}
										uploaded_by={trending[0].source}
										source_url={trending[0].source_url}
										slug_url={trending[0].slug}
										category={trending[0].category}
									/>
								: ''
								}
							</div>
							<div className="col-lg-4">
								{trending.length > 0 ?
									<CardItem
										image={trending[0].src}
										title={trending[0].header}
										description={trending[0].caption}
										uploaded_by={trending[0].source}
										source_url={trending[0].source_url}
										slug_url={trending[0].slug}
										category={trending[0].category}
									/>
								: ''
								}
							</div>
						</div>
						<div className="col-lg-6 col-12 mb-4">
							<div className="side-box">
								<SectionTitle title="Economics" />
								<SideBox posts={economics} />
							</div>
						</div>
					</div>
				</div>
				<div className="pt-70 bg-gray">
					<div className="container">
						<div className="row">
							<div className="col-lg-6 col-12 mb-4">
								<div className="side-box">
									<SectionTitle title="Finance" />
									<SideBox posts={finance} />
								</div>
							</div>
							<div className="col-lg-6 col-12 mb-4">
								<div className="side-box">
									<SectionTitle title="Economics" />
									<SideBox posts={economics} />
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="pt-70">
					<div className="container">
						<div className="row">
							<div className="col-lg-12 col-12 mb-4">
								<div className="side-box">
									<SectionTitle title="Misc" />
									<JumboBox posts={misc} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

const wrapper = document.getElementById("index");
wrapper ? ReactDOM.render(<App />, wrapper) : null;