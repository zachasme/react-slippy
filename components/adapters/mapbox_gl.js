import { PropTypes } from 'react'

import mapboxgl from 'mapbox-gl'
import topojson from 'topojson'
mapboxgl.accessToken = ''

import SlippyMapBase from '../slippy_map_base.js'

function detectType(geojson) {
  try {
    switch(geojson.type) {
      case 'FeatureCollection':
        return detectType(geojson.features[0])
      case 'Feature':
        switch(geojson.geometry.type) {
          case 'Point':
          case 'MultiPoint':
            return 'symbol'
          case 'LineString':
          case 'MultiLineString':
            return 'line'
          case 'Polygon':
          case 'MultiPolygon':
            return 'fill'
          case 'GeometryCollection':
            return detectType(geojson.geometry.geometries[0])
        }
      default:
        console.log(`Type not detected in ${JSON.stringify(geojson)}`)
        return 'fill'
    }
  } catch (error) {
    return 'fill'
  }
}

/**
 * Adapter for Mapbox GL JS
 *
 * Main concerns are:
 *  1. all content must geojson
 *  2. events such as click must be registered on root map
 */
export default class SlippyMapMapbox extends SlippyMapBase {
  static propTypes = {
    accessToken: PropTypes.string.isRequired,
    style: PropTypes.string.isRequired,

    touchZoomRotate: PropTypes.bool,
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
    hash: PropTypes.bool,
    interactive: PropTypes.bool,
    bearingSnap: PropTypes.number,
    // classes
    attributionControl: PropTypes.bool,
    // container
    preserveDrawingBuffer: PropTypes.bool,
    maxBounds: PropTypes.array,
    scrollZoom: PropTypes.bool,
    boxZoom: PropTypes.bool,
    dragRotate: PropTypes.bool,
    dragPan: PropTypes.bool,
    keyboard: PropTypes.bool,
    doubleClickZoom: PropTypes.bool,
    failIfMajorPerformanceCaveat: PropTypes.bool,

    onMouseDown: PropTypes.func,
    onMouseMove: PropTypes.func,
    onMouseUp: PropTypes.func,
  };

  static defaultProps = {
    interactive: true,
  };

  constructor(props) {
    super(props)
    mapboxgl.accessToken = props.accessToken
    this.old = {layers:[],sources:[]}
    this.IDINC = 0
  }

  mount(element) {
    const {
      center,
      style,
      zoom,
      interactive,
    } = this.props;

    // initialize mapbox map inside DOM node
    const map = new mapboxgl.Map({
      container: element,
      style, // stylesheet location
      center: Array.from(center).reverse(), // starting position
      zoom, // starting zoom
      interactive,
    });

    if (this.props.bounds) {
      var sw = new mapboxgl.LngLat(...this.props.bounds[0]);
      var ne = new mapboxgl.LngLat(...this.props.bounds[1]);
      var llb = new mapboxgl.LngLatBounds(sw, ne);

      map.fitBounds(llb)
    }

    // initialize global popup object
    this.popup = new mapboxgl.Popup()

    map.on('click', event => {
      map.featuresAt(event.point, {
        radius: 7.5, // Half the marker size (15px).
        includeGeometry: true,
        //layer: 'markers',
      }, (error, features) => {
        if (error || !features.length) {
          this.popup.remove()
          return
        }

        const feature = features[0]

        // Popuplate the popup and set its coordinates
        // based on the feature found.
        this.popup.setLngLat(event.lngLat)
          .setHTML(feature.properties.description)
          .addTo(map)
      })
    })

    // wait for map load event before flagging as ready
    return new Promise(resolve => {
      map.on('load', () => resolve(map))
    })
  }

  // componentWillReceiveProps = nextProps => {}

  // never update DOM since component is static div
  //shouldComponentUpdate = () => false;

  unmount(instance) {
    instance.remove();
  }

