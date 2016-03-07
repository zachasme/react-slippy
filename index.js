import SlippyMapLeaflet from './components/adapters/leaflet.js'
import SlippyMapMapboxGL from './components/adapters/mapbox_gl.js'

const SlippyMap = SlippyMapMapboxGL
export default SlippyMap
export {
  SlippyMap,
  SlippyMapLeaflet,
  SlippyMapMapboxGL,
}

export * from './components/slippy_components.js'
