import React from 'react';
import DashboardMenu from '../../components/DashboardMenu';
import DashboardHeader from '../../components/DashboardHeader';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render(){
		return(
			<div className="App">
				<DashboardHeader />
				<div className="container-fluid">
					<div className="row">
						<DashboardMenu />
						
						<main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4">
							<h1 className="h2">Hello World</h1>
						</main>
					</div>
				</div>
			</div>
		);
	}
}

export default App;