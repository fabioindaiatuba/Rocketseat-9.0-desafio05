import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, StatusList, IssueList } from './styles';

export default class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loading: true,
    status: 'open',
    statusList: ['open', 'closed', 'all'],
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const { status } = this.state;

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: status,
          per_pages: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleRadioChange = async e => {
    const status = e.target.value;
    const { repository } = this.state;

    const issues = await api.get(`/repos/${repository.full_name}/issues`, {
      params: {
        state: status,
        per_pages: 5,
      },
    });

    this.setState({
      status,
      issues: issues.data,
    });
  };

  render() {
    const { repository, issues, loading, statusList, status } = this.state;

    if (loading) {
      return <Loading>Carregando...</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
          <StatusList id="testeForm">
            <span>Filtrar por status: </span>
            {statusList.map(st => (
              <div key={st}>
                <input
                  type="radio"
                  id={status}
                  name="status"
                  checked={st === status}
                  value={st}
                  onChange={this.handleRadioChange}
                />
                <label htmlFor={status}>{st}</label>
              </div>
            ))}
          </StatusList>
        </Owner>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.name} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
