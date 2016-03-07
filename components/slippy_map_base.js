import React, { Children, Component, PropTypes } from 'react'
import jsondiffpatch from 'jsondiffpatch'

import {Group, Layer, TileRaster, Marker, MultiMarker, GeoJSON} from './slippy_components.js'

import styles from './slippy_map.css'

export default class SlippyMapBase extends Component {
  // mount(element) => Promise(map)
  // unmount(map) => void

  constructor(props) {
    super(props)

    // reference to mapping client instance
    this.instance = null

    this.layers = []
  }

  get isReady() {
    return this.instance !== null
  }

  async componentDidMount() {
    // get reference to mounted DOM node
    const element = this.refs.container

    // wait for map instance to be ready
    this.instance = await this.mount(element)
    console.log("Instance is now ready, updating...")

    // update map contents
    this.update(this.props)
  }

  componentWillReceiveProps = (nextProps) => this.update(nextProps)

  componentWillUnmount() {
    this.unmount(this.instance)
    this.instance = null
  }

  update(props) {
    // bounce updates until map is ready
    if (!this.isReady) {
      return
    }

    let layers = this.normalize(props.children)
    //console.log("POSTNORMALIZE", layers)
    layers = this.reduce(layers)
    //console.log("POSTREDUCE", layers)
    //const diff = jsondiffpatch.diff(this.layers, layers)
    const diff = []
    this.patch(layers, diff)

    this.layers = layers
  }

  reduce(x) {
    return x
  }

  /**
   * Traverse element tree and normalize into diffable object
   */
  normalize(elements) {
    return Children.map(elements, element => {
      if (element === null) return {}
      const { type, props } = element
      switch(type) {
        case Marker:
          return {
            type: 'marker',
            props: {
              position: props.position,
              //popup: React.renderToString(props.children),
            },
          }
        case MultiMarker:
          return {
            type: 'multimarker',
            props: {
              markers: props.markers,
              //popup: React.renderToString(props.children),
            },
          }
        case TileRaster:
          return {
            type: 'raster',
            props: {
              url: props.url,
            }
          }
        case Group:
          return {
            type: 'group',
            props: {
              children: this.normalize(props.children) || [],
            },
          }
        case GeoJSON:
          return {
            type: 'geojson',
            props: {
              data: props.data,
              paint: props.paint,
              filter: props.filter,
              onEachFeature: props.onEachFeature,
            },
          }
        default:
          return {type: 'unsupported type'}
      }
    })
  }

  // never update DOM since component is static div
  shouldComponentUpdate = () => false

  render() {
    return React.DOM.div({
       ref: "container",
       className: styles.container,
    })
  }
}
