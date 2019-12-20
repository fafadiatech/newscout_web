import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import logo from './logo.png';
import { CardItem, Menu, SectionTitle, SideBar, Filter } from 'newscout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

import { MENUS, ARTICLE_POSTS } from '../../utils/Constants';
import { getRequest } from '../../utils/Utils';

import 'newscout/assets/Menu.css'
import 'newscout/assets/Filter.css'
import 'newscout/assets/Sidebar.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/SectionTitle.css'

const tabnav_array = [];
const URL = "/news/search/";
const DOMAIN = "domain=newscout";

import config_data from './config.json';

class SearchResult extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			menus: [],
			searchResult: [],
			isFilterOpen: false,
		};
	}

	getMenu = (data) => {
		var menus_array = []
		data.body.results.map((item, index) => {
			if(item.heading){
				var heading_dict = {}
				heading_dict['itemtext'] = item.heading.name;
				heading_dict['itemurl'] = item.heading.name.replace(" ", "-").toLowerCase();
				heading_dict['item_id'] = item.heading.category_id;
				menus_array.push(heading_dict)
			}
		})
		this.setState({
			menus: menus_array
		})
	}

	toggleFilter = () => {
		this.setState({
			isFilterOpen: !this.state.isFilterOpen
		})
	}

	getSearchResult = (data) => {
		var searchresult_array = []
		data.body.results.map((item, index) => {
			var article_dict = {}
			article_dict['id'] = item.id
			article_dict['altText'] = item.title
			article_dict['header'] = item.title
			article_dict['caption'] = item.blurb
			article_dict['source'] = item.source
			article_dict['source_url'] = item.source_url
			article_dict['date'] = moment(item.published_on).format('YYYY-MM-DD');
			article_dict['src'] = "http://images.newscout.in/unsafe/336x150/left/top/"+decodeURIComponent(item.cover_image)
			searchresult_array.push(article_dict)
		})
		this.setState({
			searchResult: searchresult_array
		})
	}

	componentWillMount() {
		getRequest(MENUS+"?"+DOMAIN, this.getMenu);
		getRequest(ARTICLE_POSTS+"?"+DOMAIN+"&q="+QUERY, this.getSearchResult);
	}

	render() {
		var { menus, searchResult } = this.state;

		var result = searchResult.map((item, index) => {
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

		if(this.state.isFilterOpen === true){
			document.getElementsByTagName("body")[0].style = "overflow:hidden !important";
		} else {
			document.getElementsByTagName("body")[0].style = "overflow:auto";
		}
		return(
			<React.Fragment>
				<Menu logo={logo} navitems={menus} url={URL} />
				<div className="container-fluid">
					<div className="row">
						<SideBar menuitems={menus} />
						<div className="main-content col-lg-10">
							<div className="pt-35">
								<div className="row">
									<div className="col-lg-12">
										<div className="clerfix">
											<div className="float-left">
												<div className="search">
													Search result: <span className="text-capitalize">{QUERY}</span>
												</div>
											</div>
											<div className="float-right">
												<div className="filter" onClick={this.toggleFilter}>
													<FontAwesomeIcon icon={faFilter} />
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="pt-35">
								<div className="row">
									<div className="col-lg-12">
										<ul className="list-inline">
											{result}
										</ul>
									</div>
								</div>
							</div>
						</div>
						<Filter filters={config_data[4].filters} toggleFilter={this.toggleFilter} isFilterOpen={this.state.isFilterOpen} />
					</div>
				</div>
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("search-result");
wrapper ? ReactDOM.render(<SearchResult />, wrapper) : null;