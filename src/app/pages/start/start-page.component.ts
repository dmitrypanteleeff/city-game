import { Component, OnInit } from '@angular/core';
import {
  latLng,
  MapOptions,
  Map,
  tileLayer,
  Marker
} from 'leaflet';
import { Observable } from 'rxjs';
import { CitiesService } from 'src/app/shared/cities.service';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

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

  cities$: Observable<any> | undefined;

  constructor(private citiesService: CitiesService) {

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
    //const results = provider.search({ query: 'Moscow' });

    // this.searchControl = GeoSearchControl({
    //   provider: this.provider,
    //   style: 'bar',
    //   notFoundMessage: 'Sorry, that address could not be found.',
    // });
    // map.addControl(this.searchControl);

    // console.log(444,this.searchControl)

    //const results = provider.search({ query: 'Moscow' });
    //console.log(111, results)
  }

  async getRequest(city:string) {
    // this.productServ.getAll().subscribe((goods) => {
    //   this.products$ = goods;
    //   console.log(goods)
    // })

    this.citiesService.getCity(city)
      .subscribe((data: any) => console.log(data));

    this.citiesService.getCity2()
      .subscribe((data: any) => console.log(data));

    this.provider = new OpenStreetMapProvider();
    const results = await this.provider.search({ query: this.city });
    console.log(222, results)
    let coordinateX = results[0].x;
    let coordinateY = results[0].y;
    console.log(333, this.searchControl)
    //this.mapOptions.center = latLng(30.505, 20.5)
    let test = latLng(coordinateY, coordinateX);
    this.map.flyTo(test)
    //this.searchControl.onSubmit(re)
  }
}
