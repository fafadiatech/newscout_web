import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import logo from './logo.png';
import { CardItem, Menu, SectionTitle, SideBar } from 'newscout';

import { MENUS, ARTICLE_POSTS } from '../../utils/Constants';
import { getRequest } from '../../utils/Utils';

import './style.css';
import 'newscout/assets/Menu.css';
import 'newscout/assets/CardItem.css';
import 'newscout/assets/SectionTitle.css';
import 'newscout/assets/Sidebar.css';

import config_data from './config.json';

const DOMAIN = "domain=newscout";
const URL = "/news/search/";

class LatestNews extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			latestnews: [],
			menus: [],
			loading: false,
			page : 0,
			next: null,
			previous: null,
		};
	}

	getNext = () => {
		this.setState({
			loading: true,
			page : this.state.page + 1
		})
		getRequest(this.state.next, this.latestNewsPosts);
	}

	handleScroll = () => {
		if ($(window).scrollTop() == $(document).height() - $(window).height()) {
			if (!this.state.loading && this.state.next){
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
		getRequest(url, this.latestNewsPosts)
	}

	latestNewsPosts = (data) => {
		var latestnews_array = []
		data.body.results.map((item, index) => {
			var article_dict = {}
			article_dict['id'] = item.id
			article_dict['altText'] = item.title
			article_dict['header'] = item.title
			article_dict['caption'] = item.blurb
			article_dict['source'] = item.source
			article_dict['source_url'] = item.source_url
			article_dict['date'] = moment(item.published_on).format('YYYY-MM-DD');
			if(item.cover_image){
				article_dict['src'] = "http://images.newscout.in/unsafe/336x150/left/top/"+decodeURIComponent(item.cover_image)
			} else {
				article_dict['src'] = "http://images.newscout.in/unsafe/336x150/left/top/"+config_data.defaultImage;
			}
			latestnews_array.push(article_dict)
		})
		var results = [
			...this.state.latestnews,
			...latestnews_array
		]
		this.setState({
			latestnews: results,
			next: data.body.next,
			previous: data.body.previous,
			loading: false
		})
	}

	componentDidMount() {
		window.addEventListener('scroll', this.handleScroll, true);
		getRequest(MENUS+"?"+DOMAIN, this.getMenu);
		getRequest(MENUS+"?"+DOMAIN, this.getLatestNews);
	}

	componentWillUnmount = () => {
		window.removeEventListener('scroll', this.handleScroll)
	}

	render() {
		var { menus, latestnews } = this.state;

		var result = latestnews.map((item, index) => {
			return (
				<li className="list-inline-item">
					<div className="card-container">
						<CardItem 
							image={item.src}
							title={item.header}
							description={item.caption}
							uploaded_on={item.date}
							uploaded_by={item.source}
							source_url={item.source_url}
							posturl={`/news/article/${item.id}/`} />
					</div>
				</li>
			)
		})

		return(
			<React.Fragment>
				<Menu logo={logo} navitems={menus} url={URL} />
				<div className="container-fluid">
					<div className="row">
						<SideBar menuitems={menus} />
						<div className="main-content col-lg-10">
							<div className="pt-70">
								<div className="row">
									<div className="col-lg-12">
										<div className="side-box">
											<SectionTitle title="Latest News" />
										</div>
									</div>
								</div>
								<div className="row">
									<div className="col-lg-12">
										<ul className="list-inline">{result}</ul>
										{
											this.state.loading ?
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
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("latest-news");
wrapper ? ReactDOM.render(<LatestNews />, wrapper) : null;