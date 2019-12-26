import React from 'react';
import moment from 'moment';
import logo from './logo.png';
import ReactDOM from 'react-dom';
import Slider from "react-slick";
import { CardItem, Menu, SectionTitle, SideBar } from 'newscout';

import { MENUS, ARTICLE_POSTS } from '../../utils/Constants';
import { getRequest } from '../../utils/Utils';

import 'newscout/assets/Menu.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/SectionTitle.css'
import 'newscout/assets/Sidebar.css'

const DOMAIN = "domain=newscout";
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

	getNewsData = (data) => {
		data.body.results.map((item, index) => {
			if(item.heading){
				var heading_dict = {}
				heading_dict['itemtext'] = item.heading.name
				heading_dict['itemurl'] = item.heading.name.replace(" ", "-").toLowerCase()
				heading_dict['item_id'] = item.heading.category_id
				if(heading_dict['itemurl'] === CATEGORY){
					this.getPosts(item.heading.name, item.heading.category_id, item.heading.submenu)
				}
			}
		})
	}

	getPosts = (cat_name, cat_id, submenu) => {
		submenu.map((item, index) => {
			var url = ARTICLE_POSTS+"?"+DOMAIN+"&category="+item.category_id
			getRequest(url, this.newsData, false, item.name)

		})
	}

	newsData = (data, extra_data) => {
		var news_dict = {}
		var news_array = []
		data.body.results.map((item, index) => {
			var article_dict = {}
			article_dict['id'] = item.id;
			article_dict['header'] = item.title;
			article_dict['altText'] = item.title;
			article_dict['caption'] = item.blurb;
			article_dict['source'] = item.source;
			article_dict['source_url'] = item.source_url;
			article_dict['date'] = moment(item.published_on).format('YYYY-MM-DD');
			article_dict['src'] = "http://images.newscout.in/unsafe/336x150/left/top/"+decodeURIComponent(item.cover_image);
			if(news_array.length <= 9){
				news_array.push(article_dict)
			}
		})
		news_dict['menuname'] = extra_data
		news_dict['posts'] = news_array
		submenu_array.push(news_dict)
		this.setState({
			newsPosts: submenu_array
		})
	}

	componentWillMount() {
		getRequest(MENUS+"?"+DOMAIN, this.getMenu);
		getRequest(MENUS+"?"+DOMAIN, this.getNewsData);
	}

	render() {
		var { menus, newsPosts } = this.state;
		var result = newsPosts.map((item, index) => {
			return (
				<React.Fragment key={index}>
					<div className="row">
						<div className="col-lg-12">
							<div className="side-box">
								<SectionTitle title={item.menuname} />
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-lg-12">
							<ul className="list-inline">
								<Slider {...settings}>
									{item.posts.map((sub_item, sub_index) => {
										return (
											<li className="list-inline-item" key={sub_index}>
												<div className="card-container">
													<CardItem 
														image={sub_item.src}
														title={sub_item.header}
														description={sub_item.caption}
														uploaded_on={sub_item.date}
														uploaded_by={sub_item.source}
														source_url={sub_item.source_url}
														posturl={`/news/article/${sub_item.id}/`} />
												</div>
											</li>
										)
									})}
									<li className="list-inline-item">
										<div className="card-container">
											<div className="view-all">
												<a href={`/news/${CATEGORY}/${item.menuname.replace(" ", "-").toLowerCase()}/`}>View All +</a>
											</div>
										</div>
									</li>
								</Slider>
							</ul>
						</div>
					</div>
				</React.Fragment>
			)
		})

		return(
			<React.Fragment>
				<Menu logo={logo} navitems={menus} />
				<div className="container-fluid">
					<div className="row">
						<SideBar menuitems={menus} />
						<div className="main-content col-lg-10">
							<div className="p-70">{result}</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("menu-posts");
wrapper ? ReactDOM.render(<MenuPosts />, wrapper) : null;