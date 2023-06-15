import * as L from 'leaflet';

export const streetMap = L.tileLayer(
  'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 18,
    attribution: 'data © OpenStreetMap',
    //retina: '@2x',
    //detectRetina: true,
  }
);

export const hybridMap = L.tileLayer(
  'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
  {
    maxZoom: 18,
    attribution: 'data © Google',
    //retina: '@2x',
    //detectRetina: true,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  }
);

export const vehicleMarker = L.marker([40.4168, -3.70379], {
  icon: L.icon({
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    iconUrl: 'assets/marker-icon.png',
    shadowUrl: 'assets/marker-shadow.png',
  })
});
