import React, {Component, PropTypes} from 'react';
import {tileLayer} from 'leaflet';

import Layer from './layer.js';

export default class TileLayer extends Layer {
  static propTypes = {
    url: PropTypes.string.isRequired,
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
  }

  initLayer() {
    const {url, name, ...options} = this.props;
    return tileLayer(url, options);
  }
}
