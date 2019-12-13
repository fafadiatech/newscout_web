import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import Slider from "react-slick";
import { CardItem, Menu, SectionTitle, SideBar } from 'newscout';

import 'newscout/assets/Menu.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/SectionTitle.css'
import 'newscout/assets/Sidebar.css'

import config_data from './config.json';

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
		};
	}

	result = config_data[3].submenu.map((item, index) => {
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
													uploaded_by={sub_item.domain_url}
													posturl={sub_item.url} />
											</div>
										</li>
									)
								})}
								<li className="list-inline-item">
									<div className="card-container">
										<div className="view-all">
											<a href="/news/sector/banking/">View All +</a>
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

	render() {
		return(
			<React.Fragment>
				<Menu logo={logo} navitems={config_data[0].menuitems} />
				<div className="container-fluid">
					<div className="row">
						<SideBar menuitems={config_data[0].menuitems} />
						<div className="main-content col-lg-10">
							<div className="p-70">
								{this.result}
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("menu-posts");
wrapper ? ReactDOM.render(<MenuPosts />, wrapper) : null;