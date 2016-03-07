import { Component, PropTypes } from 'react'

export class SlippyComponent extends Component {}

export class Group extends SlippyComponent {
  static propTypes = {
  };
}
export class GeoJSON extends SlippyComponent {
  static propTypes = {
    data: PropTypes.oneOfType([
      PropTypes.string,
    ]),
  };
}
export class Marker extends SlippyComponent {}
export class Path extends SlippyComponent {}
export class Polygon extends SlippyComponent {}

// optimized classes
export class MultiMarker extends SlippyComponent {
  static propTypes = {
    markers: PropTypes.array.isRequired,
  };
}

export class TileVector extends SlippyComponent {}
export class TileRaster extends SlippyComponent {}
export class TileRasterWMS extends SlippyComponent {}

export class Image extends SlippyComponent {}
export class Video extends SlippyComponent {}

// also expose low level adapter stuff
export class MapboxGLComponent extends SlippyComponent {}
export class MapboxGLSource extends MapboxGLComponent {}
export class MapboxGLLayer extends MapboxGLComponent {}

export class LeafletComponent extends SlippyComponent {}
export class LeafletZoomControl extends LeafletComponent {}
