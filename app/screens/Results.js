import React, {
  Component
} from 'react';

import {
  Screen,
  ListView,
  Row,
  Text,
} from '@shoutem/ui';

export default class Results extends Component {
  constructor(props) {
    super(props);

    this.renderRow = this.renderRow.bind(this);
  }

  renderRow(resultItem) {
    return (
      <Row>
        <Text numberOfLines={1}>{resultItem.label}</Text>
      </Row>
    );
  }

  render() {
    return (
      <Screen>
        <ListView
          data={this.props.results}
          renderRow={this.renderRow}
        />
      </Screen>
    );
  }
}
