import L, {geoJson, layerGroup, marker, tileLayer} from 'leaflet';
L.Icon.Default.imagePath = '/jspm_packages/npm/leaflet@1.0.0-beta.2/dist/images';

import 'leaflet/dist/leaflet.css!'
import topojson from 'topojson'

import SlippyMapBase from '../slippy_map_base.js'

export default class SlippyMapLeaflet extends SlippyMapBase {
  constructor(props) {
    super(props)

    this.oldlayers = []
  }

  mount(element) {
    const {center, zoom} = this.props;

    // initialize mapbox map inside DOM node
    const instance = L.map(element, {zoomControl: false})
    instance.setView(center, zoom)

    return instance
  }

  // destroy leaflet instance
  unmount(instance) {
    instance.remove();
  }

  patch(layers, diff) {
    this.oldlayers.forEach(layer => this.instance.removeLayer(layer))
    this.oldlayers = layers.map(layer => this.create(layer))
    this.oldlayers.forEach(layer => { if(layer) this.instance.addLayer(layer) })
  }

  create(layer) {
    switch(layer.type) {
      case 'marker':
        return marker(layer.props.position)
      case 'multimarker':
        return layerGroup(layer.props.markers.map(m => marker(m.position)))
      case 'raster':
        return tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png')
      case 'group':
        const group = layerGroup()
        layer.props.children.map(child => this.create(child).addTo(group))
        this.instance.addLayer(group)
        return group
      case 'geojson':
        const l = geoJson()
        if (typeof layer.props.data === 'string') {
          fetch(layer.props.data).then(response => response.json()).then(data => {
            if (data.type === "Topology") {
              data = topojson.feature(data, data.objects.default)
            }
            l.addData(data)
          })
        } else {
          l.addData(layer.props.data)
        }
        return l
      default:
        console.log('unsupported by leaflet', layer)
        return null
    }
  }

}
