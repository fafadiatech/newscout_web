import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.png';
import { SectionTitle, Menu, SliderItem, SideBox, TabItem, JumboBox } from 'newscout';
import { Navbar, NavbarBrand, Nav, NavItem } from 'reactstrap';

import { MENUS, TRENDING_NEWS, ARTICLE_POSTS } from '../../utils/Constants';
import { getRequest } from '../../utils/Utils';

import 'newscout/assets/Menu.css'
import 'newscout/assets/SideBox.css'
import 'newscout/assets/TabItem.css'
import 'newscout/assets/JumboBox.css'
import 'newscout/assets/SliderItem.css'
import 'newscout/assets/SectionTitle.css'

const DOMAIN = "domain=newscout";
const tabnav_array = [];
const URL = ARTICLE_POSTS+"?"+DOMAIN

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

	getLatestNews = (data) => {
		data.body.results.map((item, index) => {
			if(item.heading){
				var heading_dict = {}
				heading_dict['itemtext'] = item.heading.name
				heading_dict['itemurl'] = item.heading.name.replace(" ", "-").toLowerCase()
				heading_dict['item_id'] = item.heading.category_id
				if(item.heading.name === "Misc"){
					item.heading.submenu.map((sub_item, sub_index) => {
						if(sub_item.name === "Uncategorised"){
							this.getPosts(sub_item.name, sub_item.category_id)
						}
					})
				}
			}
		})
	}

	getPosts = (cat_name, cat_id) => {
		var url = ARTICLE_POSTS+"?"+DOMAIN+"&category="+cat_id
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
			article_dict['src'] = "http://images.newscout.in/unsafe/300x175/left/top/"+decodeURIComponent(item.cover_image)
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

	latestNewsPosts = (data) => {
		var latestnews_array = []
		data.body.results.map((item, index) => {
			var article_dict = {}
			article_dict['id'] = item.id
			article_dict['header'] = item.title
			article_dict['altText'] = item.title
			article_dict['caption'] = item.blurb
			article_dict['source'] = item.source
			article_dict['url'] = item.source_url
			article_dict['src'] = "http://images.newscout.in/unsafe/150x80/left/top/"+decodeURIComponent(item.cover_image)
			if(latestnews_array.length < 4){
				latestnews_array.push(article_dict)
			}
		})
		this.setState({
			latest_news: latestnews_array
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
			article_dict['src'] = "http://images.newscout.in/unsafe/150x80/left/top/"+decodeURIComponent(item.cover_image)
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
			article_dict['src'] = "http://images.newscout.in/unsafe/150x80/left/top/"+decodeURIComponent(item.cover_image)
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
			article_dict['src'] = "http://images.newscout.in/unsafe/600x338/left/top/"+decodeURIComponent(item.cover_image)
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
			item.articles.map((ele, ele_index) => {
				var article_dict = {}
				article_dict['id'] = item.id
				article_dict['header'] = ele.title
				article_dict['altText'] = ele.title
				article_dict['caption'] = ele.blurb
				article_dict['source'] = ele.source
				article_dict['source_url'] = ele.source_url
				article_dict['src'] = "http://images.newscout.in/unsafe/870x550/left/top/"+decodeURIComponent(item.cover_image)
				if(trending_array.length < 4){
					trending_array.push(article_dict)
				}
			})
		})
		this.setState({
			trending: trending_array
		})
	}

	componentWillMount() {
		getRequest(MENUS+"?"+DOMAIN, this.getMenu);
		getRequest(TRENDING_NEWS, this.getTrending);
		getRequest(MENUS+"?"+DOMAIN, this.getLatestNews);
	}

	render() {
		var { menus, trending, latest_news, finance, economics, sector_regional_update, misc } = this.state
		return (
			<React.Fragment>
				<Menu logo={logo} navitems={this.state.menus} url={URL} />
				<div className="pt-70">
					<div className="container">
						<div className="row">
							<div className="col-lg-8 col-12 mb-4">
								<SliderItem slides={trending} />
							</div>
							<div className="col-lg-4 col-12 mb-4">
								<div className="side-box">
									<SectionTitle title="Latest News" />
									<SideBox posts={latest_news} />
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="pt-70">
					<div className="container">
						<div className="row">
							<div className="col-lg-12 col-12 mb-4">
								<div className="tab-box">
									<TabItem tabnav={sector_regional_update} />
								</div>
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