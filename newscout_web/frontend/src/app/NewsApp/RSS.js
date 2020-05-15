import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import Slider from "react-slick";
import Cookies from 'universal-cookie';
import { Menu, SideBar, Footer } from 'newscout';

import { MENUS, ARTICLE_LOGOUT, SUGGESTIONS, RSS_URL } from '../../utils/Constants';
import { getRequest } from '../../utils/Utils';

import Auth from './Auth';

import 'newscout/assets/Menu.css'
import 'newscout/assets/ImageOverlay.css'
import 'newscout/assets/CardItem.css'
import 'newscout/assets/Sidebar.css'

const URL = "/news/search/"
const cookies = new Cookies();



class RSS extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            category: {},
            newsPosts: [],
            menus: [],
            isSideOpen: true,
            domain: "domain=" + DOMAIN,
            isLoading: true,
            modal: false,
            is_loggedin: false,
            is_loggedin_validation: false,
            username: cookies.get('full_name'),
            bookmark_ids: [],
            isChecked: false,
            options: [],
            active_page: ACTIVE_PAGE
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

    getRSS = (data) => {
        this.setState({ category: data.body.results });
    }


    isSideBarToogle = (data) => {
        console.log(data)
        if (data === true) {
            this.setState({ isSideOpen: true })
            cookies.set('isSideOpen', true, { path: '/' });
        } else {
            this.setState({ isSideOpen: false })
            cookies.remove('isSideOpen', false, { path: '/' });
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
    }

    handleSearch = (query) => {
        var url = SUGGESTIONS + "?q=" + query + "&" + this.state.domain
        getRequest(url, this.getSuggestionsResponse)
    }

    getSuggestionsResponse = (data) => {
        var options_array = []
        var results = data.body.result;
        results.map((item, indx) => {
            options_array.push(item.value)
        })
        this.setState({
            options: options_array
        })
    }

    componentDidMount() {
        getRequest(MENUS + "?" + this.state.domain, this.getMenu);
        getRequest(RSS_URL + "?" + this.state.domain, this.getRSS);
        if (cookies.get('full_name')) {
            this.setState({ is_loggedin: true })
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
        var { menus, isSideOpen, username, is_loggedin, modal, isChecked, options, category, active_page } = this.state;
        var rssTable = (category => {
            var items = [];
            for (var key in category) {
                items.push(
                    <tr key={key}>
                        <td>{key}</td>
                        <td><a href={category[key]} target="_blank"><button class="btn btn-success btn-sm "
                        >RSS <i class="fa fa-rss"></i>
                        </button></a>
                        </td>
                    </tr>);
            }
            return items
        })

        return (
            <React.Fragment>
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
                        <SideBar menuitems={menus} class={isSideOpen} isChecked={isChecked} active={active_page} />
                        <div className={`main-content ${isSideOpen ? 'offset-lg-2 col-lg-10' : 'col-lg-12'}`}>
                            <div className="p-70 pb-5">
                                <div class="container">
                                    <h2 align="center">NewScout RSS Feed</h2>

                                    <br />
                                    <table class={`${this.state.isChecked ? "table table-bordered table-dark" : "table table-bordered"}`}>
                                        <tr>
                                            <th>Category</th>
                                            <th>RSS Feed</th>
                                        </tr>
                                        {rssTable(category)}
                                    </table>
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

const wrapper = document.getElementById("rss");
wrapper ? ReactDOM.render(<RSS />, wrapper) : null;