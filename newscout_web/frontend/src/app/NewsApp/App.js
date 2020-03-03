import React from 'react';
import moment from 'moment';
import logo from './logo.png';
import ReactDOM from 'react-dom';
import Slider from "react-slick";
import Skeleton from 'react-loading-skeleton';
import { Navbar, NavbarBrand, Nav, NavItem } from 'reactstrap';
import { Menu, ImageOverlay, ContentOverlay, VerticleCardItem, HorizontalCardItem, SideBar } from 'newscout';

import { MENUS, TRENDING_NEWS, ARTICLE_POSTS } from '../../utils/Constants';
import { getRequest } from '../../utils/Utils';

import 'newscout/assets/Menu.css'
import 'newscout/assets/ImageOverlay.css'
import 'newscout/assets/ContentOverlay.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/Sidebar.css'

import config_data from './config.json';

const tabnav_array = [];
const URL = "/news/search/"

const settings = {
	dots: false,
	infinite: false,
	speed: 500,
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
			domain: "domain="+DOMAIN,
			isLoading: false,
			isSideOpen: true,
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
						article_dict['slug'] = "/news/article/"+articles[ele].slug
						article_dict['source_url'] = articles[ele].source_url
						article_dict['src'] = "http://images.newscout.in/unsafe/870x550/left/top/"+decodeURIComponent(articles[ele].cover_image)
						trending_array.push(article_dict)
						break;
					}
				}
			}
		})
		this.setState({
			trending: trending_array,
			isLoading: false
		})
	}

	getPosts = (cat_name, cat_id) => {
		var url = ARTICLE_POSTS+"?"+this.state.domain+"&category="+cat_name
		if(cat_name == "Uncategorised"){
			this.setState({isLoading: true})
			getRequest(url, this.latestNewsPosts)
		} else if(cat_name == "Finance") {
			this.setState({isLoading: true})
			getRequest(url, this.financePosts)
		} else if(cat_name == "Economics") {
			this.setState({isLoading: true})
			getRequest(url, this.economicPosts)
		} else if(cat_name == "Misc") {
			this.setState({isLoading: true})
			getRequest(url, this.miscPosts)
		} else if(cat_name == "Sector Updates") {
			this.setState({isLoading: true})
			getRequest(url, this.sectorUpdatePosts)
		} else if(cat_name == "Regional Updates") {
			this.setState({isLoading: true})
			getRequest(url, this.regionalUpdatePosts)
		}
	}

	sectorUpdatePosts = (data) => {
		var sectorupdateposts_array = []
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
				if(sectorupdateposts_array.length < 3){
					sectorupdateposts_array.push(article_dict)
				}
			}
		})
		this.setState({
			sector_update: sectorupdateposts_array
		})
	}

	regionalUpdatePosts = (data) => {
		var regionalupdateposts_array = []
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
				article_dict['src'] = "http://images.newscout.in/unsafe/368x322/left/top/"+decodeURIComponent(item.cover_image)
				if(regionalupdateposts_array.length < 4){
					regionalupdateposts_array.push(article_dict)
				}
			}
		})
		this.setState({
			regional_update: regionalupdateposts_array
		})
	}

	financePosts = (data) => {
		var financeposts_array = []
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
				article_dict['src'] = "http://images.newscout.in/unsafe/368x200/left/top/"+decodeURIComponent(item.cover_image)
				if(financeposts_array.length < 8){
					financeposts_array.push(article_dict)
				}
			}
		})
		this.setState({
			finance: financeposts_array
		})
	}

	economicPosts = (data) => {
		var economicposts_array = []
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
				article_dict['src'] = "http://images.newscout.in/unsafe/368x322/left/top/"+decodeURIComponent(item.cover_image)
				if(economicposts_array.length < 4){
					economicposts_array.push(article_dict)
				}
			}
		})
		this.setState({
			economics: economicposts_array
		})
	}

	miscPosts = (data) => {
		var miscposts_array = []
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
				article_dict['src'] = "http://images.newscout.in/unsafe/368x322/left/top/"+decodeURIComponent(item.cover_image)
				if(miscposts_array.length < 3){
					miscposts_array.push(article_dict)
				}
			}
		})
		this.setState({
			misc: miscposts_array
		})
	}

	isSideOpen = (data) => {
		this.setState({
			isSideOpen: data
		})
	}

	componentDidMount() {
		getRequest(TRENDING_NEWS+"?"+this.state.domain, this.getTrending);
		getRequest(MENUS+"?"+this.state.domain, this.getMenu);
	}

	render() {
		var { menus, trending, finance, economics, sector_update, regional_update, misc, isLoading, isSideOpen } = this.state
		
		var sector_update = sector_update.map((item, index) => {
			return(
				<div className="col-lg-4 mb-4">
					{isLoading ?
						<Skeleton height={525} />
					:
						<VerticleCardItem
							image={item.src}
							title={item.header}
							description={item.caption}
							uploaded_by={item.source}
							source_url={item.source_url}
							slug_url={item.slug}
							category={item.category}
							hash_tags={item.hash_tags}
							uploaded_on={item.published_on}
						/>
					}
				</div>
			)
		})

		var regional_update = regional_update.map((item, index) => {
			return(
				<div className="col-lg-6 mb-4">
					{isLoading ?
						<Skeleton height={250} />
					:
						<HorizontalCardItem
							image={item.src}
							title={item.header}
							description={item.caption}
							uploaded_by={item.source}
							source_url={item.source_url}
							slug_url={item.slug}
							category={item.category}
							hash_tags={item.hash_tags}
							uploaded_on={item.published_on}
						/>
					}
				</div>
			)
		})

		var finance = finance.map((item, index) => {
			return (
				<React.Fragment>
					{isLoading ?
						<Skeleton height={230} />
					:
						<ImageOverlay 
							image={item.src}
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
			return(
				<div className="col-lg-6 mb-4">
					{isLoading ?
						<Skeleton height={230} />
					:
						<HorizontalCardItem
							image={item.src}
							title={item.header}
							description={item.caption}
							uploaded_by={item.source}
							source_url={item.source_url}
							slug_url={item.slug}
							category={item.category}
							hash_tags={item.hash_tags}
							uploaded_on={item.published_on}
						/>
					}
				</div>
			)
		})

		var misc = misc.map((item, index) => {
			return(
				<div className="col-lg-4 mb-4">
					{isLoading ?
						<Skeleton height={525} />
					:
						<VerticleCardItem
							image={item.src}
							title={item.header}
							description={item.caption}
							uploaded_by={item.source}
							source_url={item.source_url}
							slug_url={item.slug}
							category={item.category}
							hash_tags={item.hash_tags}
							uploaded_on={item.published_on}
						/>
					}
				</div>
			)
		})

		return (
			<React.Fragment>
				<Menu logo={logo} navitems={menus} url={URL} isSlider={true} isSideOpen={this.isSideOpen} />
				<div className="container-fluid">
					<div className="row">
						<SideBar menuitems={menus} class={isSideOpen} />
						<div className={`main-content ${isSideOpen ? 'col-lg-10' : 'col-lg-12'}`}>
							<div className="container">
								<div className="pt-50">
									<div className="row">
										<div className="col-lg-7 col-12 mb-4">
											<React.Fragment>
												{isLoading ?
													<Skeleton height={500} />
												:
													<React.Fragment>
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
													</React.Fragment>
												}
											</React.Fragment>
										</div>
										<div className="col-lg-5 col-12 mb-4">
											<React.Fragment>
												{isLoading ?
													<Skeleton height={500} />
												:
													<React.Fragment>
														{trending.length > 0 ?
															<ContentOverlay
																title={trending[1].header}
																description={trending[1].caption}
																uploaded_by={trending[1].source}
																source_url={trending[1].source_url}
																slug_url={trending[1].slug}
																category={trending[1].category}
															/>
														: ""
														}
													</React.Fragment>
												}
											</React.Fragment>
										</div>
									</div>
								</div>
				
								<div className="pt-50">
									<div className="row">
										<div className="col-lg-12 col-12 mb-4">
											<div className="section-title">
												<h2 className="m-0 section-title">Sector Updates</h2>
											</div>
										</div>
									</div>
									<div className="row">{sector_update}</div>
								</div>

								<div className="pt-50">
									<div className="row">
										<div className="col-lg-12 col-12 mb-4">
											<div className="section-title">
												<h2 className="m-0 section-title">Regional Updates</h2>
											</div>
										</div>
									</div>
									<div className="row">{regional_update}</div>
								</div>

								<div className="pt-50">
									<div className="row">
										<div className="col-lg-12 col-12 mb-4">
											<div className="section-title">
												<h2 className="m-0 section-title">Finance</h2>
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
												<h2 className="m-0 section-title">Economics</h2>
											</div>
										</div>
									</div>
									<div className="row">{economics}</div>
								</div>

								<div className="pt-50">
									<div className="row">
										<div className="col-lg-12 col-12 mb-4">
											<div className="section-title">
												<h2 className="m-0 section-title">Misc</h2>
											</div>
										</div>
									</div>
									<div className="row">{misc}</div>
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