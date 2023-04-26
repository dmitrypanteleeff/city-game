import { Component, OnInit, ViewChild } from '@angular/core';
import {
  latLng,
  MapOptions,
  Map,
  tileLayer,
  Marker,
  icon
} from 'leaflet';
import { Observable, timer, map, tap, concatMap, filter, retryWhen, switchMap, delay } from 'rxjs';
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

  @ViewChild('inputCity') inputCity: any;

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
  // ruAlphabet: string[] = [
  //   'в'
  // ];
  // engAlphabet: string[] = [
  //   'a', 'b', 'c', 'd',
  //   'e', 'f', 'g', 'h',
  //   'i', 'j', 'k', 'l',
  //   'm', 'n', 'o', 'p',
  //   'q', 'r', 's', 't',
  //   'u', 'v', 'w', 'x',
  //   'y', 'z'
  // ];
  engAlphabet: string[] = [
    'w'
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
    this.lastLetter = this.getRandomLetter();
    this.arrUsedCities = ['asdasdasda'];
    this.arrValidCities = ['moscow', 'anapa', 'kolchugino', 'london', 'ordino', 'seul', 'omsk', 'paris', 'beijing', 'москва'];


  }

  ngOnInit() {
    this.initializeMapOptions();
  }

  getRandomLetter(): string {
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
    //console.log('this.arrCitiesOneLetter 1', this.arrCitiesOneLetter)
    console.log('city', this.city)


    // this.citiesService.getCity(city)
    //   .subscribe((data: any) => console.log('запрос getCity',data));

    // this.citiesService.getCity2()
    //   .subscribe((data: any) => console.log('запрос getCity2', data));

    this.city = this.city.trim();

    // Здесь проверяем - можно ли исользовать этот город
    if (this.city[0].toLowerCase() === this.lastLetter) {

      // Здесь проверяем - использовался ли данный город ранее
      if (this.checkEnteredCity(this.city.toLowerCase())) {
        alert('Кажется, название этого города уже было. Давайте попробуем другой')
      }
      else {
        // Проверить если введённый город есть в масиве запасных городов, то удалить его оттуда
        if (this.arrValidCities.includes(this.city.toLowerCase())) {
          this.arrValidCities = this.arrValidCities.filter(item => item !== this.city);
        }
        // Если нет - то делаем запрос
        this.provider = new OpenStreetMapProvider();

        const results = await this.provider.search({ query: this.city });
        if (results.length && results[0].y && results[0].x) {
          let coordinateY = results[0].y;
          let coordinateX = results[0].x;
          //this.mapOptions.center = latLng(30.505, 20.5)
          let cityCoordinates = latLng(coordinateY, coordinateX);
          this.map.flyTo(cityCoordinates);
          this.addSampleMarker(coordinateY, coordinateX);
          this.lastLetter = this.city.charAt(this.city.length - 1);
          this.arrUsedCities.push(this.city.toLowerCase());


          //console.log('this.arrValidCities', this.arrValidCities)
          // Найти город в заготовленном массиве, еcли города нет, то сделать запрос
          const matches = this.arrValidCities.filter(item => item[0] === this.lastLetter);
          if (matches.length) {
            console.log('matchesArr', matches);

            timer(10000).subscribe(() => {
              //console.log('timer 10000')
              this.inputCity.nativeElement.value = matches[0];
              this.city = matches[0];
              this.arrValidCities = this.arrValidCities.filter(item => item !== matches[0]);
              this.flyToCity(this.city);
              //this.getRequest(matches[0]);
              return;
            })
            // this.inputCity.nativeElement.value = matches[0];
            //   this.lastLetter = this.city.charAt(this.city.length - 1);
            //   this.getRequest(matches[0])

          }
          else {
            this.findCity()
              .subscribe((data) => {
                console.log('timer', data);
                this.inputCity.nativeElement.value = data[0];
                this.city = data[0];
                this.arrValidCities = this.arrValidCities.filter(item => item !== data[0]);
                this.flyToCity(data[0])
              })

          console.log('after 1500')
          }
        }
        else {
          console.log(`Что-то пошло не так. ${this.city} - точно верно написали город?`)
        }
      }
    }
    else {
      console.log('буква из города',this.city[0])
      alert(`Вы ввели город на неверную букву. Попробуйте ещё раз. ${this.lastLetter}`)
    }
  }

  async flyToCity(nameCity: string) {
    const results = await this.provider.search({ query: nameCity });
    let coordinateY = results[0].y;
    let coordinateX = results[0].x;
    let cityCoordinates = latLng(coordinateY, coordinateX);
    this.map.flyTo(cityCoordinates);
    this.addSampleMarker(coordinateY, coordinateX);
    this.lastLetter = nameCity.charAt(nameCity.length - 1);
    this.arrUsedCities.push(nameCity.toLowerCase());
    console.log('this.arrUsedCities from flyToCity', this.arrUsedCities);
    console.log('this.arrValidCities from flyToCity', this.arrValidCities);
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
    this.cityListOneLetter$ = this.citiesService.getListCityFromLetter(this.lastLetter, this.randomNumberNamePrefix());
    console.log('делаю запрос getCityFromOneLetter')
    //console.log('cityListOneLetter', this.cityListOneLetter$);
    return this.cityListOneLetter$;
  }

  findCity(): Observable<any> {
    return timer(1500).pipe(
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
      map((str: string[]) => {
        let filteredCities = str.filter(item => item[0].toLowerCase() === this.lastLetter);
        this.arrValidCities.push(...filteredCities);


        this.arrValidCities = this.arrValidCities.filter((item, index) => { // Убираем повторяющиеся значения
          return this.arrValidCities.indexOf(item) === index
        });
        this.arrValidCities = this.arrValidCities.map(item => item.toLowerCase());

        return filteredCities;
      }),
      delay(10000),
      map((arr: string[]) => {
        if (!arr.length) {
          console.log('нужен повторный запрос')
          //error will be picked up by retryWhen
          throw arr;
        }
        return arr;
      }),
      // timer(10000),
      //map((data: string[]) => timer(10000).pipe(map(() => this.flyToCity(data[0])))


      //map((data)=> data.timer(10000).pipe(map(data) => this.flyToCity(data[0])))
      retryWhen(errors =>
        errors.pipe(
          map(() => console.log('начало retryWhen')),
          concatMap(() => this.getCityFromOneLetter()),
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
          map((str: string[]) => {
            let filteredCities = str.filter(item => item[0].toLowerCase() === this.lastLetter);
            this.arrValidCities.push(...filteredCities);

            this.arrValidCities = this.arrValidCities.filter((item, index) => { // Убираем повторяющиеся значения
              return this.arrValidCities.indexOf(item) === index
            });
            this.arrValidCities = this.arrValidCities.map(item => item.toLowerCase());

            return filteredCities;
          }),
          //log error message
          //tap(val => console.log(`Value ${val} was too high!`)),
          //restart in 6 seconds
          //delayWhen(val => timer(val * 1000))
        )
      )
      //timer(10000).pipe(map((data)=> this.flyToCity(data[0])))
    )
  }

  randomNumberNamePrefix(): number {
    const random = Math.floor(Math.random() * 20);
    console.log('random', random)
    return random;
  }

  // onClick(e) {
  //   alert(this.getLatLng());
  // }
}
