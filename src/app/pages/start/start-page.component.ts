import { Component, OnInit } from '@angular/core';
import {
  latLng,
  MapOptions,
  Map,
  tileLayer,
  Marker
} from 'leaflet';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent implements OnInit {

  map!: Map;
  mapOptions!: MapOptions;

  constructor() {
  }

  ngOnInit() {
    this.initializeMapOptions();
  }

  private initializeMapOptions() {
    this.mapOptions = {
      center: latLng(51.505, 0),
      zoom: 12,
      layers: [
        tileLayer(
          'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            maxZoom: 18,
            attribution: ' data © OpenStreetMap contributors'
          })
      ],
    };
  }

  onMapReady(map: Map) {
    this.map = map;
  }
}
