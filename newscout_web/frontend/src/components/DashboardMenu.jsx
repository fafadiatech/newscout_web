import React from 'react'

class DashboardMenu extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			active_page: ACTIVE_PAGE,
			is_anonymous: isAnonymous
		};
	}

	render(){
		return (
			<nav className="col-md-2 d-none d-md-block bg-light sidebar">
				<div className="sidebar-sticky">
					<ul className="nav flex-column">
						<li className="nav-item">
							<a className={`${this.state.active_page === "dashboard" ? 'active' : ''} nav-link `} href="/dashboard/">Dashboard</a>
						</li>
						<li className="nav-item">
							<a className={`${this.state.active_page === "campaign" ? 'active' : ''} nav-link `} href="/dashboard/campaigns/">Campaigns</a>
						</li>
						<li className="nav-item">
							<a className={`${this.state.active_page === "group" ? 'active' : ''} nav-link `} href="/dashboard/groups/">Groups</a>
						</li>
						<li className="nav-item">
							<a className={`${this.state.active_page === "advertisement" ? 'active' : ''} nav-link `} href="/dashboard/advertisements/">Advertisements</a>
						</li>
						<li className="nav-item">
							<a className={`${this.state.active_page === "articles" ? 'active' : ''} nav-link `} href="/dashboard/articles/">Articles</a>
						</li>
						{
							!this.state.isAnonymous ?
								<li className="nav-item">
									<a className="nav-link" href="/logout/">Logout</a>
								</li>
							:
								""
						}
					</ul>
				</div>
			</nav>
		)
	}
}

export default DashboardMenu;