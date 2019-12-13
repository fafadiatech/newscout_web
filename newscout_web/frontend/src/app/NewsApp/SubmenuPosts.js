import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import { CardItem, Menu, SectionTitle, SideBar } from 'newscout';

import 'newscout/assets/Menu.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/SectionTitle.css'
import 'newscout/assets/Sidebar.css'

import config_data from './config.json';

class SubmenuPosts extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	result = config_data[2].posts.map((item, index) => {
		return (
			<li className="list-inline-item">
				<div className="card-container">
					<CardItem 
						image={item.src}
						title={item.header}
						description={item.caption}
						uploaded_on={item.date}
						uploaded_by={item.domain_url}
						posturl={item.url} />
				</div>
			</li>
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
							<div className="pt-70">
								<div className="row">
									<div className="col-lg-12">
										<div className="side-box">
											<SectionTitle title="Banking" />
										</div>
									</div>
								</div>
								<div className="row">
									<div className="col-lg-12">
										<ul className="list-inline">
											{this.result}
											{this.result}
											{this.result}
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

const wrapper = document.getElementById("submenu-posts");
wrapper ? ReactDOM.render(<SubmenuPosts />, wrapper) : null;