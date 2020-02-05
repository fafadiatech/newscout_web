import React from 'react';
import moment from 'moment';
import logo from './logo.png';
import ReactDOM from 'react-dom';
import { CardItem, Menu, SectionTitle, SideBox } from 'newscout';

import { MENUS, ARTICLE_DETAIL_URL } from '../../utils/Constants';
import { getRequest } from '../../utils/Utils';

import 'newscout/assets/Menu.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/SectionTitle.css'
import 'newscout/assets/SideBox.css'

import config_data from './config.json';

const URL = "/news/search/";

class ArticleDetail extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			menus: [],
			article: {},
			recommendations: [],
			domain: "domain="+DOMAIN,
			article_id: ""
		};
	}

	getArticleDetail = (data) => {
		var state = this.state;
		state.article.id = data.body.article.id;
		state.article.altText = data.body.article.title;
		state.article.header = data.body.article.title;
		state.article.caption = data.body.article.blurb;
		state.article.source = data.body.article.source;
		state.article.source_url = data.body.article.source_url;
		state.article.date = moment(data.body.article.published_on).format('YYYY-MM-DD');
		if(data.body.article.cover_image){
			state.article.src = "http://images.newscout.in/unsafe/1080x610/smart/"+decodeURIComponent(data.body.article.cover_image);
		} else {
			state.article.src = "http://images.newscout.in/unsafe/fit-in/1080x610/smart/"+config_data.defaultImage;
		}
		getRequest(ARTICLE_DETAIL_URL+state.article.id+"/recommendations/?"+this.state.domain, this.getRecommendationsResults);
		this.setState(state)
	}

	getRecommendationsResults = (data) => {
		var recommendations_array = []
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
				article_dict['src'] = "http://images.newscout.in/unsafe/fit-in/150x80/left/top/"+config_data.defaultImage
			}
			if(recommendations_array.length < 5){
				recommendations_array.push(article_dict)
			}
		})
		this.setState({
			recommendations: recommendations_array
		})
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

	componentDidMount() {
		getRequest(MENUS+"?"+this.state.domain, this.getMenu);
		getRequest(ARTICLE_DETAIL_URL+SLUG+"?"+this.state.domain, this.getArticleDetail);
	}

	render() {
		var { menus, article, recommendations } = this.state;

		return(
			<React.Fragment>
				<Menu logo={logo} navitems={menus} url={URL} isSlider={false} />
				<div className="pt-70">
					<div className="container-fluid">
						<div className="row">
							<div className="col-lg-7 offset-lg-1 col-12 mb-4">
								<div className="card-container-detail">
									<CardItem 
										image={article.src}
										title={article.header}
										description={article.caption}
										uploaded_on={article.date}
										uploaded_by={article.source}
										posturl={article.url}
										source_url={article.source_url}
										posturl={article.source_url} />
								</div>
							</div>
							<div className="col-lg-3 col-12 mb-4">
								<div className="side-box">
									<SectionTitle title="More News" />
									<SideBox posts={recommendations} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("article-detail");
wrapper ? ReactDOM.render(<ArticleDetail />, wrapper) : null;