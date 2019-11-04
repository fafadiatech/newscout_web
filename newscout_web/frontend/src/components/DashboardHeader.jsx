import React from 'react';

class DashboardHeader extends React.Component {

	constructor(props){
		super(props)

		this.state = {}
	}

	render(){
		return(
			<nav className="navbar fixed-top navbar-expand-sm navbar-dark bg-dark flex-md-nowrap shadow">
				<div className="inner-section">
					<img className="logo" src="/static/images/logo/logo.jpg" alt="logo" />
				</div>
				<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation"><span className="navbar-toggler-icon"></span>
				</button>
			</nav>
		)
	}
}

export default DashboardHeader