import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import { CardItem, Menu, SectionTitle, SideBar, Filter } from 'newscout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

import 'newscout/assets/Menu.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/SectionTitle.css'
import 'newscout/assets/Sidebar.css'
import 'newscout/assets/Filter.css'

import config_data from './config.json';

class SearchResult extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			isFilterOpen: false
		};
	}

	toggleFilter = () => {
		this.setState({
			isFilterOpen: !this.state.isFilterOpen
		})
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
		console.log(document.getElementsByTagName("body")[0].style)
		console.log(this.state.isFilterOpen)
		if(this.state.isFilterOpen === true){
			document.getElementsByTagName("body")[0].style = "overflow:hidden !important";
		} else {
			document.getElementsByTagName("body")[0].style = "overflow:auto";
		}
		return(
			<React.Fragment>
				<Menu logo={logo} navitems={config_data[0].menuitems} />
				<div className="container-fluid">
					<div className="row">
						<SideBar menuitems={config_data[0].menuitems} />
						<div className="main-content col-lg-10">
							<div className="pt-35">
								<div className="row">
									<div className="col-lg-12">
										<div className="clerfix">
											<div className="float-left">
												<div className="search">
													Search result: aa
												</div>
											</div>
											<div className="float-right">
												<div className="filter" onClick={this.toggleFilter}>
													<FontAwesomeIcon icon={faFilter} />
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="pt-35">
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
						<Filter filters={config_data[4].filters} toggleFilter={this.toggleFilter} isFilterOpen={this.state.isFilterOpen} />
					</div>
				</div>
			</React.Fragment>
		)
	}
}

const wrapper = document.getElementById("search-result");
wrapper ? ReactDOM.render(<SearchResult />, wrapper) : null;