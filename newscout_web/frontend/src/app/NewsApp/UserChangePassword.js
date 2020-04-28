import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'universal-cookie';
import { Menu, SideBar, Footer } from 'newscout';
import { ToastContainer, toast } from 'react-toastify';
import { Button, Form, FormGroup, Label, FormText } from 'reactstrap';

import Auth from './Auth';

import { BASE_URL, MENUS, ARTICLE_LOGOUT, SUGGESTIONS, CHANGE_PASSWORD_URL } from '../../utils/Constants';
import { getRequest, postRequest } from '../../utils/Utils';

import '../DashboardApp/index.css';
import './style.css';
import 'newscout/assets/Menu.css'
import 'newscout/assets/ImageOverlay.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/SectionTitle.css'
import 'newscout/assets/Sidebar.css'

import config_data from './config.json';

var article_array = [];
const URL = "/news/search/"
const cookies = new Cookies();

class UserChangePassword extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            menus: [],
            domain: "domain=" + DOMAIN,
            isLoading: true,
            isSideOpen: true,
            modal: false,
            is_loggedin: false,
            is_loggedin_validation: false,
            username: cookies.get('full_name'),
            bookmark_ids: [],
            isChecked: false,
            options: [],
            fields: {
                old_password: "",
                password: "",
                confirm_password: ""
            },
            errors: {},
        };
    }

    loggedInUser = (data) => {
        this.setState({
            username: data,
            is_loggedin: true
        })
    }

    toggle = (data) => {
        this.setState({
            modal: !data,
        })
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

    getMenu = (data) => {
        var menus_array = []
        data.body.results.map((item, index) => {
            if (item.heading) {
                var heading_dict = {}
                heading_dict['itemtext'] = item.heading.name
                heading_dict['itemurl'] = "news/" + item.heading.name.replace(" ", "-").toLowerCase()
                heading_dict['item_id'] = item.heading.category_id
                heading_dict['item_icon'] = item.heading.icon
                menus_array.push(heading_dict)
            }
        })
        this.setState({
            menus: menus_array
        })
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

    handleLogout = () => {
        var headers = { "Authorization": "Token " + cookies.get('token'), "Content-Type": "application/json" }
        getRequest(ARTICLE_LOGOUT, this.authLogoutResponse, headers);
    }

    authLogoutResponse = (data) => {
        cookies.remove('token', { path: '/' })
        cookies.remove('full_name', { path: '/' })
        this.setState({
            is_loggedin: false,
            is_captcha: true,
            bookmark_ids: []
        })
        window.location.href = "/"
    }

    handleSearch = (query) => {
        var url = SUGGESTIONS + "?q=" + query + "&" + this.state.domain
        getRequest(url, this.getSuggestionsResponse)
    }

    getSuggestionsResponse = (data) => {
        var options_array = []
        var results = data.body.result;
        results.map((item, index) => {
            options_array.push(item.value)
        })
        this.setState({
            options: options_array
        })
    }

    onChange = (field, e) => {
        let fields = this.state.fields;
        fields[field] = e.target.value;
        this.setState({ fields });
    }

    handleValidation = () => {
        let fields = this.state.fields;
        let errors = {};
        let formIsValid = true;
        let required_msg = "This fields is required";

        if (!fields["old_password"]) {
            formIsValid = false;
            errors["old_password"] = required_msg;
        }

        if (!fields["password"]) {
            formIsValid = false;
            errors["password"] = required_msg;
        }

        if (!fields["confirm_password"]) {
            formIsValid = false;
            errors["confirm_password"] = required_msg;
        }

        this.setState({ errors: errors });
        return formIsValid;
    }

    handleSubmit = (event) => {
        event.preventDefault();
        if (this.handleValidation()) {
            var body = JSON.stringify(this.state.fields)
            var headers = { "Authorization": "Token " + cookies.get('token'), "Content-Type": "application/json" }
            postRequest(CHANGE_PASSWORD_URL, body, this.changePasswordResponse, "POST", headers);
        }
    }

    changePasswordResponse = (data) => {
        console.log(data.body)
        if (data.body) {
            toast.success(data.body.Msg);
            var headers = { "Authorization": "Token " + cookies.get('token'), "Content-Type": "application/json" }
            getRequest(ARTICLE_LOGOUT, this.authLogoutResponse, headers);
            setTimeout(() => {
                window.location.href = "/"
            }, 3000);
        } else {
            let errors = {};
            let formIsValid = true;
            let error_msg = data.errors.Msg;
            formIsValid = false;
            errors[data.errors.field] = error_msg;
            this.setState({ errors: errors });
        }
    }

    componentDidMount() {
        getRequest(MENUS + "?" + this.state.domain, this.getMenu);
        if (cookies.get('full_name')) {
            this.setState({ is_loggedin: true })
        } else {
            window.location.href = "/"
        }
        if (cookies.get('isChecked')) {
            this.setState({ isChecked: true })
        } else {
            this.setState({ isChecked: false })
        }
        if (cookies.get('isSideOpen')) {
            this.setState({ isSideOpen: true })
        } else {
            this.setState({ isSideOpen: false })
        }
        this.getTheme()
    }

    render() {
        var { menus, isSideOpen, modal, is_loggedin, username, isChecked, options } = this.state;

        return (
            <React.Fragment>
                <ToastContainer />
                <Menu
                    navitems={menus}
                    url={URL}
                    isSlider={true}
                    isSideBarToogle={this.isSideBarToogle}
                    isSideOpen={isSideOpen}
                    toggle={this.toggle}
                    is_loggedin={is_loggedin}
                    username={username}
                    handleLogout={this.handleLogout}
                    toggleSwitch={this.toggleSwitch}
                    isChecked={isChecked}
                    handleSearch={this.handleSearch}
                    options={options}
                />

                <div className="container-fluid">
                    <div className="row">
                        <SideBar menuitems={menus} class={isSideOpen} isChecked={isChecked} />
                        <div className={`main-content ${isSideOpen ? 'offset-lg-2 col-lg-10' : 'col-lg-12'}`}>
                            <div className="pt-50 mb-3">
                                <h1 className="h2">Change Password</h1>
                                <div className="row">
                                    <div className="col-lg-4 mt-4">
                                        <Form onSubmit={this.handleSubmit}>
                                            <FormGroup>
                                                <Label for="old-password">Old Password</Label>
                                                <input refs="old-password" type="password" name="password" className="form-control" placeholder="******" value={this.state.fields.old_password} onChange={(e) => this.onChange("old_password", e)} />
                                                <FormText color="danger">{this.state.errors["old_password"]}</FormText>
                                            </FormGroup>
                                            <FormGroup>
                                                <Label for="new-password">New Password</Label>
                                                <input refs="new-password" type="password" name="password" className="form-control" placeholder="******" value={this.state.fields.password} onChange={(e) => this.onChange("password", e)} />
                                                <FormText color="danger">{this.state.errors["password"]}</FormText>
                                            </FormGroup>
                                            <FormGroup>
                                                <Label for="cnf-password">Confirm Password</Label>
                                                <input refs="cnf-password" type="password" name="password" className="form-control" placeholder="******" value={this.state.fields.confirm_password} onChange={(e) => this.onChange("confirm_password", e)} />
                                                <FormText color="danger">{this.state.errors["confirm_password"]}</FormText>
                                            </FormGroup>
                                            <Button color="success" type="submit">Submit</Button>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Auth is_open={modal} toggle={this.toggle} loggedInUser={this.loggedInUser} />

                <Footer privacyurl="#" facebookurl="#" twitterurl="#" />
            </React.Fragment>
        )
    }
}

export default UserChangePassword;

const wrapper = document.getElementById("root");
wrapper ? ReactDOM.render(<UserChangePassword />, wrapper) : null;