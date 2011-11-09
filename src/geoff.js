if (!geoff) var geoff = {};
if (typeof module !== "undefined" && module.exports) {
	module.exports = geoff;
}
(function(geoff) {

 	/**
	 * Convert a GeoJSON geometry coordinate [x,y] array to a WGS94 object with
	 * "lat" and "lon" attributes.
	 */
 	geoff.ctoll = function(coord) {
		return {lat: coord[1], lon: coord[0]};
	};

 	/**
	 * Convert a GeoJSON geometry coordinate [x,y] array to an x/y
	 * object.
	 */
 	geoff.ctoxy = function(coord) {
		return {x: coord[0], y: coord[1]};
	};

 	/**
	 * Convert a WGS94 object with "lat" and "lon" attributes to a GeoJSON
	 * geometry coordinate [x,y] array.
	 */
 	geoff.lltoc = function(latlon) {
		return [latlon.lon, latlon.lat];
	};

 	/**
	 * Convert a lat/lon object to a point object with "x" and "y"
	 * attributes (corresponding to lon and lat, respectively).
	 */
 	geoff.lltoxy = function(latlon) {
		return {x: latlon.lon, y: latlon.lat};
	};

 	/**
	 * Convert an x/y object to a GeoJSON geometry coordinate [x,y]
	 * array.
	 */
 	geoff.xytoc = function(xy) {
		return [xy.x, xy.y];
	};

 	/**
	 * Convert an x/y object to a lat/lon object.
	 */
 	geoff.xytoll = function(xy) {
		return {lat: xy.y, lon: xy.x};
	};

 	/**
	 * Create a GeoJSON Point feature from a single WGS84 lat/lon object and an
	 * optional properties object.
	 */
	geoff.lltoPoint = function(latlon, properties) {
		return geoff.feature.Point(geoff.lltoc(latlon), properties);
	};

	/**
	 * GeoJSON feature generators.
	 */
	geoff.feature = (function() {
		// generate a GeoJSON feature object.
		var feature = function(type, coords, properties) {
			switch (type) {
				case "GeometryCollection":
					return {
						type: "Feature",
						properties: properties || {},
						geometry: {
							type: type,
							geometries: coords || []
						}
					};
			}
			return {
				type: "Feature",
				properties: properties || {},
				geometry: {
					type: type,
					coordinates: coords || []
				}
			};
		};

		feature.Point = function(coord, properties) {
			return feature("Point", coord, properties);
		};

		feature.Polygon = function(rings, properties) {
			return feature("Polygon", rings, properties);
		};

		feature.LineString = function(points, properties) {
			return feature("LineString", points, properties);
		};

		feature.MultiLineString = function(lines, properties) {
			return feature("MultiLineString", lines, properties);
		};

		feature.MultiPolygon = function(polygons, properties) {
			return feature("MultiPolygon", polygons, properties);
		};

		feature.MultiPoint = function(points, properties) {
			return feature("MultiPoint", points, properties);
		};

		feature.GeometryCollection = function(geometries, properties) {
			return feature("GeometryCollection", geometries, properties);
		};

		feature.clone = function(feature, properties, deep) {
			var copy = geoff.clone(feature, deep ? 10 : 0);
			if (properties) geoff.merge(properties, feature.properties);
			return copy;
		};

		return feature;
	})();

	geoff.clone = function(obj, depth) {
		if (typeof depth == "undefined") depth = 0;
		if (obj instanceof Array) {
			return (depth > 0)
				? obj.map(function(o) { return geoff.clone(o, depth - 1); })
				: obj.slice();
		} else {
			var out = {};
			for (var p in obj) {
				if (p == "__proto__") continue;
				out[p] = (typeof obj[p] == "object" && depth > 0)
					? geoff.clone(obj[p], depth - 1)
					: obj[p];
			}
			return out;
		}
	};

	geoff.merge = function(a, b) {
		for (var p in a) {
			if (p == "__proto__") continue;
			if (typeof a[p] == "object" && typeof b[p] == "object") {
				geoff.merge(a[p], b[p]);
			} else {
				b[p] = a[p];
			}
		}
	};

	/**
	 * An extent is a lat/lon bounding box. Extents an be used to calculate
	 * feature bounding boxes, determine
	 */
	geoff.extent = function(coords) {
		// By default an extent is infinite.
		var extent = {
			min: {lon: Infinity, lat: Infinity},
			max: {lon: -Infinity, lat: -Infinity}
		};

		// cover the globe
		extent.world = function() {
			extent.min = {lon: -180, lat: -89.999};
			extent.max = {lon: +180, lat: +89.999};
			return extent;
		};

		extent.size = function(latlon) {
			if (arguments.length) {
				var center = extent.center();
				extent.min.lon = center.lon - latlon.lon / 2;
				extent.max.lon = center.lon + latlon.lon / 2;
				extent.min.lat = center.lat - latlon.lat / 2;
				extent.max.lat = center.lat + latlon.lat / 2;
				return extent;
			} else {
				return {
					lon: extent.max.lon - extent.min.lon,
					lat: extent.max.lat - extent.min.lat
				};
			}
		};

		extent.offset = function(latlon) {
			extent.min.lon += latlon.lon;
			extent.max.lon += latlon.lon;
			extent.min.lat += latlon.lat;
			extent.max.lat += latlon.lat;
			return extent;
		};

		extent.center = function(latlon) {
			if (arguments.length) {
				// TODO
			} else {
				return {
					lon: extent.min.lon + size.lon / 2,
					lat: extent.min.lat + size.lat / 2
				};
			}
		};

		// Northwest, Southeast, Northeast and Southwest corner getter/setters
		extent.northwest = function(latlon) {
			if (arguments.length) {
				extent.min.lon = latlon.lon;
				extent.max.lat = latlon.lat;
				return extent;
			} else {
				return {lat: extent.max.lat, lon: extent.min.lon};
			}
		};
		extent.southeast = function(latlon) {
			if (arguments.length) {
				extent.max.lon = latlon.lon;
				extent.min.lat = latlon.lat;
				return extent;
			} else {
				return {lat: extent.min.lat, lon: extent.max.lon};
			}
		};
		extent.northeast = function(latlon) {
			if (arguments.length) {
				extent.max.lon = latlon.lon;
				extent.max.lat = latlon.lat;
				return extent;
			} else {
				return {lat: extent.max.lat, lon: extent.max.lon};
			}
		};
		extent.southwest = function(latlon) {
			if (arguments.length) {
				extent.min.lon = latlon.lon;
				extent.min.lat = latlon.lat;
				return extent;
			} else {
				return {lat: extent.min.lat, lon: extent.min.lon};
			}
		};

		// Reset the extent to infinite bounds so that min/max calculations work out.
		extent.reset = function() {
			extent.min = {lon: Infinity, lat: Infinity};
			extent.max = {lon: -Infinity, lat: -Infinity};
			return extent;
		};

		// Returns true if the extent contains the given lat/lon location
		extent.containsLocation = function(latlon) {
			return !(
				latlon.lon < extent.min.lon ||
				latlon.lat < extent.min.lat ||
				latlon.lon > extent.max.lon ||
				latlon.lat > extent.max.lat
			);
		};

		// Returns true if the extent contains the given GeoJSON [x,y] coordinate
		extent.containsCoordinate = function(coord) {
			return !(
				coord[0] < extent.min.lon ||
				coord[1] < extent.min.lat ||
				coord[0] > extent.max.lon ||
				coord[1] > extent.max.lat);
		};

		// Returns true if the extent contains the provided extent
		extent.containsExtent = function(other) {
			return extent.containsLocation(other.min)
				&& extent.containsLocation(other.max);
		};

		// Returns true if the extent intersects the other one
		extent.intersects = function(other) {
			return !(
				extent.min.lon > other.max.lon ||
				extent.min.lat > other.max.lat ||
				extent.max.lon < other.min.lon ||
				extent.max.lat < other.min.lat);
		};

		// Get the intersection of two extents as a new extent object if they
		// intersect one another, or null if they don't.
		extent.intersection = function(other) {
			if (extent.intersects(other)) {
				var result = geoff.extent();
				result.min.lon = Math.max(extent.min.lon, other.min.lon);
				result.min.lat = Math.max(extent.max.lat, other.max.lat);
				result.max.lon = Math.min(extent.max.lon, other.max.lon);
				result.max.lat = Math.min(extent.min.lat, other.min.lat);
			}
			return null;
		};

		// Returns a 2-element array of lat/lon objects for use with
		// po.map().extent().
		extent.toArray = function() {
			return [{lon: extent.min.lon, lat: extent.min.lat},
						  {lon: extent.max.lon, lat: extent.max.lat}];
		};

		// Generate a Polygon feature from this extent
		extent.toFeature = function(properties) {
			var ring = extent.ring();
			return geoff.feature.Polygon([ring], properties);
		};

		// Get the "area" of the rectangle.
		extent.area = function() {
			return Math.abs((extent.max.lon - extent.min.lon) * (extent.max.lat - extent.min.lat));
		};

		// Returns true if the extent is empty
		extent.empty = function() {
			return extent.area() == 0;
		};

		// Returns true if the extent is empty
		extent.isFinite = function() {
			return isFinite(extent.area());
		};

		// Generate a GeoJSON coordinate ring corresponding to the four corners of
		// the extent rectangle
		extent.ring = function() {
			if (!extent.isFinite()) {
				throw new TypeError("Can't create a ring from an infinite extent!");
			}
			return [
				[extent.min.lon, extent.max.lat],
				[extent.max.lon, extent.max.lat],
				[extent.max.lon, extent.min.lat],
				[extent.min.lon, extent.min.lat],
				[extent.min.lon, extent.min.lat]
			];
		};

		// Buffer the extent by x and y values. If no y is provided we assume the x
		// value for both dimensions.
		extent.inflate = function(x, y) {
			if (arguments.length == 0) {
				throw new TypeError("Expecting 1 or two arguments for extent.buffer() (got zero)");
			}
			if (arguments.length == 1) {
				y = x;
			}
			if (x != 0 && !isNaN(x)) {
				extent.min.lon -= x;
				extent.max.lon += x;
			}
			if (y != 0 && !isNaN(y)) {
				extent.min.lat -= y;
				extent.max.lat += y;
			}
			return extent;
		};

		// Enclose a GeoJSON [x,y] coordinate
		extent.encloseCoordinate = function(coord) {
			extent.min.lon = Math.min(extent.min.lon, coord[0]);
			extent.max.lon = Math.max(extent.max.lon, coord[0]);
			extent.min.lat = Math.min(extent.min.lat, coord[1]);
			extent.max.lat = Math.max(extent.max.lat, coord[1]);
			return extent;
		};

		// Enclose a WGS84 lat/lon location
		extent.encloseLocation = function(latlon) {
			extent.encloseCoordinate([latlon.lon, latlon.lat]);
			return extent;
		};

		extent.encloseLocations = function(latlons) {
			latlons.forEach(extent.encloseLocation);
			return extent;
		};

		// Enclose a feature geometry.
		extent.encloseGeometry = function(geom) {
			switch (geom.type) {
				// Point geometries contain a single [x,y] coordinate
				case "Point":
					// enclose all of the point coordinates
					extent.encloseCoordinate(geom.coordinates);
					break;

				// LineString and MultiPoint geometries contain a list of coordinates:
				// [[x,y], [x,y]]
				case "LineString":
				case "MultiPoint":
					// enclose all of the point coordinates
					geom.coordinates.forEach(extent.encloseCoordinate);
					break;

				// MultiLineString and Polygon geometries contain a list of rings:
				// [[[x,y], [x,y]],
        //  [[x,y], [x,y]]]
				case "MultiLineString":
				case "Polygon":
					// enclose each of the points in each ring
					geom.coordinates.forEach(function(ring) {
						ring.forEach(extent.encloseCoordinate);
					});
					break;

				// MultiPolygon geometries contain a list of polygonal ring lists:
				// [[[[x,y], [x,y]], [[x,y], [x,y]]],
        //  [[[x,y], [x,y]], [[x,y], [x,y]]]]
				case "MultiPolygon":
					// enclose each of the points of each ring in each polygon
					geom.coordinates.forEach(function(polygon) {
						polygon.forEach(function(ring) {
							ring.forEach(extent.encloseCoordinate);
						});
					});
					break;

				// For GeometryCollection geometries, apply extent.encloseGeometry() to
				// each item in the "geometries" list.
				case "GeometryCollection":
					geom.geometries.forEach(extent.encloseGeometry);
					break;
			}
			return extent;
		};

		// Enclose a single feature.
		extent.encloseFeature = function(feature) {
			return extent.encloseGeometry(feature.geometry);
		};

		return extent;
	};

	// GeoJSON Coordinate functions
	geoff.coord = (function() {
		// Get a coord from either an Array or a lat/lon object
		var coord = function(point) {
			if (latlon instanceof Array) {
				return latlon.slice();
			} else {
				return geoff.lltoc(latlon);
			}
		};

		// TODO: implement wrap()

		// compare two coordinates
		coord.cmp = function(a, b) {
			return a[0] == b[0] && a[1] == b[1];
		};

		return coord;
	})();

	/**
	 * A buffer modifies GeoJSON geometries to include an outer ring around the
	 * rectangular extent of the feature. Call buffer.apply(feature, copy)
	 */
	geoff.buffer = function() {
		var buffer = {},
				extent = null,
				margin = null,
				radius = 1,
				fidelity = 32;

		buffer.extent = function(e) {
			if (arguments.length) {
				extent = e;
				return buffer;
			} else {
				return extent;
			}
		};

		// Set or get the margin. The setter takes either two numerical arguments:
		// lon (x) and lat (y), or a single location object with "lon" and
		// "lat" properties. If no arguments are provided, the margin is
		// returned as an object with lon and lat properties.
		buffer.margin = function(lon, lat) {
			if (arguments.length) {
				if (arguments.length == 1) {
					if (typeof lon == "object") {
						margin = lon;
					} else {
						margin = {lon: lon, lat: lon};
					}
				} else {
					margin = {lon: lon, lat: lat};
				}
				return buffer;
			} else {
				return margin;
			}
		};

		// Set the radius for cirles drawn around Point geometries.
		buffer.radius = function(r) {
			if (arguments.length) {
				radius = r;
				return buffer;
			} else {
				return radius;
			}
		};

		// Set the fidelity for cirles drawn around Point geometries.
		buffer.fidelity = function(r) {
			if (arguments.length) {
				fidelity = r;
				return buffer;
			} else {
				return fidelity;
			}
		};

		function apply(feature, ext) {
			var geom = feature.geometry;
			// maniplate the geometry...
			switch (geom.type) {
				case "Point":
					// Turn it into a polygon with two rings:
					// 1) the extent rectangle, and
					// 2) an inner circle around the point coordinate
					var center = geom.coordinates;
					geom.type = "Polygon";
					geom.coordinates = [
						ext.ring(),
						geoff.circle(center, buffer / 2, fidelity)
					];
					break;

				case "Line":
				case "LineString":
					throw new TypeError("Can't do Line or LineString yet!");

				case "MultiPoint":
					// turn it into a polygon with 2 or more rings:
					// 1) the extent rectangle, and
					// 2+) circles around each of point coordinates
					var coords = geom.coordinates.slice();
					geom.type = "Polygon";
					geom.coordinates = [ext.ring()];
					coords.forEach(function(coord) {
						geom.coordinates.push(geoff.circle(coord, buffer / 2, fidelity));
					});
					break;

				case "Polygon":
					// buffer the extent and prepend the geometry rings with the
					// extent rectangle
					geom.coordinates.unshift(ext.ring());
					break;

				case "MultiPolygon":
					// buffer the extent and prepend a polygon with a the extent
					// rectangle as its only ring
					geom.coordinates.unshift([ext.ring()]);
					break;
			}
			return feature;
		}

		function makeExtent(feature) {
			var ext = geoff.extent();
			if (margin) {
				ext.encloseFeature(feature)
				ext.inflate(margin.lon, margin.lat);
			} else {
				ext.world();
				ext.encloseFeature(feature);
			}
			return ext;
		}

		// Apply the buffer to a feature. If copy is true, a deep copy of the
		// feature is created, modified, and returned. Otherwise the feature is
		// modified in place and returned.
		buffer.apply = function(feature, copy) {
			var ext = extent || makeExtent(feature);
			return copy
				? apply(geoff.feature.clone(feature), ext)
				: apply(feature, ext);
		};

		return buffer;
	};

	var TWO_PI = Math.PI * 2;
	// Generate a circular ring around the given coordinate with a given radius
	// (beware latitudinal distortion!) and number of line segments (fidelity).
	geoff.circle = function(coord, radius, fidelity) {
		if (!radius) return [coord];
		// TODO: deal with latitudinal distortion
		if (!fidelity) fidelity = 32;
		var points = [],
				step = TWO_PI / fidelity;
		for (var a = 0; a < TWO_PI; a += step) {
			var x = coord[0] + radius * Math.sin(a),
					y = coord[1] + radius * Math.cos(a);
			points.push([x, y]);
		}
		return points;
	};

	// Feature property getter
	geoff.property = function(name) {
		return function(feature) {
			return feature.properties[name];
		};
	};

	// Returns a *function* that gets the named property from the function's
	// argument. Property names may contain dots to indicate recursive object
	// values. To read a GeoJSON Point feature's latitude, for instance, you can
	// use: geoff.read("geometry.coordinates.1")(feature);
	geoff.read = function(prop) {
		// TODO: support array accessor bracket notation: "geometry.coordinates[0]"
		if (prop.indexOf(".") > -1) {
			var parts = prop.split("."),
					len = parts.length;
			return function(o) {
				var i = 0;
				do {
					o = o[parts[i]];
				} while ((typeof o != "undefined") && ++i < len);
				return o;
			};
		}
		return function(o) { return o[prop]; };
	};

	// Geoff.sort() is a function generator which returns a sorting function
	// based on the received arguments, which you can then pass to Array.sort():
	//
	// [{foo: 3}, {foo: 5}, {foo: -4}].sort(geoff.sort("-foo"));
	//
	// returns: [{foo: 5}, {foo: 3}, {foo: -4}]
	geoff.sort = function(args) {
		function cmp(a, b) {
			return (a > b) ? 1 : (a < b) ? -1 : 0;
		}

		function by(prop) {
			// TODO: support arrays for grouped sub-sorts?
			if (typeof prop == "function") {
				return prop;
			}
			var dir = prop.charAt(0);
			var order = (dir == "-") ? -1 : 1;
			if (dir == "+" || dir == "-") {
				prop = prop.substr(1);
			}
			var read = geoff.read(prop);
			return function(a, b) {
				return order * cmp(read(a), read(b));
			};
		}

		var sorts = [];
		for (var i = 0; i < arguments.length; i++) {
			sorts.push(by(arguments[i]));
		}
		return function(a, b) {
			var i = 0,
					o = 0,
					max = sorts.length;
			do {
				o = sorts[i].call(undefined, a, b);
			} while (o == 0 && ++i < max);
			return o;
		};
	};

	// The polympas "module" contains utility functions for working with Polymaps:
	// http://polymaps.org
	geoff.polympas = (function() {
		var polymaps = {};

		polymaps.outline = function() {
			var outline = function(e) {
				if (tiled) {
					// Get a tile extent. Note that "this" in a Polymaps event
					// listener is the po.map() reference.
					var coord = e.tile.coord;
					var northWest = this.coordinateLocation(coord);
							southEast = this.coordinateLocation({
								row: coord.row + 1,
								column: coord.column + 1,
								zoom: coord.zoom});
					var ext = geoff.extent()
						.encloseLocations([northwest, southEast]);
					// use the tile extent with a small buffer, assuming that the
					// layer tiles and clips
					buffer.margin(.0001).extent(ext);
				} else {
					// otherwise, use the world as the extent
					buffer.margin(null).extent(null);
				}

				if (single || e.features.length == 1) {
					// if we have a single feature, adjust just that one
					buffer.apply(e.features[0].data);
				} else {
					// But if we have multiple geometries, create a GeometryCollection,
					// buffer that, and set the layer's features to that single feature.
					var geometries = e.features.map(function(f) { return f.data.geometry; });
					var feature = geoff.feature.GeometryCollection(geometries);
					buffer.apply(feature);
				}
			};

			var buffer = geoff.buffer(),
					single = true,
					tiled = false;

			outline.buffer = function(b) {
				if (arguments.length) {
					buffer = b;
					return outline;
				} else {
					return buffer;
				}
			};

			outline.single = function(b) {
				if (arguments.length) {
					single = b;
					return outline;
				} else {
					return single;
				}
			};

			outline.tile = function(b) {
				if (arguments.length) {
					tiled = b;
					return outline;
				} else {
					return tiled;
				}
			};

			return outline;
		};

		return polymaps;
	})();


})(geoff);
