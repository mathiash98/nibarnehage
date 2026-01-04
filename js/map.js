// Mapbox configuration and initialization
function initializeMap(containerId, options = {}) {
  const defaultOptions = {
    center: [5.363236957523128, 60.31053848646181], // Øvsttunveien 58, Nesttun
    zoom: 14,
    markerColor: "#FFB5A7",
    popupTitle: "Nesttun Indremisjons Barnehage",
    popupContent: "Øvsttunveien 58, 5223 Nesttun",
  };

  const config = { ...defaultOptions, ...options };

  mapboxgl.accessToken =
    "pk.eyJ1IjoibWF0aGlhc2g5OCIsImEiOiJjbWp4aXg4eXQ1NWprM2ZxeGgwbjRlazZkIn0.y2NFGbXWQ_gixcoEG4fg3w";

  const map = new mapboxgl.Map({
    container: containerId,
    style: "mapbox://styles/mapbox/streets-v12",
    center: config.center,
    zoom: config.zoom,
  });

  // Add marker
  new mapboxgl.Marker({ color: config.markerColor })
    .setLngLat(config.center)
    .setPopup(
      new mapboxgl.Popup().setHTML(
        `<h3>${config.popupTitle}</h3><p>${config.popupContent}</p>`
      )
    )
    .addTo(map);

  // Add navigation controls
  map.addControl(new mapboxgl.NavigationControl());

  return map;
}
