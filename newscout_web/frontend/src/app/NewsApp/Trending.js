import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import { CardItem, Menu, SectionTitle } from 'newscout';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

import 'newscout/assets/Menu.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/SectionTitle.css'

import config_data from './config.json';

class Trending extends React.Component {
	
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
								<ul className="list-inline">
									{this.result}
									{this.result}
									{this.result}
								</ul>
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