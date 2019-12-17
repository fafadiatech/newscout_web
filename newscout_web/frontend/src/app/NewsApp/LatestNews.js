import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import logo from './logo.png';
import { CardItem, Menu, SectionTitle, SideBar } from 'newscout';

import { MENUS, ARTICLE_POSTS } from '../../utils/Constants';
import { getRequest } from '../../utils/Utils';

import 'newscout/assets/Menu.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/SectionTitle.css'
import 'newscout/assets/Sidebar.css'

const DOMAIN = "domain=newscout";

class LatestNews extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			latestnews: [],
			menus: [],
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
		console.log(data)
		var latestnews_array = []
		data.body.results.map((item, index) => {
			var article_dict = {}
			article_dict['src'] = "http://images.newscout.in/unsafe/336x150/left/top/"+decodeURIComponent(item.cover_image)
			article_dict['altText'] = item.title
			article_dict['header'] = item.title
			article_dict['caption'] = item.blurb
			article_dict['source'] = item.source
			article_dict['url'] = item.source_url
			article_dict['date'] = moment(item.published_on).format('YYYY-MM-DD');
			latestnews_array.push(article_dict)
		})
		this.setState({
			latestnews: latestnews_array
		})
	}

	componentWillMount() {
		getRequest(MENUS+"?"+DOMAIN, this.getMenu);
		getRequest(MENUS+"?"+DOMAIN, this.getLatestNews);
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
							posturl={item.source_url} />
					</div>
				</li>
			)
		})

		return(
			<React.Fragment>
				<Menu logo={logo} navitems={menus} />
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
										<ul className="list-inline">
											{result}
										</ul>
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