  reduce(elements) {
    const reduced = elements.map(element => {
      const { type, props } = element
      const id = ++this.IDINC

      switch(type) {
        case 'group':
          return this.reduce(element.props.children)
        case 'marker':
          // recursively handle as geojson
          return this.reduce([{
            type: 'geojson',
            props: {
              data: {
                type: 'Feature',
                properties: {
                  description: 'wat',
                },
                geometry: {
                  type: 'Point',
                  coordinates: props.position.reverse(),
                },
              },
            },
          }])
        case 'multimarker':
          // recursively handle as geojson
          return this.reduce([{
            type: 'geojson',
            props: {
              data: {
                type: 'FeatureCollection',
                features: props.markers.map(marker => (

                  {
                    type: 'Feature',
                    properties: {
                      description: 'wat',
                    },
                    geometry: {
                      type: 'Point',
                      coordinates: marker.position.reverse(),
                    },
                  }

                )),
              },
            },
          }])
        case 'geojson':
          let layerType = detectType(props.data)
          let layerProps
          if (layerType === 'symbol') {
            layerProps = {
              type: layerType,
              interactive: true,
              "layout": {
                  "icon-image": "marker-15",
/*                  "text-field": "{title}",
                  "text-field": "marker",
                  "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                  "text-offset": [0, 0.6],
                  "text-anchor": "top"*/
              }
            }
          } else {
            layerProps = {
              type: layerType,
              paint: props.paint,
              filter: props.filter,
            }
          }
          return [
            {
              type: 'TYPE_SOURCE',
              props: {
                id: `source_${id}`,
                raw: new mapboxgl.GeoJSONSource({
                  data:{type:'FeatureCollection', features: []},
                }),
                type: 'geojson',
                data: props.data,
                onEachFeature: props.onEachFeature,
              },
            },
            {
              type: 'TYPE_LAYER',
              props: {
                id: `layer_${id}`,
                source: `source_${id}`,
                ...layerProps
              },
            },
          ]
        default:
          return element
      }
    })

    return [].concat.apply([], reduced)
  }

  patch(elements, diff) {
    this.old.sources.map(id => {
      this.instance.removeSource(id)
    })
    this.old.layers.map(id => {
      this.instance.removeLayer(id)
    })

    this.old.sources = []
    this.old.layers = []

    const acc = {
      sources: [],
      layers: [],
    }
    elements.forEach(item => {
      const { sources, layers } = this.create(item)
      acc.sources = acc.sources.concat(sources)
      acc.layers = acc.layers.concat(layers)
    })

    acc.sources.map(([id, source]) => {
      this.old.sources.push(id)
      this.instance.addSource(id, source)
    })
    acc.layers.map(layer => {
      this.old.layers.push(layer.id)
      this.instance.addLayer(layer)
    })
  }

  create(item) {
    const acc = {
      sources: [],
      layers: [],
    }
    let sourceId, layerId, layer, source
    switch (item.type) {
      case 'TYPE_SOURCE':
        let {id, ...sourceprops} = item.props
        if (typeof item.props.data === 'string') {
          fetch(item.props.data).then(response => response.json()).then(data => {
            if (data.type === "Topology") {
              data = topojson.feature(data, data.objects.default)
            }
            if (item.props.onEachFeature) {
              data.features.forEach(item.props.onEachFeature)
            }
            sourceprops.raw.setData(data)
          })
        } else {
          sourceprops.raw.setData(item.props.data)
        }
        acc.sources.push([id, sourceprops.raw])
        break;
      case 'TYPE_LAYER':
        acc.layers.push(item.props)
        break;
      case 'raster':
        sourceId = "raster" + (++this.IDINC)
        layerId = "layer" + (++this.IDINC)
        console.log("RASTER",item)
        source = [
          sourceId,
          {
            "type": "raster",
            // point to our third-party tiles. Note that some examples
            // show a "url" property. This only applies to tilesets with
            // corresponding TileJSON (such as mapbox tiles).
            "tiles": [
              item.props.url
            ],
            "tileSize": 256
          }
        ]
        layer = {
          "id": layerId,
          "type": "raster",
          "source": sourceId,
          "minzoom": 0,
          "maxzoom": 22
        }
        acc.sources.push(source)
        acc.layers.push(layer)
        break;
      default:
        console.warn('unknown', item)
    }

    return acc
  }

}
