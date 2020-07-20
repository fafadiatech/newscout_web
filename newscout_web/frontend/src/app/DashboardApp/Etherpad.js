import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import Datetime from 'react-datetime';
import logo from '../NewsApp/logo.png';
import Cookies from 'universal-cookie';
import { ToastContainer } from 'react-toastify';
import { Menu, SideBar, Footer } from 'newscout';
import * as serviceWorker from './serviceWorker';
import { CAMPAIGN_URL, SYNC_ETHERPAD } from '../../utils/Constants';
import { getRequest, postRequest, putRequest, deleteRequest, notify, authHeaders } from '../../utils/Utils';
import { Button, Form, FormGroup, Input, Label, FormText, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Table } from 'reactstrap';

import './index.css';
import config_data from '../NewsApp/config.json';

import 'newscout/assets/Menu.css'
import 'newscout/assets/Sidebar.css'

const cookies = new Cookies();

class Campaign extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            fields: {},
            errors: {},
            rows: {},
            formSuccess: false,
            results: [],
            next: null,
            previous: null,
            loading: false,
            q: "",
            page: 0,
            isSideOpen: true,
            username: USERNAME,
            isChecked: false,
            article_update_msg: false,
            article_sync_msg: false,
            active_page: ACTIVE_PAGE
        };
    }

    toggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal,
            fields: {}
        }));
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

    syncData = () => {
        var body = JSON.stringify({"pad_id": PAD_ID})
        postRequest(SYNC_ETHERPAD, body, this.etherpadResponse, "POST");
    }

    etherpadResponse = (data) => {
        this.setState({article_sync_msg: true})
        setTimeout(() => {
            this.setState({article_sync_msg: false})
        }, 3000);
    }

    toggleSwitch = (data) => {
        if (data === true) {
            if (document.getElementById("dark_style")) {
                document.getElementById("dark_style").disabled = false;
            } else {
                var head = document.getElementsByTagName('head')[0];
                var link = document.createElement('link');
                link.id = 'dark_style'
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = '/static/css/dark-style.css';
                link.media = 'all';
                head.appendChild(link);
            }
            this.setState({ isChecked: true })
            cookies.set('isChecked', true, { path: '/' });
        } else {
            if (document.getElementById("dark_style")) {
                document.getElementById("dark_style").disabled = true;
            }
            this.setState({ isChecked: false })
            cookies.remove('isChecked', { path: '/' });
        }
    }

    getTheme = () => {
        if (cookies.get('isChecked')) {
            if (document.getElementById("dark_style")) {
                document.getElementById("dark_style").disabled = false;
            } else {
                var head = document.getElementsByTagName('head')[0];
                var link = document.createElement('link');
                link.id = 'dark_style';
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = '/static/css/dark-style.css';
                link.media = 'all';
                head.appendChild(link);
            }
        } else {
            if (document.getElementById("dark_style")) {
                document.getElementById("dark_style").disabled = true;
            }
        }
    }

    updateEtherpad = () => {
        window.top.location = window.top.location
        this.setState({article_update_msg: true})
        setTimeout(() => {
            this.setState({article_update_msg: false})
        }, 3000);
    }

    componentDidMount() {
        if (cookies.get('isSideOpen')) {
            this.setState({ isSideOpen: true })
        } else {
            this.setState({ isSideOpen: false })
        }
        if (cookies.get('isChecked')) {
            this.setState({ isChecked: true })
        } else {
            this.setState({ isChecked: false })
        }
        this.getTheme();
    }

    render() {
        var { isSideOpen, username, isChecked, article_update_msg, article_sync_msg, active_page } = this.state

        return (
            <React.Fragment>
                <ToastContainer />
                <div className="campaign">
                    <Menu
                        logo={logo}
                        navitems={config_data.dashboardmenu}
                        isSlider={true}
                        isSideBarToogle={this.isSideBarToogle}
                        isSideOpen={isSideOpen}
                        domain="dashboard"
                        username={username}
                        toggleSwitch={this.toggleSwitch}
                        isChecked={isChecked} />
                    <div className="container-fluid">
                        <div className="row">
                            <SideBar menuitems={config_data.dashboardmenu} class={isSideOpen} domain="dashboard" isChecked={isChecked} active_page={active_page} />
                            <div className={`main-content ${isSideOpen ? 'offset-lg-2 col-lg-10' : 'col-lg-12'}`}>
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="py-3 text-right">
                                            {article_update_msg ?
                                                <React.Fragment>
                                                    <span className="text-success">Article updated successfully.</span>&nbsp;&nbsp;
                                                </React.Fragment>
                                            : ''
                                            }
                                            {article_sync_msg ?
                                                <React.Fragment>
                                                    <span className="text-success">Article synced successfully.</span>&nbsp;&nbsp;
                                                </React.Fragment>
                                            : ''
                                            }
                                            <Button className="btn btn-success" type="button" onClick={this.updateEtherpad}>Update</Button>&nbsp;&nbsp;
                                            <Button className="btn btn-success" type="button" onClick={this.syncData}>Sync</Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="">
                                    <iframe id="etherpad-frame" name='embed_readwrite' src={`${ETHERPAD_SERVER}p/${PAD_ID}?showControls=true&showChat=false&showLineNumbers=true&showLineNumbers=true&useMonospaceFont=false`} className="iframe-settings" frameBorder="0" height="100%" width="100%"></iframe>
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

export default Campaign;

ReactDOM.render(<Campaign />, document.getElementById('root'));
serviceWorker.unregister();