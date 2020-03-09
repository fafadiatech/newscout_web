import React from 'react';
import moment from 'moment';
import logo from './logo.png';
import ReactDOM from 'react-dom';
import Cookies from 'universal-cookie';
import { JumboBox, Menu, SideBox, SideBar, Footer } from 'newscout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPowerOff } from '@fortawesome/free-solid-svg-icons'
import { Button, Form, FormGroup, Label, Input, FormText, Modal, ModalHeader, ModalBody, ModalFooter, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Breadcrumb, BreadcrumbItem } from 'reactstrap';

import Auth from './Auth';
import Comments from './Comments'

import { MENUS, ARTICLE_DETAIL_URL, ARTICLE_LOGOUT, ARTICLE_COMMENT } from '../../utils/Constants';
import { getRequest, postRequest } from '../../utils/Utils';

import 'newscout/assets/Menu.css'
import 'newscout/assets/JumboBox.css'
import 'newscout/assets/ImageOverlay.css'
import 'newscout/assets/SideBox.css'
import 'newscout/assets/Sidebar.css'

import config_data from './config.json';

const URL = "/news/search/";
const cookies = new Cookies();

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
			username: cookies.get('full_name'),
			articlecomments: [],
			successComment: false,
			is_login: false,
			is_login_validation: false,
			captchaData : {},
			captchaImage: "",
			InvalidCaptcha : false,
			resetAll : false,
			is_captcha : true,
			isSideOpen: true,
		};
	}

	loggedInUser = (data) => {
		this.setState({
			username: data,
			is_login: true
		})
		var headers = {"Authorization": "Token "+cookies.get('token'), "Content-Type": "application/json"}
		getRequest(ARTICLE_COMMENT+"?article_id="+ARTICLEID, this.getArticleComment, headers);
		this.fetchCaptcha();
		this.setState({is_captcha:false})
	}

	toggle = () => {
		this.setState({
			modal: !this.state.modal,
		})
	}

	handleLogout = () => {
		var headers = {"Authorization": "Token "+cookies.get('token'), "Content-Type": "application/json"}
        getRequest(ARTICLE_LOGOUT, this.authLogoutResponse, headers);
    }

    authLogoutResponse = (data) => {
    	cookies.remove('full_name')
        cookies.remove('token')
        this.setState({
			is_login: false,
			is_captcha: true
        })
    }

	getArticleDetail = (data) => {
		var state = this.state;
		var article_dict = {}
		state.article.id = data.body.article.id;
		state.article.slug = data.body.article.slug;
		state.article.altText = data.body.article.title;
		state.article.title = data.body.article.title;
		state.article.caption = data.body.article.blurb;
		state.article.source = data.body.article.source;
		state.article.source_url = data.body.article.source_url;
		state.article.category = data.body.article.category;
		state.article.sub_category = data.body.article.sub_category;
		state.article.hash_tags = data.body.article.hash_tags;
		state.article.date = moment(data.body.article.published_on).format('D MMMM YYYY');
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
				article_dict['title'] = item.title
				article_dict['altText'] = item.title
				article_dict['slug'] = "/news/article/"+item.slug
				article_dict['published_on'] = moment(item.published_on).format('D MMMM YYYY');
				article_dict['src'] = "http://images.newscout.in/unsafe/70x70/center/smart/"+decodeURIComponent(item.cover_image)
				if(recommendations_array.length < 5){
					recommendations_array.push(article_dict)
				}
			}
		})
		this.setState({
			recommendations: recommendations_array
		})
	}

	getArticleComment = (data) => {
		var results = data.body.results.reverse()
		this.setState({
			articlecomments : results
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
				heading_dict['item_icon'] = item.heading.icon
				menus_array.push(heading_dict)
			}
		})
		this.setState({
			menus: menus_array
		})
	}

	handleSubmit = (data) => {
		var url = ARTICLE_COMMENT+"?article_id="+ARTICLEID
		var captchaKey = this.state.captchaData
        var body = JSON.stringify({comment: data["comment"], article_id: ARTICLEID, captcha_value:data["captcha"], captcha_key:captchaKey["new_captch_key"]})
        if(cookies.get('full_name') !== undefined){
			var headers = {"Authorization": "Token "+cookies.get('token'), "Content-Type": "application/json"}
        	postRequest(url, body, this.commentSubmitResponse, "POST", headers);
        } else {
        	this.setState({
					is_login_validation: true
				})
			setTimeout(() => {
				this.setState({
					is_login_validation: false
				})
			}, 3000);
        }
	}

	setCaptcha = (data) => {
		var results = JSON.parse(data["body"]["result"])
		var captcha_image = "http://newscout.in"+results["new_captch_image"]
		var state = this.state
		state.captchaImage = captcha_image
		state.captchaData = results
		this.setState(state);
	}

	fetchCaptcha = () => {
		let url = "http://newscout.in/api/v1/comment-captcha/";
		var headers = {"Authorization": "Token "+cookies.get('token'), "Content-Type": "application/json"}
		getRequest(url, this.setCaptcha, headers);
	}

	commentSubmitResponse = (data) => {
		if(data.header.status === "1") {
			this.setState({
				InvalidCaptcha:false
			});
			this.setState({
				successComment :true
			});
			this.setState({
				resetAll :true
			});
			setTimeout(() => {
				this.setState({
					successComment: false
				})
			}, 3000);
			setTimeout(() => {
				this.setState({
					resetAll: false
				})
			}, 50);
			var headers = {"Authorization": "Token "+cookies.get('token'), "Content-Type": "application/json"}
			getRequest(ARTICLE_COMMENT+"?article_id="+ARTICLEID, this.getArticleComment, headers);
		}
		else {
			this.setState({
				InvalidCaptcha: true
			})
		}
	}

	isSideOpen = (data) => {
		this.setState({
			isSideOpen: data
		})
	}

	componentDidMount() {
		getRequest(MENUS+"?"+this.state.domain, this.getMenu);
		getRequest(ARTICLE_DETAIL_URL+SLUG+"?"+this.state.domain, this.getArticleDetail);
		var headers = {"Authorization": "Token "+cookies.get('token'), "Content-Type": "application/json"}
		getRequest(ARTICLE_COMMENT+"?article_id="+ARTICLEID, this.getArticleComment, headers);		
	}

	render() {
		var { menus, article, recommendations, username, modal, captchaImage, isSideOpen } = this.state;
    var sub_category = ""
		var category = ""
		if(article.sub_category) {
			var sub_category = article.sub_category.replace(" ", "-").toLowerCase()
		}
		if(article.category) {
			var category = article.category.replace(" ", "-").toLowerCase()
		}
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
					                    <div className="col-lg-12 col-12">
					                      <div className="article-breadcrumb">
					                        <Breadcrumb className="mb-0">
					                          <BreadcrumbItem><a href="/">Home</a></BreadcrumbItem>
					                          {article.category ?
					                            <BreadcrumbItem><a href={`/news/${category}`}>{article.category}</a></BreadcrumbItem>
					                          : ""
					                          }
					                          {article.sub_category ?
					                            <BreadcrumbItem><a href={`/news/${category}/${sub_category}`}>{article.sub_category}</a></BreadcrumbItem>
					                          : ""
					                          }
					                        </Breadcrumb>
					                      </div>
					                    </div>
					                  </div>
									<div className="row">
										<div className="col-lg-8 col-12 mb-4">
											<div className="row">
												<div className="col-lg-12">
													<div className="article-detail">
														<JumboBox 
															source_url={article.source_url}
															image={article.src}
															title={article.title}
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
																	{this.state.is_login ?
																		<ul className="list-inline mb-0 usr">
																			<li className="list-inline-item">
																				<h6 className="h6-text mt-2 mb-0">{username}</h6>
																			</li>
																			<li className="list-inline-item">|</li>
																			<li className="list-inline-item text-danger" onClick={this.handleLogout}>
																				<FontAwesomeIcon icon={faPowerOff} />
																			</li>
																		</ul>
																	:
																		<h6 className="h6-text mt-2 mb-0" onClick={this.toggle}>Login</h6>
																	}
																</div>
															</div>
														</div>
														<div className="mt-4">
															<Comments comments={this.state.articlecomments} handleSubmit={this.handleSubmit} successComment={this.state.successComment} is_login={this.state.is_login_validation} captchaImage={captchaImage} InvalidCaptcha={this.state.InvalidCaptcha}
															fetchCaptcha={this.fetchCaptcha} resetAll={this.state.resetAll}
															is_captcha={this.state.is_captcha}/>
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
						</div>
					</div>
				</div>

				<Auth is_open={modal} toggle={this.toggle} loggedInUser={this.loggedInUser} />

				<Footer privacyurl="#" facebookurl="#" twitterurl="#" />
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("article-detail");
wrapper ? ReactDOM.render(<ArticleDetail />, wrapper) : null;