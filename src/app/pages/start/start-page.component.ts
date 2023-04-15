import { Component, OnInit } from '@angular/core';
import {
  latLng,
  MapOptions,
  Map,
  tileLayer,
  Marker,
  icon
} from 'leaflet';
import { Observable, timer, map, tap, concatMap, filter } from 'rxjs';
import { CitiesService } from 'src/app/shared/cities.service';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { Store } from '@ngxs/store';
import { GameStateModel } from 'src/app/shared/state/game.state';
import { START_PAGE_ENG, START_PAGE_RUS } from './start-page.config';
import { ListCityModel } from 'src/app/shared/types/listcities.interface';


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
  cityListOneLetter$!: Observable<any>;

  arrCitiesOneLetter!: any[];
  arrUsedCities!: string[];
  arrValidCities!: string[];

  initialSnapshot: GameStateModel;
  currentLanguage: string;
  currentAlphabet!: string[];
  pageLanguage = START_PAGE_ENG;
  pattern!: RegExp;
  readonly patternEng: RegExp = /^[?!,.a-zA-Z0-9\s]+$/;
  readonly patternRus: RegExp = /^[?!,.а-яА-ЯёЁ0-9\s]+$/;

  ruAlphabet: string[] = [
    'а', 'б', 'в', 'г',
    'д', 'е', 'ж', 'з',
    'и', 'к', 'л', 'м',
    'н', 'о', 'п', 'р',
    'с', 'т', 'у', 'ф',
    'х', 'ц', 'ч', 'ш',
    'щ', 'э', 'ю', 'я'
  ];
  engAlphabet: string[] = [
    'a', 'b', 'c', 'd',
    'e', 'f', 'g', 'h',
    'i', 'j', 'k', 'l',
    'm', 'n', 'o', 'p',
    'q', 'r', 's', 't',
    'u', 'v', 'w', 'x',
    'y', 'z'
  ];

  firstLetter!: string;


  cities$: Observable<any> | undefined;

  constructor(
    private citiesService: CitiesService,
    private _store: Store
  ) {
    this.initialSnapshot = _store.snapshot().game;
    this.currentLanguage = this.initialSnapshot.options.currentLanguage;
    console.log(333, this.currentLanguage)
    this.currentLanguage === 'eng' ? this.pageLanguage = START_PAGE_ENG : this.pageLanguage = START_PAGE_RUS;
    this.currentLanguage === 'eng' ? this.pattern = this.patternEng : this.pattern = this.patternRus;
    this.currentLanguage === 'eng' ? this.currentAlphabet = this.engAlphabet : this.currentAlphabet = this.ruAlphabet;
    this.firstLetter = this.getFirstLetter();


  }

  ngOnInit() {
    this.initializeMapOptions();
  }

  getFirstLetter(): string {
    let lengthAlphabet = this.currentAlphabet.length - 1;
    let randomLetter = this.currentAlphabet[Math.floor(Math.random() * lengthAlphabet)];
    return randomLetter;
  }

  checkEnteredCity(city: string): boolean {
    return this.arrUsedCities.includes(city.toLowerCase());
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

  async getRequest(city: string) {
    console.log('this.arrCitiesOneLetter 1', this.arrCitiesOneLetter)


    this.citiesService.getCity(city)
      .subscribe((data: any) => console.log('запрос getCity',data));

    this.citiesService.getCity2()
      .subscribe((data: any) => console.log('запрос getCity2', data));

    this.city = this.city.trim();

    // Здесь проверяем - можно ли исользовать этот город
    if (this.city[0] === this.firstLetter) {

      // Здесь проверяем - использовался ли данный город ранее
      if (this.checkEnteredCity(this.city.toLowerCase())) {
        alert('Кажется, название этого города уже было. Давайте попробуем другой')
      }
      else {
        // Если нет - то делаем запрос, если использовался
        this.provider = new OpenStreetMapProvider();

        const results = await this.provider.search({ query: this.city });
        if (results.length) {
          let coordinateY = results[0].y;
          let coordinateX = results[0].x;
          //this.mapOptions.center = latLng(30.505, 20.5)
          let cityCoordinates = latLng(coordinateY, coordinateX);
          this.map.flyTo(cityCoordinates);
          this.addSampleMarker(coordinateY, coordinateX);
          this.lastLetter = this.city.charAt(this.city.length - 1);



          timer(1500)
            .pipe(
              concatMap(()=> this.getCityFromOneLetter()),
              map((str) => {
                str = str.data;
                return str;
              }),
              map((str: ListCityModel[]) => {
                //const arrCities = str.map(item => item.city);
                let arrCities = str.map(item => item.city);
                console.log('буква ',this.lastLetter)

                return arrCities;
              }),
              //tap((str)=> console.log(console.log('asd ',str[0])))
              //map((str) => str.filter(item => item.split('') === this.lastLetter)),
              map((str) => {
                let filteredCities = str.filter(item => item[0].toLowerCase() === this.lastLetter);
                return filteredCities;
              })
            )
            .subscribe((data) => console.log('timer', data))

          console.log('after 1500')
          //setTimeout(() => this.getCityFromOneLetter(), 1500);

          //console.log('last letter is', this.lastLetter)
          //this.searchControl.onSubmit(re)
        }
        else {
          console.log(`Что-то пошло не так. ${this.city} - точно верно написали город?`)
        }
      }
    }
    else {
      alert('Вы ввели город на неверную букву. Попробуйте ещё раз')
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
    this.cityListOneLetter$ = this.citiesService.getListCityFromLetter(this.lastLetter);
    console.log('cityListOneLetter', this.cityListOneLetter$);
    return this.cityListOneLetter$;
  }

  // onClick(e) {
  //   alert(this.getLatLng());
  // }
}
