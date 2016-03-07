import React, {Component, PropTypes} from 'react';
import L from 'leaflet';

import Layer from './layer.js';

export default class WMSTileLayer extends Layer {
  static propTypes = {
    url: PropTypes.string.isRequired,
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
  }

  initLayer() {
    const {url, name, ...options} = this.props;
    return L.tileLayer.wms(url, {
      service: 'WMS',
      transparent: true,
      attribution: 'Geodatastyrelsen',
      format: 'image/png',
      styles: 'default',
      continuousWorld: false,
      ...options,
    });
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(nextProps)
    this.layer.setParams(nextProps)
  }
}
