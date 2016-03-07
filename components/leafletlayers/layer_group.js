import React, {Component, Children, cloneElement, PropTypes} from 'react';

export default function LayerGroup(props) {
  return {
    type: 'LAYER_GROUP',
    children: this.props.children,
  }
}
