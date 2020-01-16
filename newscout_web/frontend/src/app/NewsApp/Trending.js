import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import logo from './logo.png';
import { CardItem, Menu, SectionTitle } from 'newscout';

import config_data from './config.json';

import 'newscout/assets/Menu.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/SectionTitle.css'

import { MENUS, TRENDING_NEWS, ARTICLE_POSTS } from '../../utils/Constants';
import { getRequest } from '../../utils/Utils';

const DOMAIN = "domain=newscout";
const URL = "/news/search/"

class Trending extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			trending: [],
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

	getTrending = (data) => {
		var trending_array = []
		data.body.results.map((item, index) => {
			item.articles.map((ele, ele_index) => {
				var article_dict = {}
				article_dict['id'] = ele.id;
				article_dict['header'] = ele.title;
				article_dict['altText'] = ele.title;
				article_dict['caption'] = ele.blurb;
				article_dict['source'] = ele.source;
				article_dict['source_url'] = ele.source_url;
				article_dict['date'] = moment(ele.published_on).format('YYYY-MM-DD');
				if(ele.cover_image){
					article_dict['src'] = "http://images.newscout.in/unsafe/336x150/left/top/"+decodeURIComponent(ele.cover_image);
				} else {
					article_dict['src'] = "http://images.newscout.in/unsafe/336x150/left/top/"+config_data.defaultImage;
				}
				trending_array.push(article_dict)
			})
		})
		this.setState({
			trending: trending_array
		})
	}

	componentWillMount() {
		getRequest(MENUS+"?"+DOMAIN, this.getMenu);
		getRequest(TRENDING_NEWS, this.getTrending);
	}

	render() {
		var { menus, trending } = this.state;

		var result = trending.map((item, index) => {
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
				<div className="pt-70">
					<div className="container-fluid">
						<div className="row">
							<div className="col-lg-10 offset-lg-1">
								<div className="side-box">
									<SectionTitle title="Trending" />
								</div>
							</div>
						</div>
						<div className="row">
							<div className="col-lg-10 offset-lg-1">
								<ul className="list-inline">{result}</ul>
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