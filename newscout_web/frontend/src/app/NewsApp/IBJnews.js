import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import Slider from "react-slick";
import logo from './logo.png';
import { SectionTitle, Menu, SideBox, JumboBox, ImageOverlay, ContentOverlay, VerticleCardItem, HorizontalCardItem } from 'newscout';
import { Navbar, NavbarBrand, Nav, NavItem } from 'reactstrap';

import { MENUS, TRENDING_NEWS, ARTICLE_POSTS } from '../../utils/Constants';
import { getRequest } from '../../utils/Utils';

import 'newscout/assets/Menu.css'
import 'newscout/assets/SideBox.css'
import 'newscout/assets/JumboBox.css'
import 'newscout/assets/SectionTitle.css'
import 'newscout/assets/ImageOverlay.css'
import 'newscout/assets/ContentOverlay.css'
import 'newscout/assets/CardItem.css'

import config_data from './config.json';

const tabnav_array = [];
const URL = "/news/search/"

const settings = {
	dots: false,
	infinite: false,
	speed: 500,
	slidesToShow: 3,
	slidesToScroll: 3,
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

class IBJnews extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			trending: [],
			menus: [],
			hotseat: [],
			coverfeature: [],
			specialreport: [],
			viewpoint: [],
			readerlounge: [],
			spiritualcorner: [],
			domain: "domain=ibj"
		}
	}

	getMenu = (data) => {
		console.log(data)
		var menus_array = []
		data.body.results.map((item, index) => {
			if(item.heading){
				var heading_dict = {}
				heading_dict['itemtext'] = item.heading.name
				heading_dict['itemurl'] = item.heading.name.replace(/ /g, "-").toLowerCase()
				heading_dict['item_id'] = item.heading.category_id
				menus_array.push(heading_dict)
				item.heading.submenu.map((subitem, subindex) => {
					var submenu_dict = {}
					submenu_dict['itemtext'] = subitem.name
					submenu_dict['itemurl'] = subitem.name.replace(/ /g, "-").toLowerCase()
					submenu_dict['item_id'] = subitem.category_id
					this.getPosts(submenu_dict['itemtext'], submenu_dict['item_id'])
				})
			}
		})
		this.setState({
			menus: menus_array
		})
	}

	getPosts = (cat_name, cat_id) => {
		var url = ARTICLE_POSTS+"?"+this.state.domain+"&category="+cat_name
		if(cat_name == "HOT SEAT"){
			getRequest(url, this.hotseatPosts)
		} else if(cat_name == "View Point") {
			getRequest(url, this.viewpointPosts)
		} else if(cat_name == "Reader's Lounge") {
			getRequest(url, this.readerloungePosts)
		} else if(cat_name == "Spiritual Corner") {
			getRequest(url, this.spiritualcornerPosts)
		} else if(cat_name == "COVER FEATURE") {
			getRequest(url, this.coverfeaturePosts)
		} else if(cat_name == "SPECIAL REPORT") {
			getRequest(url, this.specialreportPosts)
		}
		// } else if(cat_name == "Star Talk") {
		// 	getRequest(url, this.specialreportPosts)
		// } else if(cat_name == "KNOWLEDGE ZONE") {
		// 	getRequest(url, this.specialreportPosts)
		// } else if(cat_name == "Global Wrap-Up") {
		// 	getRequest(url, this.specialreportPosts)
		// } else if(cat_name == "Management Mantra") {
		// 	getRequest(url, this.specialreportPosts)
		// } else if(cat_name == "News Round-Up") {
		// 	getRequest(url, this.specialreportPosts)
		// } else if(cat_name == "Corporate Affairs") {
		// 	getRequest(url, this.specialreportPosts)
		// } else if(cat_name == "Facts For You") {
		// 	getRequest(url, this.specialreportPosts)
		// }
	}

	hotseatPosts = (data) => {
		console.log("hotseat==")
		console.log(data)
		var hotseatPosts_array = []
		data.body.results.map((item, index) => {
			var articles = item.articles;
			if(articles.length < 3){
				for (var ele = 0; ele < articles.length; ele++) {
					if(articles[ele].cover_image){
						var article_dict = {}
						article_dict['id'] = item.id
						article_dict['header'] = articles[ele].title
						article_dict['altText'] = articles[ele].title
						article_dict['caption'] = articles[ele].blurb
						article_dict['source'] = articles[ele].source
						article_dict['category'] = articles[ele].category
						article_dict['slug'] = articles[ele].slug
						article_dict['source_url'] = articles[ele].source_url
						article_dict['src'] = "http://images.newscout.in/unsafe/870x550/left/top/"+decodeURIComponent(articles[ele].cover_image)
						hotseatPosts_array.push(article_dict)
						break;
					}
				}
			}
		})
		this.setState({
			hotseat: hotseatPosts_array
		})
	}

	viewpointPosts = (data) => {
		var viewpointposts_array = []
		data.body.results.map((item, index) => {
			if(item.cover_image){
				var article_dict = {}
				article_dict['id'] = item.id
				article_dict['header'] = item.title
				article_dict['altText'] = item.title
				article_dict['caption'] = item.blurb
				article_dict['source'] = item.source
				article_dict['url'] = item.source_url
				article_dict['src'] = "http://images.newscout.in/unsafe/368x200/left/top/"+decodeURIComponent(item.cover_image)
				if(viewpointposts_array.length < 8){
					viewpointposts_array.push(article_dict)
				}
			}
		})
		this.setState({
			viewpoint: viewpointposts_array
		})
	}

	readerloungePosts = (data) => {
		var readerloungeposts_array = []
		data.body.results.map((item, index) => {
			if(item.cover_image){
				var article_dict = {}
				article_dict['id'] = item.id
				article_dict['header'] = item.title
				article_dict['altText'] = item.title
				article_dict['caption'] = item.blurb
				article_dict['source'] = item.source
				article_dict['slug'] = item.slug
				article_dict['category'] = item.category
				article_dict['hash_tags'] = item.hash_tags
				article_dict['published_on'] = moment(item.published_on).format('MMMM D, YYYY')
				article_dict['src'] = "http://images.newscout.in/unsafe/368x322/left/top/"+decodeURIComponent(item.cover_image)
				if(readerloungeposts_array.length < 4){
					readerloungeposts_array.push(article_dict)
				}
			}
		})
		this.setState({
			readerlounge: readerloungeposts_array
		})
	}

	spiritualcornerPosts = (data) => {
		var spiritualcornerPosts_array = []
		data.body.results.map((item, index) => {
			if(item.cover_image){
				var article_dict = {}
				article_dict['id'] = item.id
				article_dict['header'] = item.title
				article_dict['altText'] = item.title
				article_dict['caption'] = item.blurb
				article_dict['source'] = item.source
				article_dict['slug'] = item.slug
				article_dict['category'] = item.category
				article_dict['hash_tags'] = item.hash_tags
				article_dict['published_on'] = moment(item.published_on).format('MMMM D, YYYY')
				article_dict['src'] = "http://images.newscout.in/unsafe/368x322/left/top/"+decodeURIComponent(item.cover_image)
				if(spiritualcornerPosts_array.length < 3){
					spiritualcornerPosts_array.push(article_dict)
				}
			}
		})
		this.setState({
			spiritualcorner: spiritualcornerPosts_array
		})
	}

	coverfeaturePosts = (data) => {
		var coverfeatureposts_array = []
		data.body.results.map((item, index) => {
			var articles = item.articles;
			if(articles.length < 3){
				for (var ele = 0; ele < articles.length; ele++) {
					if(articles[ele].cover_image){
						var article_dict = {}
						article_dict['id'] = item.id
						article_dict['header'] = articles[ele].title
						article_dict['altText'] = articles[ele].title
						article_dict['caption'] = articles[ele].blurb
						article_dict['source'] = articles[ele].source
						article_dict['category'] = articles[ele].category
						article_dict['slug'] = articles[ele].slug
						article_dict['source_url'] = articles[ele].source_url
						article_dict['src'] = "http://images.newscout.in/unsafe/870x550/left/top/"+decodeURIComponent(articles[ele].cover_image)
						coverfeatureposts_array.push(article_dict)
						break;
					}
				}
			}
		})
		this.setState({
			coverfeature: coverfeatureposts_array
		})
	}

	specialreportPosts = (data) => {
		var specialreportposts_array = []
		data.body.results.map((item, index) => {
			if(item.cover_image){
				var article_dict = {}
				article_dict['id'] = item.id
				article_dict['header'] = item.title
				article_dict['altText'] = item.title
				article_dict['caption'] = item.blurb
				article_dict['source'] = item.source
				article_dict['slug'] = item.slug
				article_dict['category'] = item.category
				article_dict['hash_tags'] = item.hash_tags
				article_dict['published_on'] = moment(item.published_on).format('MMMM D, YYYY')
				article_dict['src'] = "http://images.newscout.in/unsafe/368x322/left/top/"+decodeURIComponent(item.cover_image)
				if(specialreportposts_array.length < 4){
					specialreportposts_array.push(article_dict)
				}
			}
		})
		this.setState({
			specialreport: specialreportposts_array
		})
	}

	componentDidMount() {
		getRequest(MENUS+"?"+this.state.domain, this.getMenu);
	}

	render() {
		console.log(this.state)
		var { menus, hotseat, viewpoint, readerlounge, coverfeature, specialreport, spiritualcorner } = this.state

		var viewpoint = viewpoint.map((item, index) => {
			return(
				<div className="col-lg-4 mb-4">
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
				</div>
			)
		})

		var readerlounge = readerlounge.map((item, index) => {
			return(
				<div className="col-lg-6 mb-4">
					<HorizontalCardItem
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
				</div>
			)
		})

		var spiritualcorner = spiritualcorner.map((item, index) => {
			return (
				<ImageOverlay 
					image={item.src}
					title={item.header}
					description={item.caption}
					uploaded_by={item.source}
					source_url={item.source_url}
					slug_url={item.slug}
					category={item.category}
					size="sm"
				/>
			)
		})

		var coverfeature = coverfeature.map((item, index) => {
			return(
				<div className="col-lg-6 mb-4">
					<HorizontalCardItem
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
				</div>
			)
		})

		var specialreport = specialreport.map((item, index) => {
			return(
				<div className="col-lg-4 mb-4">
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
				</div>
			)
		})

		return (
			<React.Fragment>
				<Menu logo={logo} navitems={menus} url={URL} isSlider={false} domain={this.state.domain} />
				
				<div className="pt-50">
					<div className="container">
						<div className="row">
							<div className="col-lg-7 col-12 mb-4">
								{hotseat.length > 0 ?
									<ImageOverlay 
												image={hotseat[0].src}
												title={hotseat[0].header}
												description={hotseat[0].caption}
												uploaded_by={hotseat[0].source}
												source_url={hotseat[0].source_url}
												slug_url={hotseat[0].slug}
												category={hotseat[0].category}
									/>
								: ''
								}
							</div>
							<div className="col-lg-5 col-12 mb-4">
								{hotseat.length > 0 ?
									<ContentOverlay
												title={hotseat[1].header}
												description={hotseat[1].caption}
												uploaded_by={hotseat[1].source}
												source_url={hotseat[1].source_url}
												slug_url={hotseat[1].slug}
												category={hotseat[1].category}
									/>
								: ''
								}
							</div>
						</div>
					</div>
				</div>
				
				<div className="pt-50">
					<div className="container">
						<div className="row">
							<div className="col-lg-12 col-12 mb-4">
								<div className="section-title">
									<h2 className="m-0 section-title">View Point</h2>
								</div>
							</div>
						</div>
						<div className="row">{viewpoint}</div>
					</div>
				</div>

				<div className="pt-50">
					<div className="container">
						<div className="row">
							<div className="col-lg-12 col-12 mb-4">
								<div className="section-title">
									<h2 className="m-0 section-title">Reader's Lounge</h2>
								</div>
							</div>
						</div>
						<div className="row">{readerlounge}</div>
					</div>
				</div>

				<div className="pt-50">
					<div className="container">
						<div className="row">
							<div className="col-lg-12 col-12 mb-4">
								<div className="section-title">
									<h2 className="m-0 section-title">Spiritual Corner</h2>
								</div>
							</div>
						</div>
						<div className="row">
							<div className="col-lg-12">
								<Slider {...settings}>{spiritualcorner}</Slider>
							</div>
						</div>
					</div>
				</div>

				<div className="pt-50">
					<div className="container">
						<div className="row">
							<div className="col-lg-12 col-12 mb-4">
								<div className="section-title">
									<h2 className="m-0 section-title">COVER FEATURE</h2>
								</div>
							</div>
						</div>
						<div className="row">{coverfeature}</div>
					</div>
				</div>

				<div className="pt-50">
					<div className="container">
						<div className="row">
							<div className="col-lg-12 col-12 mb-4">
								<div className="section-title">
									<h2 className="m-0 section-title">SPECIAL REPORT</h2>
								</div>
							</div>
						</div>
						<div className="row">{specialreport}</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

const wrapper = document.getElementById("ibjindex");
wrapper ? ReactDOM.render(<IBJnews />, wrapper) : null;