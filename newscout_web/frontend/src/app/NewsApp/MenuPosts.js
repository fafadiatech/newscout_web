import React from 'react';
import moment from 'moment';
import logo from './logo.png';
import ReactDOM from 'react-dom';
import Slider from "react-slick";
import Skeleton from 'react-loading-skeleton';
import { CardItem, Menu, ImageOverlay, SideBar, Footer } from 'newscout';

import { MENUS, ARTICLE_POSTS } from '../../utils/Constants';
import { getRequest } from '../../utils/Utils';

import 'newscout/assets/Menu.css'
import 'newscout/assets/ImageOverlay.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/Sidebar.css'

import config_data from './config.json';

const URL = "/news/search/";
const submenu_array = [];

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

class MenuPosts extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			category: CATEGORY,
			newsPosts: [],
			menus: [],
			isSideOpen: true,
			domain: "domain="+DOMAIN,
			isLoading: false
		};
	}

	getMenu = (data) => {
		var menus_array = []
		data.body.results.map((item, index) => {
			if(item.heading){
				var heading_dict = {}
				heading_dict['itemtext'] = item.heading.name
				heading_dict['itemurl'] = item.heading.name.replace(" ", "-").toLowerCase()
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
				article_dict['src'] = "http://images.newscout.in/unsafe/425x200/left/top/"+decodeURIComponent(item.cover_image)
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

	componentWillMount() {
		getRequest(MENUS+"?"+this.state.domain, this.getMenu);
		getRequest(MENUS+"?"+this.state.domain, this.getNewsData);
	}

	render() {
		var { menus, newsPosts, isSideOpen, isLoading } = this.state;
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
				<Menu logo={logo} navitems={menus} url={URL} isSlider={true} isSideOpen={this.isSideOpen} />

				<div className="container-fluid">
					<div className="row">
						<SideBar menuitems={menus} class={isSideOpen} />
						<div className={`main-content ${isSideOpen ? 'col-lg-10' : 'col-lg-12'}`}>
							<div className="p-70">{result}</div>
							<div className="footer-section">
								<Footer privacyurl="#" facebookurl="#" twitterurl="#" />
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("menu-posts");
wrapper ? ReactDOM.render(<MenuPosts />, wrapper) : null;