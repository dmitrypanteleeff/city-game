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

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent implements OnInit {

  map!: Map;
  mapOptions!: MapOptions;

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
            attribution: ' data © OpenStreetMap contributors'
          })
      ],
    };
  }


  onMapReady(map: Map) {
    this.map = map;
  }

  getRequest(city:string) {
    // this.productServ.getAll().subscribe((goods) => {
    //   this.products$ = goods;
    //   console.log(goods)
    // })

    this.citiesService.getCity(city)
      .subscribe((data: any) =>  console.log(data));
  }
}
