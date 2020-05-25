import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import Datetime from 'react-datetime';
import logo from '../NewsApp/logo.png';
import Cookies from 'universal-cookie';
import { ToastContainer } from 'react-toastify';
import { Menu, SideBar, Footer } from 'newscout';
import * as serviceWorker from './serviceWorker';
import {
    ARTICLE_SOURCE_LIST_URL, ARTICLE_CATEGORY_LIST_URL,
    ARTICLE_CREATE_URL, ARTICLE_DETAIL_URL,
    ARTICLE_DRAFTIMAGE_URL, ARTICLE_DOMAIN_LIST_URL
} from '../../utils/Constants';
import {
    getRequest, postRequest, putRequest, fileUploadHeaders,
    deleteRequest
} from '../../utils/Utils';
import { Button, Form, FormGroup, Label, FormText, Row, Col } from 'reactstrap';
import Summernote from '../../components/Summernote';

import './index.css';
import config_data from '../NewsApp/config.json';

import 'newscout/assets/Menu.css'
import 'newscout/assets/Sidebar.css'

const cookies = new Cookies();

class ArticleForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            fields: {
                title: "",
                source: "",
                category: "",
                published_on: "",
                blurb: "",
                cover_image: "",
            },
            domains: [],
            sources: [],
            categories: [],
            errors: {},
            rows: {},
            formSuccess: false,
            results: [],
            active_page: ACTIVE_PAGE,
            article_slug: ARTICLE_SLUG,
            article_id: "",
            cover_image: "",
            cover_image_name: "",
            cover_image_id: "",
            isSideOpen: true,
            isChecked: false,
            username: USERNAME,
            isChecked: false,
        };
    }

    handleChange = (value_type, e) => {
        var label = e.label
        var value = e.value;
        var state = this.state
        if (value_type == "article_source") {
            state.fields.source = { value: value, label: label }
        }

        if (value_type == "article_category") {
            state.fields.category = { value: value, label: label }
        }

        if (value_type == "article_domain") {
            state.fields.domain = { value: value, label: label }
        }

        if (value_type == "cover_image") {
            var imageFile = e.target.files[0];
            var imageURL = URL.createObjectURL(imageFile);
            state.fields.cover_image = imageFile;
            state.cover_image = imageURL;
            state.loading = true;
            state.cover_image_name = e.target.value;
            this.uploadImage(imageFile);
        }
        this.setState(state)
    }

    onChange = (field, e) => {
        let fields = this.state.fields;
        if (field === "published_on") {
            fields[field] = e;
        } else {
            fields[field] = e.target.value;
        }

        this.setState({ fields });
    }

    onSummernoteChange = (content) => {
        let fields = this.state.fields;
        fields.blurb = content;
        this.setState(fields);
    }

    onSummernoteImageUpload = (files) => {
        var image_file = files[0];
        return URL.createObjectURL(image_file)
    }

    setSources = (data) => {
        var sources = [];
        data.body.results.map((el, index) => {
            var option = { label: el.name, value: el.id }
            sources.push(option)
        })
        this.setState({
            "sources": sources
        })
    }

    setDomains = (data) => {
        var domains = [];
        data.body.results.map((el, index) => {
            var option = { label: el.domain_name, value: el.id }
            domains.push(option)
        })
        this.setState({
            "domains": domains
        })
    }

    getArticleDetails = () => {
        var url = ARTICLE_DETAIL_URL + this.state.article_slug + "/";
        getRequest(url, this.setArticleDetails);
    }

    setArticleDetails = (data) => {
        var state = this.state;
        var article_detail = data.body.article;
        state.article_id = article_detail.id;
        state.fields.title = article_detail.title;
        state.fields.category = { label: article_detail.category, value: article_detail.category_id };
        state.fields.source = { label: article_detail.source, value: article_detail.source_id };
        state.fields.domain = { label: article_detail.domain, value: article_detail.domain_id };
        state.fields.blurb = article_detail.blurb;
        state.fields.published_on = moment(article_detail.published_on).format('YYYY-MM-DD m:ss A');
        state.fields.cover_image = article_detail.cover_image;
        state.cover_image = article_detail.cover_image;
        this.setState(state);
    }

    getSources = () => {
        var url = ARTICLE_SOURCE_LIST_URL;
        getRequest(url, this.setSources);
    }

    getDomains = () => {
        var url = ARTICLE_DOMAIN_LIST_URL;
        getRequest(url, this.setDomains)
    }

    setCategories = (data) => {
        var categories = [];
        data.body.categories.map((el, index) => {
            var option = { label: el.name, value: el.id }
            categories.push(option)
        })
        this.setState({
            "categories": categories
        })
    }

    getCategories = () => {
        var url = ARTICLE_CATEGORY_LIST_URL;
        getRequest(url, this.setCategories);
    }

    articleSave = (method) => {
        var fields = this.state.fields;
        fields.category = fields.category.value
        fields.cover_image = fields.cover_image
        fields.source = fields.source.value
        fields.domain = fields.domain.value
        if (method == "post") {
            var body = JSON.stringify(fields)
            postRequest(ARTICLE_CREATE_URL, body, this.articleSubmitResponse, "POST");
        } else {
            fields.published_on = moment(fields.published_on, "YYYY-MM-DD HH:mm Z")
            fields.id = this.state.article_id
            var body = JSON.stringify(fields)
            putRequest(ARTICLE_CREATE_URL, body, this.articleSubmitResponse, "PUT");
        }
    }

    articlePublish = (method) => {
        var fields = this.state.fields;
        fields.category = fields.category.value
        fields.cover_image = fields.cover_image
        fields.source = fields.source.value
        fields.domain = fields.domain.value
        fields.is_publish = true;
        if (method == "post") {
            fields.publish = true
            var body = JSON.stringify(fields)
            postRequest(ARTICLE_CREATE_URL, body, this.articleSubmitResponse, "POST");
        } else {
            fields.publish = true
            fields.published_on = moment(fields.published_on, "YYYY-MM-DD HH:mm Z")
            fields.id = this.state.article_id
            var body = JSON.stringify(fields)
            putRequest(ARTICLE_CREATE_URL, body, this.articleSubmitResponse, "PUT");
        }
    }

    articleSubmitResponse = (data) => {
        this.setState({ 'formSuccess': true });
        setTimeout(() => {
            this.setState({
                "formSuccess": false,
                "fields": {
                    "title": "",
                    "source": "",
                    "category": "",
                    "published_on": "",
                    "blurb": "",
                    "cover_image": "",
                    "domain": ""
                },
                "cover_image": "",
                "cover_image_id": "",
                "cover_image_name": ""
            });
        }, 3000);
    }

    uploadImage = (imageFile) => {
        if (this.state.cover_image_id == "") {
            const body = new FormData();
            body.set('image', imageFile)
            postRequest(ARTICLE_DRAFTIMAGE_URL, body, this.handleUploadImageResponse, "POST", fileUploadHeaders);
        } else {
            const body = new FormData();
            body.set('image', imageFile);
            var url = ARTICLE_DRAFTIMAGE_URL + this.state.cover_image_id + "/";
            putRequest(url, body, this.handleUploadImageResponse, "PUT", fileUploadHeaders);
        }
    }

    handleUploadImageResponse = (data) => {
        var state = this.state;
        state.fields.cover_image = window.location.origin + "/" + data.body.image;
        state.cover_image = window.location.origin + "/" + data.body.image;
        state.cover_image_id = data.body.id;
        state.loading = false;
        this.setState(state);
    }

    handleDeleteImageResponse = (data) => {
        var state = this.state;
        state.fields.cover_image = "";
        state.cover_image = "";
        state.fields.cover_image_id = "";
        state.cover_image_name = "";
        this.setState(state);
    }

    deleteImage = (e) => {
        var image_id = this.state.cover_image_id;
        if (image_id) {
            var url = ARTICLE_DRAFTIMAGE_URL + image_id + "/";
            deleteRequest(url, this.handleDeleteImageResponse);
        } else {
            this.handleDeleteImageResponse({})
        }
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

    componentDidMount() {
        if (this.state.article_slug) {
            this.getArticleDetails()
        }
        this.getSources()
        this.getDomains()
        this.getCategories()
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
        var { menus, isSideOpen, username, isChecked } = this.state

        if (this.state.active_page == "article-create") {
            var page_title = "Article Create"
            var method = "post"
        } else {
            var page_title = "Article Edit"
            var method = "put"
        }
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
                            <SideBar menuitems={config_data.dashboardmenu} class={isSideOpen} domain="dashboard" isChecked={isChecked} />
                            <div className={`main-content ${isSideOpen ? 'offset-lg-2 col-lg-10' : 'col-lg-12'}`}>
                                <div className="pt-50 mb-3">
                                    <h1 className="h2">{page_title}</h1>
                                    <Form>
                                        <Row>
                                            <Col md={5}>
                                                <Row form>
                                                    <Col md={12}>
                                                        <FormGroup>
                                                            <Label for="article_domain">Domain</Label>
                                                            <Select refs="article_domain" options={this.state.domains} value={this.state.fields.domain} onChange={(e) => this.handleChange("article_domain", e)} />
                                                            <FormText color="danger">{this.state.errors["article_domain"]}</FormText>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                <Row form>
                                                    <Col md={12}>
                                                        <FormGroup>
                                                            <Label for="name">Article Title</Label>
                                                            <input refs="name" type="textarea" name="name" className="form-control" placeholder="Article Title" id="title" value={this.state.fields.title} onChange={(e) => this.onChange("title", e)} />
                                                            <FormText color="danger">{this.state.errors["name"]}</FormText>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                <Row form>
                                                    <Col md={12}>
                                                        <FormGroup>
                                                            <Label for="article_source">Article Source</Label>
                                                            <Select refs="source" options={this.state.sources} value={this.state.fields.source} onChange={(e) => this.handleChange("article_source", e)} />  <FormText color="danger">{this.state.errors["article_source"]}</FormText>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={5}>
                                                <Row form>
                                                    <Col md={12}>
                                                        <FormGroup>
                                                            <Label for="article_category">Article Category</Label>
                                                            <Select refs="category" value={this.state.fields.category} options={this.state.categories} onChange={(e) => this.handleChange("article_category", e)} />
                                                            <FormText color="danger">{this.state.errors["article_category"]}</FormText>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                <Row form>
                                                    <Col md={12}>
                                                        <FormGroup>
                                                            <Label for="published_on">Published On</Label>
                                                            <Datetime refs="published_on" value={this.state.fields.published_on} dateFormat="YYYY-MM-DD" timeFormat={true} placeholder="YYYY-MM-DD" id="published_on" onChange={(e) => this.onChange("published_on", e)} />
                                                            <FormText color="danger">{this.state.errors["published_on"]}</FormText>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                <Row form>
                                                    <Col md={12}>
                                                        <FormGroup>
                                                            <Label for="cover_image">Cover Image</Label>
                                                            <input refs="cover_image" type="file" name="cover_image" className="" placeholder="Cover Image" id="cover_image" onChange={(e) => this.handleChange("cover_image", e)} value={this.state.cover_image_name} />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col md={4}>
                                                <div className="image-view">
                                                    {this.state.loading ?
                                                        <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
                                                        :
                                                        ""
                                                    }
                                                    {
                                                        this.state.fields.cover_image != "" ?
                                                            <div className="float-right mb-2 text-right text-danger cursor-pointer" onClick={(e) => this.deleteImage(e)} data_id={this.state.cover_image_id} title="Remove Image">X</div>
                                                            :
                                                            ""
                                                    }
                                                    <img src={this.state.cover_image} className="img-fluid" />
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={12}>
                                                <Row form>
                                                    <Col md={10}>
                                                        <FormGroup>
                                                            <Summernote
                                                                changedValue={this.onSummernoteChange}
                                                                value={this.state.fields.blurb}
                                                                isletter={true}
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col md={6}>
                                                        <Button color="success" onClick={(e) => this.articleSave(method)} type="button">Save</Button>&nbsp;&nbsp;
                                                        <Button color="success" onClick={(e) => this.articlePublish(method)} type="button">Save & Publish</Button>&nbsp;&nbsp;
                                                        <Button color="secondary" onClick={this.redirecttoArticleList} type="button">Cancel</Button>
                                                    </Col>
                                                    <Col md={6}>
                                                        {this.state.formSuccess ?
                                                            <h6 className="text-success mt-2">Article submitted successfully.</h6>
                                                            : ""}
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Form>
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

export default ArticleForm;

ReactDOM.render(<ArticleForm />, document.getElementById('root'));
serviceWorker.unregister();
