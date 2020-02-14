import React from 'react';
import ReactDOM from 'react-dom';

import { Button, Form, FormGroup, Label, Input } from 'reactstrap';

import { getRequest } from '../../utils/Utils';

import config_data from './config.json';

class Comments extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			modal: this.props.is_open,
			auth_section: true
		};
	}

	render() {
		return(
			<React.Fragment>
				<div className="comment-post">
					<Form>
						<FormGroup>
							<Label for="email">Add your comment</Label>
							<Input type="textarea" name="comment" id="exampleText" />
						</FormGroup>
						<FormGroup>
							<Button color="danger">Submit</Button>
						</FormGroup>
					</Form>
				</div>
				<div className="comment-list mt-4">
					<div className="heading">
						<h3>25 Comments</h3>
					</div>
					<div className="all-comment  mt-3">
						<div className="comment">
							<h6>Firstname LastName</h6>
							<p>Given that food inflation is on the downward path and core inflation is little reason to power ahead, most expect the headline inflation to drop from here on. Kapur of IndusInd Bank expects inflation to ease to 6.8-7.0%. Economists at Nomura are penciling an average inflation of 6.5% in the current quarter and then moderate 4.6-4.7%.</p>
						</div>
						<hr/>
						<div className="comment">
							<h6>Firstname LastName1</h6>
							<p>Given that food inflation is on the downward path and core inflation is little reason to power ahead, most expect the headline inflation to drop from here on. Kapur of IndusInd Bank expects inflation to ease to 6.8-7.0%. Economists at Nomura are penciling an average inflation of 6.5% in the current quarter and then moderate 4.6-4.7%.</p>
						</div>
						<hr/>
						<div className="comment">
							<h6>Firstname LastName2</h6>
							<p>Given that food inflation is on the downward path and core inflation is little reason to power ahead, most expect the headline inflation to drop from here on. Kapur of IndusInd Bank expects inflation to ease to 6.8-7.0%. Economists at Nomura are penciling an average inflation of 6.5% in the current quarter and then moderate 4.6-4.7%.</p>
						</div>
					</div>
				</div>
			</React.Fragment>
		)
	}
}

export default Comments