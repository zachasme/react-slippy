import React, { PropTypes } from 'react'
import Layer from './layer.js'

export default class LayerGroup extends Layer {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.instanceOf(Layer),
      PropTypes.arrayOf(PropTypes.instanceOf(Layer)),
    ]).isRequired
  };
}
