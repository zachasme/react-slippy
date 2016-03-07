import React, {Component, PropTypes} from 'react';
import {marker} from 'leaflet';

import Layer from './layer.js';

export default class Marker extends Layer {
  static propTypes = {
    position: PropTypes.array.isRequired
  };

  initLayer() {
    const {position, tooltip, ...options} = this.props;
    const m = marker(position, options)
    if (tooltip) m.bindPopup(tooltip)
    return m
  }

  componentWillReceiveProps(nextProps) {
    this.layer.setLatLng(nextProps.position)
  }

  render() {
    return null;
  }
}
