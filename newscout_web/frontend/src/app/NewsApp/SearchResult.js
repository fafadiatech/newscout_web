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

var query_array = [];
var final_query = "";
const tabnav_array = [];
const URL = "/news/search/";
const DOMAIN = "domain=newscout";

class SearchResult extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			menus: [],
			searchResult: [],
			isFilterOpen: false,
			categories: [],
			sources: [],
			hashtags: [],
			filters: [],
			final_query: ""
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
		const filters = [];
		var searchresult_array = [];
		var source_filters = data.body.filters.source;
		var hashtags_filters = data.body.filters.hash_tags;
		var cat_filters = data.body.filters.category;
		if(cat_filters) {
			var cat_array = [];
			cat_filters.map((item, index) => {
				if(item.key !== ""){
					var category_dict = {}
					category_dict['label'] = item.key
					category_dict['value'] = item.key
					cat_array.push(category_dict)
				}
			})
			filters.push({"catitems":"Category" ,"subitem": cat_array})
			this.setState({
				filters: filters
			})
		}
		if(source_filters) {
			var source_array = [];
			source_filters.map((item, index) => {
				if(item.key !== ""){
					var source_dict = {}
					source_dict['label'] = item.key
					source_dict['value'] = item.key
					source_array.push(source_dict)
				}
			})
			filters.push({"catitems":"Source" ,"subitem": source_array})
			this.setState({
				filters: filters
			})
		} 
		if(hashtags_filters) {
			var hashtags_array = [];
			hashtags_filters.map((item, index) => {
				if(item.key !== ""){
					var hashtags_dict = {}
					hashtags_dict['label'] = item.key
					hashtags_dict['value'] = item.key
					hashtags_array.push(hashtags_dict)
				}
			})
			filters.push({"catitems":"Hash Tags" ,"subitem": hashtags_array})
			this.setState({
				filters: filters
			})
		}
		
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

	queryFilter = (data, checked) => {
		if(checked == true){
			query_array.push(data);
		} else {
			query_array.splice(query_array.indexOf(data), 1);
		}
		final_query = query_array.join("&");
		this.setState({
			final_query: final_query
		})

		if (history.pushState) {
			getRequest(ARTICLE_POSTS+"?"+DOMAIN+"&q="+QUERY+"&"+final_query, this.getSearchResult);
			var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname +"?q="+QUERY;
			if(final_query){
		    	newurl = newurl+"&"+final_query;
			}
		    window.history.pushState({},'',newurl);
		}
	}

	componentWillMount() {
		getRequest(MENUS+"?"+DOMAIN, this.getMenu);
		if(this.state.final_query){
			getRequest(ARTICLE_POSTS+"?"+DOMAIN+"&q="+QUERY+"&"+this.state.final_query, this.getSearchResult);
		} else {
			getRequest(ARTICLE_POSTS+"?"+DOMAIN+"&q="+QUERY, this.getSearchResult);
		}
	}

	render() {
		var { menus, searchResult, filters, isFilterOpen } = this.state;

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

		if(isFilterOpen === true){
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
						<Filter filters={filters} toggleFilter={this.toggleFilter} isFilterOpen={isFilterOpen} query={this.queryFilter} />
					</div>
				</div>
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("search-result");
wrapper ? ReactDOM.render(<SearchResult />, wrapper) : null;