import { Component, OnInit } from '@angular/core';
import {
  latLng,
  MapOptions,
  Map,
  tileLayer,
  Marker,
  icon
} from 'leaflet';
import { Observable } from 'rxjs';
import { CitiesService } from 'src/app/shared/cities.service';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { Store } from '@ngxs/store';
import { GameStateModel } from 'src/app/shared/state/game.state';
import { START_PAGE_ENG, START_PAGE_RUS } from './start-page.config'

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent implements OnInit {

  map!: Map;
  mapOptions!: MapOptions;
  city!: string;
  provider: any;
  searchControl: any;
  lastLetter!: string;

  initialSnapshot: GameStateModel;
  currentLanguage: string;
  pageLanguage = START_PAGE_ENG;

  cities$: Observable<any> | undefined;

  constructor(
    private citiesService: CitiesService,
    private _store: Store
  ) {
    this.initialSnapshot = _store.snapshot().game;
    this.currentLanguage = this.initialSnapshot.options.currentLanguage;
    console.log(333, this.currentLanguage)
    this.currentLanguage === 'eng' ? this.pageLanguage = START_PAGE_ENG : this.pageLanguage = START_PAGE_RUS;
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
            attribution: ' data © OpenStreetMap contributors',
            // opacity: 0.7,
            // detectRetina: true,
          })
      ],
    };
  }


  onMapReady(map: Map) {
    this.map = map;
    this.provider = new OpenStreetMapProvider();
  }

  async getRequest(city:string) {


    this.citiesService.getCity(city)
      .subscribe((data: any) => console.log(data));

    this.citiesService.getCity2()
      .subscribe((data: any) => console.log(data));

    this.provider = new OpenStreetMapProvider();
    this.city = this.city.trim();
    const results = await this.provider.search({ query: this.city });
    if (results.length) {
      let coordinateY = results[0].y;
      let coordinateX = results[0].x;
      //this.mapOptions.center = latLng(30.505, 20.5)
      let cityCoordinates = latLng(coordinateY, coordinateX);
      this.map.flyTo(cityCoordinates);
      this.addSampleMarker(coordinateY, coordinateX);
      this.lastLetter = this.city.charAt(this.city.length - 1);
      setTimeout(() => this.getCityFromOneLetter(), 1500);
      //console.log('last letter is', this.lastLetter)
      //this.searchControl.onSubmit(re)
    }
    else {
      console.log(`Что-то пошло не так. ${this.city} - точно верно написали город?`)
    }

  }

  private addSampleMarker(y: number,x: number) {
    const marker = new Marker([y, x])
      .setIcon(
        icon({
          iconSize: [25, 41],
          iconAnchor: [13, 41],
          iconUrl: 'assets/marker.svg'
        }));
    marker.addTo(this.map).on('click',function(e) {
      console.log(e.latlng);
    });
  }

  getCityFromOneLetter() {
    this.citiesService.getListCityFromLetter(this.lastLetter)
      .subscribe((data: any) => console.log(data));
  }

  // onClick(e) {
  //   alert(this.getLatLng());
  // }
}
