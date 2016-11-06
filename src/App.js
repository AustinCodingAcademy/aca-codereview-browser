import React, { Component } from 'react';
import './App.css';
import './css/bootstrap.min.css';
import 'react-select/dist/react-select.css';
import { Navbar, FormGroup, ButtonGroup, Button } from 'react-bootstrap';
import Select from 'react-select';
import 'whatwg-fetch';
import { GITHUB_USER } from './config';
import _ from 'lodash';

const VIEW_CHANGES = 'changes';
const VIEW_WEBSITE = 'website';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      labels: [ ],
      repos: [ ],
      pullRequests: [ ],
      repo: null,
      label: null,
      pullRequest: null,
      view: VIEW_WEBSITE
    };
  }

  componentDidMount() {
    this.getRepos();
  }

  getRepos = () => {
    fetch(`https://api.github.com/search/repositories?q=user:${GITHUB_USER}`)
      .then(response => response.json())
      .then(json => {
      this.setState({
        repos: _.map(_.get(json, 'items'), item => ({
          label: _.get(item, 'name'),
          value: _.get(item, 'name')
        }))
      });
    }).catch(function(ex) {
      console.log('parsing failed', ex)
    });
  };

  handleRepoSelect = (value) => {
    this.setState({
      repo: value,
      label: null,
      pullRequest: null
    }, () => this.getLabels());
  };

  getLabels = () => {
    fetch(`https://api.github.com/repos/${GITHUB_USER}/${_.get(this.state, 'repo.value')}/labels`)
      .then(response => response.json())
      .then(json => {
        this.setState({
          labels: _.map(json, item => ({
            label: _.get(item, 'name'),
            value: _.get(item, 'name')
          })),
          pullRequests: []
        });
    }).catch(function(ex) {
      console.log('parsing failed', ex)
    });
  };

  handleLabelSelect = value => {
    this.setState({
      label: value,
      pullRequest: null,
      pullRequests: []
    }, () => {
      this.loadPullRequests();
    });
  };

  loadPullRequests() {
    fetch(`https://api.github.com/search/issues?q=repo:${GITHUB_USER}/${_.get(this.state, 'repo.value')}+label:"${encodeURIComponent(this.state.label.value)}"+type:pr+state:open`)
      .then(response => response.json())
      .then(json => {
        console.log('Pulls loaded', json);
        this.setState({
          pullRequests: _.map(json.items, item => {
            return {
              label: _.get(item, 'title'),
              value: item
            };
          })
        })
      }).catch(function(ex) {
        console.log('parsing failed', ex)
      });
  };

  handlePullRequestSelect = (value) => {
    this.setState({
      pullRequest: value
    });
  };

  render() {
    const {repo, label, pullRequest, pullRequests, labels, repos, view} = this.state;

    let url = null;
    let codeUrl = null;
    if (repo && label && pullRequest) {
      if (view === VIEW_CHANGES) {
        codeUrl = `https://github.com/${GITHUB_USER}/${repo.value}/pull/${_.get(pullRequest, 'value.number')}/files`;
      } else {
        url = `https://${_.get(pullRequest, 'value.user.login')}.github.io/${repo.value}/`;
      }
    }

    return (
      <div className="App">
        <Navbar inverse staticTop fluid>
          <Navbar.Header>
            <Navbar.Brand>
              ACA Code Review Browser
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Form pullLeft>
            <FormGroup>
              <Select
                style={{width: '200px'}} options={repos} placeholder="Repository"
                onChange={this.handleRepoSelect} value={repo}/>
            </FormGroup>
            {' '}
            <FormGroup>
              <Select
                style={{width: '200px'}} options={labels} placeholder="Label"
                onChange={this.handleLabelSelect} value={label}/>
            </FormGroup>
            {' '}
            <FormGroup>
              <Select style={{width: '200px'}} options={pullRequests} placeholder="Pull Request"
                onChange={this.handlePullRequestSelect} value={pullRequest}/>
            </FormGroup>
            {' '}
            <FormGroup>
              <ButtonGroup>
                <Button onClick={() => this.setState({view: VIEW_CHANGES})} active={view === VIEW_CHANGES}>
                  <a href={codeUrl} target="_blank">Code</a>
                </Button>
                <Button onClick={() => this.setState({view: VIEW_WEBSITE})} active={view === VIEW_WEBSITE}>Website</Button>
              </ButtonGroup>
            </FormGroup>
          </Navbar.Form>
        </Navbar>
        <div className="App-content">
          {url && <iframe src={url}></iframe>}
        </div>
      </div>
    );
  }
}

export default App;
