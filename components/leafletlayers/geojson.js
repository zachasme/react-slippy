import React from 'react'
import L from 'leaflet'

import Layer from './layer.js'

export default class GeoJSON extends Layer {
  initLayer(props) {
    const {geojson, ...options} = props;
    return L.geoJson(geojson, options)
  }

  componentWillReceiveProps(nextProps) {
    this.reload(nextProps)
  }
}
