import React from 'react';
import moment from 'moment';
import logo from './logo.png';
import ReactDOM from 'react-dom';

import Auth from './Auth';
import Comments from './Comments'

import { JumboBox, Menu, SideBox } from 'newscout';

import { Button, Form, FormGroup, Label, Input, FormText, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { MENUS, ARTICLE_DETAIL_URL } from '../../utils/Constants';
import { getRequest } from '../../utils/Utils';

import 'newscout/assets/Menu.css'
import 'newscout/assets/JumboBox.css'
import 'newscout/assets/ImageOverlay.css'
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
			article_id: "",
			modal: false,
		};
	}

	toggle = () => {
		this.setState({
			modal: !this.state.modal,
		})
	}

	getArticleDetail = (data) => {
		var state = this.state;
		var article_dict = {}
		state.article.id = data.body.article.id;
		state.article.slug = data.body.article.slug;
		state.article.altText = data.body.article.title;
		state.article.header = data.body.article.title;
		state.article.caption = data.body.article.blurb;
		state.article.source = data.body.article.source;
		state.article.source_url = data.body.article.source_url;
		state.article.category = data.body.article.category;
		state.article.hash_tags = data.body.article.hash_tags;
		state.article.date = moment(data.body.article.published_on).format('DD-MM-YYYY');
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
			if(item.cover_image){
				var article_dict = {}
				article_dict['id'] = item.id
				article_dict['header'] = item.title
				article_dict['altText'] = item.title
				article_dict['slug'] = "/news/article/"+item.slug
				article_dict['published_on'] = moment(item.published_on).format('DD-MM-YYYY');
				article_dict['src'] = "http://images.newscout.in/unsafe/150x80/left/top/"+decodeURIComponent(item.cover_image)
				if(recommendations_array.length < 5){
					recommendations_array.push(article_dict)
				}
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
					<div className="container">
						<div className="row">
							<div className="col-lg-8 col-12 mb-4">
								<div className="row">
									<div className="col-lg-12">
										<div className="article-detail">
											<JumboBox 
												source_url={article.source_url}
												image={article.src}
												title={article.header}
												uploaded_on={article.date}
												uploaded_by={article.source}
												description={article.caption}
												hash_tags={article.hash_tags} />
										</div>
									</div>
								</div>
								<div className="row">
									<div className="col-lg-12">
										<div className="sidebox mt-5">
											<div className="heading">
												<div className="clearfix">
													<div className="float-left">
														<h3 className="">Reviews</h3>
													</div>
													<div className="float-right">
														<h6 className="h6-text mt-2 mb-0" onClick={this.toggle}>Login</h6>
													</div>
												</div>
											</div>
											<div className="mt-4">
												<Comments />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="col-lg-4 col-12 mb-4">
								<div className="row">
									<div className="col-lg-12">
										<div className="sidebox">
											<div className="heading">
												<h3 className="text-center">More News</h3>
											</div>
											<SideBox posts={recommendations} />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<Auth is_open={this.state.modal} toggle={this.toggle} />
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("article-detail");
wrapper ? ReactDOM.render(<ArticleDetail />, wrapper) : null;