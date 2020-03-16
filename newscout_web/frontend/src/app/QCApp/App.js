import React from 'react';
import ArticleCard from '../../components/ArticleCard';
import {Alert, Button} from 'reactstrap';
import Select from 'react-select';
import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import { authHeaders } from '../../utils/Utils';

// Be sure to include styles at some point, probably during your bootstraping
import '@trendmicro/react-sidenav/dist/react-sidenav.css';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      articles: [],
      selectedArticles: [],
      selectedCategory: null,
      categories: [],
      isLoading: true,
      page: 1,
      selected: 'home',
      expanded: false,
      domain: DOMAIN
    };
  }

  loadData = (page=1, model='articles') => {
    var URL;

    if(model === 'articles'){
      URL = `http://www.newscout.in/api/v1/article/search/?category=uncategorized&format=json&rows=100&page=${page}&domain=${this.state.domain}`;
    }else{
      URL = `/api/v1/menus/?format=json&domain=${this.state.domain}`;
    }

    fetch(URL)
      .then(response => response.json())
      .then(data => {
        if(model === 'articles'){
          this.setState({ articles: data, isLoading: false });
        }else{
          var options = []
          for(var current in data.body.results){
            var result = data.body.results[current];
            if(result.heading.submenu){
              for(var menu in result.heading.submenu){
                var tag = {label: result.heading.submenu[menu].name, value: result.heading.submenu[menu].category_id}
                if(tag.label !== "Uncategorised"){
                  options.push(tag);
                }
              }
            }
          }
          this.setState({ categories: options, isLoading: false });
        }
      });
  }

  loadDataset = (direction='next') => {
    var pageToFetch;
    if(direction === 'next'){
      pageToFetch = this.state.page + 1;
    }else if(direction === 'refresh'){
      pageToFetch = this.state.page;
    }else{
      pageToFetch = this.state.page - 1;
    }
    this.setState({page: pageToFetch, isLoading: true});
    this.loadData(pageToFetch);
  }

  articleSelectionHandler = (articleID, action) => {
    var currentSelection = this.state.selectedArticles;
    if(action === 'selected'){
      currentSelection.push(articleID)
    }else{
      var position = currentSelection.indexOf(articleID)
      currentSelection.splice(position, 1);
    }
    this.setState({selectedArticles: currentSelection});
  }

  categoryChangeHandler = (selectedOption) => {
    this.setState({selectedCategory: selectedOption.value});
  }

  bulkUpdateHandler = () => {
    fetch('http://www.newscout.in/api/v1/categories/bulk/', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
       categories: this.state.selectedCategory,
       articles: this.state.selectedArticles,
      })
    })
    .then(response => response.json())
    .then(data => {
      this.setState({selectedCategory: null, selectedArticles: []});
      this.loadDataset('refresh');
    });
  }

  componentDidMount(){
    // load categories first and then articles
    this.loadData(0, 'categories');
    this.loadData();
  }

  footerStyle = {
    position: 'fixed',
    left: 0,
    bottom: 0,
    width: '100%',
    color: 'white',
  }

  onSelect = (selected) => {
    this.setState({
      selected: selected
    })
  }

  onToggle = (expanded) => {
    this.setState({
      expanded: expanded
    })
  }

  render(){
    const { expanded, selected } = this.state;
    let contents;
    if(!this.state.isLoading && this.state.articles.length != 0){
      contents = this.state.articles.body.results.map((article) =>
        <ArticleCard item={article} toggleHandler={this.articleSelectionHandler}/>
      );
    }else{
      contents = <div className='col-md-12'><h1 className='mx-20'>Fetching data...</h1></div>;
    }

    return (
      <React.Fragment>
        <div className="App">
          <nav className="navbar fixed-top navbar-expand-sm navbar-dark bg-dark">
            <div className="inner-section">
              <img className="logo" src="/static/images/logo/logo.jpg" alt="logo" />
            </div>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarCollapse">
              <ul className="navbar-nav mr-auto">
                <li>
                  <Select options={this.state.categories} onChange={this.categoryChangeHandler}/>
                </li>
              </ul>
              {this.state.selectedArticles.length >= 1 && this.state.selectedCategory && <Button onClick={() => this.bulkUpdateHandler()}>Update</Button>} |
              {this.state.page != 1 && <Button onClick={() => this.loadDataset('previous')}>Previous</Button>} | 
              <Button onClick={() => this.loadDataset('next')}>Next</Button>
            </div>
          </nav>
        </div>
     
        <Alert color={this.state.isLoading? "secondary" : "success"}>{this.state.isLoading? "Loading" : "Completed"}</Alert>
        <br />
        <div
            style={{
              marginLeft : expanded ? 240 : 64,
              padding : '15px 20px 0px 20px'
            }}
        >
          <SideNav onSelect={this.onSelect} onToggle={this.onToggle} >
            <SideNav.Toggle />
            <SideNav.Nav Selected={selected}>
                <NavItem eventKey="home">
                    <NavIcon>
                        <i className="fa fa-fw fa-home" />
                    </NavIcon>
                    <NavText title="Home">
                        HOME
                    </NavText>
                </NavItem>
                <NavItem eventKey="category">
                    <NavIcon>
                        <i className="fa fa-fw fa-list" />
                    </NavIcon>
                    <NavText  title="Category">
                        CATEGORY
                    </NavText>
                    <NavItem eventKey="category/CAT A">
                      <NavText>
                        CAT A
                      </NavText>
                    </NavItem>
                    <NavItem eventKey="category/CAT B">
                      <NavText>
                        CAT B
                      </NavText>
                    </NavItem>
                    <NavItem>
                      <NavText>
                        CAT C
                      </NavText>
                    </NavItem>
                </NavItem>
                <NavItem eventKey="sorting">
                  <NavIcon>
                      <i className="fa fa-fw fa-sort" />
                  </NavIcon>
                  <NavText  title="Sorting">
                      SORTING
                  </NavText>
                </NavItem>

                <NavItem eventKey="settings">
                    <NavIcon>
                        <i className="fa fa-fw fa-cogs" />
                    </NavIcon>
                    <NavText title="SETTINGS">
                        SETTINGS
                    </NavText>
                </NavItem>
                <NavItem eventKey="charts">
                    <NavIcon>
                        <i className="fa fa-fw fa-line-chart" />
                    </NavIcon>
                    <NavText title="Charts">
                        CHARTS
                    </NavText>
                    <NavItem eventKey="charts/linechart">
                        <NavText>
                            Line Chart
                        </NavText>
                    </NavItem>
                    <NavItem eventKey="charts/barchart">
                        <NavText>
                            Bar Chart
                        </NavText>
                    </NavItem>
                </NavItem>
            </SideNav.Nav>
          </SideNav>
            <div className="row" >
              {contents}
            </div>
        </div>
      </React.Fragment>
    );
  }
}

export default App;
