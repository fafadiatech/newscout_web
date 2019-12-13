import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import { CardItem, Menu, SectionTitle, SideBox } from 'newscout';

import 'newscout/assets/Menu.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/SectionTitle.css'
import 'newscout/assets/SideBox.css'

import config_data from './config.json';

class PostDetail extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	render() {
		var item = config_data[2].posts[0];
		return(
			<React.Fragment>
				<Menu logo={logo} navitems={config_data[0].menuitems} />
				<div className="pt-70">
					<div className="container-fluid">
						<div className="row">
							<div className="col-lg-7 offset-lg-1 col-12 mb-4">
								<div className="card-container-detail">
									<CardItem 
										image={item.src}
										title={item.header}
										description={item.caption}
										uploaded_on={item.date}
										uploaded_by={item.domain_url}
										posturl={item.url} />
								</div>
							</div>
							<div className="col-lg-3 col-12 mb-4">
								<div className="side-box">
									<SectionTitle title="More News" />
									<SideBox posts={config_data[2].posts} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("post-detail");
wrapper ? ReactDOM.render(<PostDetail />, wrapper) : null;