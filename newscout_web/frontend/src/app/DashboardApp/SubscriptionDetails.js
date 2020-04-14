import React from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import Cookies from 'universal-cookie';
import logo from '../NewsApp/logo.png';
import { ToastContainer } from 'react-toastify';
import { Menu, SideBar, Footer } from 'newscout';
import * as serviceWorker from './serviceWorker';
import { SUBSCRIPTION_URL, GROUP_GROUPTYPE_URL } from '../../utils/Constants';
import { getRequest, postRequest, fileUploadHeaders, authHeaders, putRequest, deleteRequest, notify } from '../../utils/Utils';
import { Button, Form, FormGroup, Input, Label, FormText, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Table } from 'reactstrap';

import './index.css';
import config_data from '../NewsApp/config.json';

import 'newscout/assets/Menu.css'
import 'newscout/assets/Sidebar.css'

const cookies = new Cookies();

class SubscriptionDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSideOpen: true,
            id: '',
            email: '',
            subs_type: 'Basic',
            autoRenew: 'Yes',
            payement_mode: 'Basic',
            createdOn: '',
            username: USERNAME
        };
    }

    componentDidMount() {
        this.getSubs();
        if (cookies.get('isSideOpen')) {
            this.setState({ isSideOpen: true })
        } else {
            this.setState({ isSideOpen: false })
        }
    }

    getSubs = (data) => {
        this.setState({ loading: true });
        var url = SUBSCRIPTION_URL + ID;
        getRequest(url, this.getSubscriptionData, authHeaders);
    }

    getSubscriptionData = (data) => {
        this.setState({
            email: data.body.results.email,
            subs_type: data.body.results.subs_type,
            payement_mode: data.body.results.payement_mode,
            autoRenew: data.body.results.auto_renew == true ? 'Yes' : 'No',
            createdOn: data.body.results.created_at,
            id: data.body.results.id,
            loading: false
        })
    }

    componentWillUnmount = () => {
        window.removeEventListener('scroll', this.handleScroll)
    }

    isSideBarToogle = (data) => {
        if (data === true) {
            this.setState({ isSideOpen: true })
            cookies.set('isSideOpen', true, { path: '/' });
        } else {
            this.setState({ isSideOpen: false })
            cookies.remove('isSideOpen', { path: '/' });
        }
    }

    handleChange = (e) => {
        this.setState({ subs_type: e.value })
    }

    handleRenewChange = (e) => {
        this.setState({ autoRenew: e.value })
    }

    submitForm = (e) => {
        const body = new FormData();
        body.set('subs_type', this.state.subs_type)
        body.set('id', this.state.id)
        body.set('auto_renew', this.state.autoRenew)
        var url = SUBSCRIPTION_URL + ID + '/';
        postRequest(url, body, this.renderResponse, "POST", fileUploadHeaders);
    }

    renderResponse = (data) => {
        if (data.body.results == "success") {
            notify("Subscription Updated successfully!");
        } else {
            notify("Something went wrong!", 'error');
        }
    }

    render() {
        var {isSideOpen, username} = this.state;
        return (
            <React.Fragment>
                <ToastContainer />
                <div className="group">
                    <Menu
                        logo={logo}
                        navitems={config_data.dashboardmenu}
                        isSlider={true}
                        isSideBarToogle={this.isSideBarToogle}
                        isSideOpen={isSideOpen}
                        domain="dashboard"
                        username={username} />
                    <div className="container-fluid">
                        <div className="row">
                            <SideBar menuitems={config_data.dashboardmenu} class={isSideOpen} domain="dashboard" />
                            <div className={`main-content ${isSideOpen ? 'offset-lg-2 col-lg-10' : 'col-lg-12'}`}>
                                <div className="pt-50 mb-3">
                                    <h1 className="h2">Update Subscription</h1>
                                </div>
                                <hr />
                                <div className="my-5">
                                    <div class="form-group">
                                        <label for="exampleFormControlInput1">Email address:</label>
                                        <span>&nbsp;{this.state.email}</span>
                                    </div>
                                    <div class="form-group">
                                        <label for="exampleFormControlInput1">Subs Type:</label>
                                        <div className="col-6">
                                            <Select refs="adgroup"
                                                value={{ value: this.state.subs_type, label: this.state.subs_type }}
                                                onChange={(e) => this.handleChange(e)}
                                                options={[{ value: 'Basic', label: 'Basic' },
                                                { value: 'Monthly', label: 'Monthly' }, { value: 'Yearly', label: 'Yearly' }]} />
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="exampleFormControlInput1">Created On:</label>
                                        <span>&nbsp;{this.state.createdOn}</span>
                                    </div>
                                    <div class="form-group">
                                        <label for="exampleFormControlInput1">Auto Renew:</label>
                                        <div className="col-6">
                                            <Select refs="adgroup"
                                                value={{ value: this.state.autoRenew, label: this.state.autoRenew }}
                                                onChange={(e) => this.handleRenewChange(e)}
                                                options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} />
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="exampleFormControlInput1">Payment Mode:</label>
                                        <span>&nbsp;{this.state.payement_mode}</span>
                                    </div>
                                    <div class="form-group">
                                        <React.Fragment>
                                            <li className="list-inline-item btn btn-sm btn-success"
                                                onClick={(e) => this.submitForm(e)}>
                                                Submit
                                            </li>
                                        </React.Fragment>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer privacyurl="#" facebookurl="#" twitterurl="#" />
            </React.Fragment>
        );
    }
}

export default SubscriptionDetail;

ReactDOM.render(<SubscriptionDetail />, document.getElementById('root'));
serviceWorker.unregister();
