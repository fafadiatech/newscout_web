import React from 'react';
import moment from 'moment';
import logo from './logo.png';
import ReactDOM from 'react-dom';
import Skeleton from 'react-loading-skeleton';
import { CardItem, Menu, VerticleCardItem, SideBar } from 'newscout';

import config_data from './config.json';

import './style.css';
import 'newscout/assets/Menu.css';
import 'newscout/assets/CardItem.css';
import 'newscout/assets/ImageOverlay.css'
import 'newscout/assets/Sidebar.css'

import { MENUS, TRENDING_NEWS, ARTICLE_POSTS } from '../../utils/Constants';
import { getRequest } from '../../utils/Utils';

const URL = "/news/search/"

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
		};
	}

	getNext = () => {
		this.setState({
			loadingPagination: true,
			page : this.state.page + 1
		})
		getRequest(this.state.next, this.getTrending);
	}

	handleScroll = () => {
		if ($(window).scrollTop() == $(document).height() - $(window).height()) {
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
				heading_dict['itemurl'] = item.heading.name.replace(" ", "-").toLowerCase()
				heading_dict['item_id'] = item.heading.category_id
				menus_array.push(heading_dict)
			}
		})
		this.setState({
			menus: menus_array
		})
	}

	getTrending = (data) => {
		var trending_array = []
		data.body.results.map((item, index) => {
			item.articles.map((ele, ele_index) => {
				if(ele.cover_image){
					var article_dict = {}
					article_dict['id'] = ele.id;
					article_dict['header'] = ele.title;
					article_dict['altText'] = ele.title;
					article_dict['caption'] = ele.blurb;
					article_dict['source'] = ele.source;
					article_dict['slug'] = "/news/article/"+ele.slug
					article_dict['category'] = ele.category
					article_dict['hash_tags'] = ele.hash_tags
					article_dict['published_on'] = moment(ele.published_on).format('D MMMM YYYY')
					article_dict['src'] = "http://images.newscout.in/unsafe/368x276/left/top/"+decodeURIComponent(ele.cover_image);
					trending_array.push(article_dict)
				}
			})
		})
		var results = [
			...this.state.trending,
			...trending_array
		]
		this.setState({
			trending: results,
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

	componentDidMount() {
		window.addEventListener('scroll', this.handleScroll, true);
		getRequest(MENUS+"?"+this.state.domain, this.getMenu);
		this.getTrendingPosts()
	}

	componentWillUnmount = () => {
		window.removeEventListener('scroll', this.handleScroll)
	}

	render() {
		var { menus, trending, isLoading, isSideOpen } = this.state;

		var result = trending.map((item, index) => {
			return (
				<div className="col-lg-4 mb-4">
					{isLoading ?
						<React.Fragment>
							<h3>Loading</h3>
							<Skeleton height={525} />
						</React.Fragment>
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

		return(
			<React.Fragment>
				<Menu logo={logo} navitems={menus} url={URL} isSlider={true} isSideOpen={this.isSideOpen} />
				<div className="container-fluid">
					<div className="row">
						<SideBar menuitems={menus} class={isSideOpen} />
						<div className={`main-content ${isSideOpen ? 'col-lg-10' : 'col-lg-12'}`}>
							<div className="container">
								<div className="pt-50">
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
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("trending");
wrapper ? ReactDOM.render(<Trending />, wrapper) : null;