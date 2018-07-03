import React from 'react';
import PropTypes from 'prop-types';

import config from 'config';
import internalFetch from '../../helpers/internal-fetch';
import { PanelConsumer } from '../MainLayout/PanelContext';
import EditProcessorForm from '../../components/Processors/EditProcessor';

export class EditProcessorContainer extends React.Component {
  static propTypes = {
    processor: PropTypes.object,
    closePanel: PropTypes.func
  };

  state = {
    isLoading: false,
    errors: {}
  };

  async updateProcessor(processor) {
    await internalFetch(`${config.API_URL}/api/management/processors/update`, {
      method: 'POST',
      body: JSON.stringify(processor)
    }).catch(err => {
      this.setState({
        errors: {
          '': err.message
        }
      });
      return Promise.reject(err);
    });
  }

  startLoading() {
    this.setState({
      isLoading: true
    });
  }

  stopLoading() {
    this.setState({
      isLoading: false
    });
  }

  onSubmit(processor) {
    this.startLoading();

    // Clone data to avoid updating form until save is done
    const processorData = Object.assign({}, processor);
    delete processorData.address;
    processorData.scopes = Object.keys(processor.scopes).reduce((scopes, s) => {
      return processor.scopes[s] ? scopes.concat(s) : scopes;
    }, []);

    return this.updateProcessor(processorData)
      .then(this.stopLoading.bind(this))
      .then(() => this.props.closePanel && this.props.closePanel())
      .catch(this.stopLoading.bind(this));
  }

  render() {
    return (
      <EditProcessorForm
        values={this.props.processor}
        errors={this.state.errors}
        onSubmit={this.onSubmit.bind(this)}
        isLoading={this.state.isLoading}
      />
    );
  }
}

export default props => (
  <PanelConsumer>
    {({ closePanel }) => <EditProcessorContainer {...props} closePanel={closePanel} />}
  </PanelConsumer>
);