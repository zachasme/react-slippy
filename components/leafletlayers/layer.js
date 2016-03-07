import React, {Component, PropTypes} from 'react';

export default class Layer extends Component {
  static PropTypes = {
    map: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.mount(this.props)
  }

  componentWillReceiveProps(nextProps) {
    nextProps.disabled && nextProps.map.hasLayer(this.layer) && nextProps.map.removeLayer(this.layer)
    !nextProps.disabled && !nextProps.map.hasLayer(this.layer) && nextProps.map.addLayer(this.layer)
    this.setState({layer: this.layer})
  }

  componentWillUnmount() {
    this.destroy(this.props)
  }

  layerDidMount(){return null}
  layerWillUnmount(){return null}

  reload(props) {
    this.destroy(props)
    this.mount(props)
  }

  mount(props) {
    this.layer = this.initLayer(props)
    this.layer && !props.disabled && props.map.addLayer(this.layer)
    this.setState({layer: this.layer})
  }
  destroy(props) {
    props.map.removeLayer(this.layer)
  }

  render() {
    return null
  }
}
