import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
// import {
//   latLng,
//   MapOptions,
//   Map,
//   tileLayer,
//   Marker,
//   icon
// } from 'leaflet';
import * as L from 'leaflet';
import {
  Subject,
  Observable,
  timer,
  map,
  tap,
  concatMap,
  filter,
  retryWhen,
  switchMap,
  delay,
  interval,
  of,
  debounceTime,
  scan,
  from,
  take,
  merge,
  mapTo,
  takeUntil
} from 'rxjs';
import { CitiesService } from 'src/app/shared/cities.service';
import { GeoSearchControl, OpenStreetMapProvider, EsriProvider, BingProvider } from 'leaflet-geosearch';
import { Store } from '@ngxs/store';
import { GameStateModel } from 'src/app/shared/state/game.state';
import { START_PAGE_ENG, START_PAGE_RUS } from './start-page.config';
import { ListCityModel } from 'src/app/shared/types/listcities.interface';
import { environment } from 'src/environments/environment';
import { CityModel } from 'src/app/shared/types/cities.interface';


@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('inputCity') inputCity: any;
  @ViewChild('timerElem') timerElem: any;

  map!: L.Map;
  mapOptions!: L.MapOptions;
  city!: string;
  provider: any;
  searchControl: any;
  lastLetter!: string;
  cityListOneLetter$!: Observable<any>;
  countdown!: number;

  arrCitiesOneLetter!: any[];
  arrUsedCities!: CityModel[];
  arrValidCities!: CityModel[];

  initialSnapshot: GameStateModel;
  currentLanguage: string;
  currentAlphabet!: string[];
  pageLanguage = START_PAGE_ENG;
  pattern!: RegExp;
  // readonly patternEng: RegExp = /^[^?!,.a-zA-Z0-9\s]+$/;
  // readonly patternRus: RegExp = /^[^?!,.а-яА-ЯёЁ0-9\s]+$/;
  readonly patternEng: RegExp = /[^A-Za-z\`\'\ \-]/g;
  readonly patternRus: RegExp = /[^А-Яа-я\ё\Ё\'\ \-]/g;

  zoomEnd: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();

  // ruAlphabet: string[] = [
  //   'а', 'б', 'в', 'г',
  //   'д', 'е', 'ж', 'з',
  //   'и', 'к', 'л', 'м',
  //   'н', 'о', 'п', 'р',
  //   'с', 'т', 'у', 'ф',
  //   'х', 'ц', 'ч', 'ш',
  //   'щ', 'э', 'ю', 'я'
  // ];
  ruAlphabet: string[] = [
    'к'
  ];
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
    this.arrUsedCities = [{ name: 'asdasdasd', lat: 0, long: 1 }];
    this.arrValidCities = [
      { name: 'moscow', lat: 55.755833333, long: 37.617777777 },
      { name: 'anapa', lat: 44.894444444, long: 37.316666666 },
      { name: 'kolchugino', lat: 56.299876, long: 39.370994 },
      { name: 'london', lat: 51.507222222, long: 0.1275 },
      { name: 'seoul', lat: 37.56, long: 126.99 },
      { name: 'omsk', lat: 54.966666666, long: 73.383333333 },
      { name: 'paris', lat: 48.864716, long: 2.349014 },
      { name: 'beijing', lat: 39.90403, long: 116.407526 },
      { name: 'москва', lat: 55.755833333, long: 37.617777777 }
    ];
    this.countdown = 20;
  }

  ngOnInit() {
    this.initializeMapOptions();

    const timerGame$ = interval(1000)
      .pipe(
        map(() => {
          this.countdown = this.countdown - 1;
          return this.countdown;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(x => {
        console.log(x);
        this.timerElem.nativeElement.innerText = this.countdown;
        if (x <= 0) {
          timerGame$.unsubscribe();
          console.log('конец игры')
        }
      });
  }

  ngAfterViewInit() {
    console.log(this.timerElem);
    this.timerElem.nativeElement.innerText = this.countdown;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getRandomLetter(): string {
    let lengthAlphabet = this.currentAlphabet.length - 1;
    let randomLetter = this.currentAlphabet[Math.floor(Math.random() * lengthAlphabet)];
    return randomLetter;
  }

  checkEnteredCity(city: string): boolean {
    return this.arrUsedCities.some(elem => elem.name === city.toLowerCase());
  }

  streetMap = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: ' data © OpenStreetMap contributors 1'
  });

  hybridMap = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
    maxZoom: 18,
    attribution: ' data © OpenStreetMap contributors 2',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  });

  vehicleMarker = L.marker([40.4168, -3.703790], {
    icon: L.icon({
      iconSize: [25, 41],
      iconAnchor: [13, 41],
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png'
    })
  });

  private initializeMapOptions() {
    this.mapOptions = {
      center: L.latLng(51.505, 0),
      zoom: 12,
      //layers: [this.streetMap],

      layers: [
        this.streetMap
      ],
    };

    //var layers = L.control.groupedLayers(maptiles, overlays);
  }



  layersControl = {
    baseLayers: {
      'Cartographic map': this.streetMap,
      'Map view': this.hybridMap
    },
    overlays: {
      // 'Vehicle': this.vehicleMarker
    }
  };


  onMapReady(map: L.Map) {
    this.map = map;
    this.map.setMaxBounds([[-90, -180], [90, 180]]);
    const provider = new BingProvider({
      params: {
        key: environment.bingApiKey,
      },
    });
    this.map.zoomControl.remove();
    this.provider = provider;
  }

  handleMapZoomEnd(): void{
    this.zoomEnd = true;
    this.map.scrollWheelZoom.enable();
    this.map.dragging.enable();

    this.map.touchZoom.enable();
    this.map.doubleClickZoom.enable();
    this.map.boxZoom.enable();
    console.log('onMapZoomEnd');
  }
  handleMapZoomStart(): void {
    this.zoomEnd = false;
    this.map.scrollWheelZoom.disable();
    this.map.dragging.disable();

    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.boxZoom.disable();

    let zoomWrap = this.map.zoomControl.getContainer();
    zoomWrap?.classList.add('disabledBtn');
    console.log(zoomWrap)
    console.log('onMapZoomStart');
  }
  handleMapMoveStart(): void{

  }
  handleMapMoveEnd(): void{

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
        if (this.arrValidCities.some(elem => elem.name === this.city.toLowerCase())) {
          this.arrValidCities = this.arrValidCities.filter(item => item.name !== this.city);
        }
        // Если нет - то делаем запрос
        //this.provider = new OpenStreetMapProvider();
        //this.provider = new EsriProvider();

        const results = await this.provider.search({ query: this.city });
        console.log('results',results) // Вот здесь баг. Так как иногда OpenStreetMapProvider не может найти города

        if (results.length && results[0].y && results[0].x) {
          this.countdown = this.countdown + 20;
          let coordinateY = results[0].y;
          let coordinateX = results[0].x;
          //this.mapOptions.center = latLng(30.505, 20.5)
          let cityCoordinates = L.latLng(coordinateY, coordinateX);
          this.map.flyTo(cityCoordinates);
          this.addSampleMarker(this.city, coordinateY, coordinateX);
          this.lastLetter = this.city.charAt(this.city.length - 1);
          if (this.lastLetter === 'ь' || this.lastLetter === 'ъ' || this.lastLetter === 'ы' || this.lastLetter === "'" || this.lastLetter === "`" || this.lastLetter === ")") {
            this.lastLetter = this.city.charAt(this.city.length - 2);
          }
          this.arrUsedCities.push({ name: this.city.toLowerCase(), lat: coordinateY, long: coordinateX });


          //console.log('this.arrValidCities', this.arrValidCities)
          // Найти город в заготовленном массиве, еcли города нет, то сделать запрос
          const matches = this.arrValidCities.filter(item => item.name[0] === this.lastLetter);
          if (matches.length) {
            console.log('matchesArr', matches);

            timer(10000)
              .pipe(takeUntil(this.destroy$))
              .subscribe(() => {
              //console.log('timer 10000')
              //this.inputCity.nativeElement.value = matches[0].name;
              this.enteredCity(matches[0].name);
              //this.city = matches[0].name;
              this.arrValidCities = this.arrValidCities.filter(item => item !== matches[0]);
              this.flyToCity(matches[0]);
              //this.getRequest(matches[0]);
              return;
            })
          }
          else {
            this.findCity()
              .pipe(takeUntil(this.destroy$))
              .subscribe((data: CityModel[]) => {
                console.log('timer', data);
                const matches = data.filter(item => item.name[0].toLowerCase() === this.lastLetter);

                //this.inputCity.nativeElement.value = matches[0];
                this.enteredCity(matches[0].name);
                //this.city = matches[0].name;
                this.arrValidCities = this.arrValidCities.filter(item => item !== matches[0]);
                this.flyToCity(matches[0])
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

  async flyToCity(cityObj: CityModel) {
    const results = await this.provider.search({ query: `${cityObj.lat} ${cityObj.long}` });
    console.log(1111, results)
    console.log(2222, cityObj.name)
    let name = cityObj.name;
    let coordinateY = results[0].y;
    let coordinateX = results[0].x;
    let cityCoordinates = L.latLng(coordinateY, coordinateX);
    this.map.flyTo(cityCoordinates);
    this.addSampleMarker(name, coordinateY, coordinateX);
    this.lastLetter = cityObj.name.charAt(cityObj.name.length - 1);
    if (this.lastLetter === 'ь' || this.lastLetter === 'ъ' || this.lastLetter === 'ы' || this.lastLetter === "'" || this.lastLetter === "`") {
      this.lastLetter = cityObj.name.charAt(cityObj.name.length - 2);
    }
    this.arrUsedCities.push({ name: cityObj.name.toLowerCase(), lat: coordinateY, long: coordinateX });
    this.arrValidCities = this.arrValidCities.filter(item => item.name !== cityObj.name.toLowerCase());
    this.arrValidCities = this.arrValidCities.filter((item, index) => { // Убираем повторяющиеся значения
      return this.arrValidCities.indexOf(item) === index
    });
    console.log('this.arrUsedCities from flyToCity', this.arrUsedCities);
    console.log('this.arrUsedCities cityObj', cityObj.name);
    console.log('this.arrValidCities from flyToCity', this.arrValidCities);
  }

  private addSampleMarker(name: string, y: number,x: number) {
    const marker = new L.Marker([y, x])
      .setIcon(
        L.icon({
          iconSize: [25, 41],
          iconAnchor: [13, 41],
          iconUrl: 'assets/marker.svg'
        }));
    marker.addTo(this.map).on('click',function(e) {
      console.log(e.latlng);
      // let lat = e.latlng.lat;
      // let long = e.latlng.lng;
      // console.log(lat)
      // let popup = L.popup().setContent("I am a standalone popup.");
      // marker.bindPopup(popup).openPopup();
    });

    let contentPopup = `
      <div class="d-flex flex-column">
        <div class="d-flex">
          <div>
            <b>${this.pageLanguage.popupName}:&nbsp;</b>
          </div>
          <div>
            ${name.split(/\s+/).map(word => word[0].toUpperCase() + word.substring(1)).join(' ')}
          </div>
        </div>
        <div class="d-flex">
          <div>
            <b>${this.pageLanguage.popupLat}:&nbsp;</b>
          </div>
          <div>
            ${y}
          </div>
        </div>
        <div class="d-flex">
          <div>
            <b>${this.pageLanguage.popupLong}:&nbsp;</b>
          </div>
          <div>
            ${x}
          </div>
        </div>
      </div>
    `

    marker.bindPopup(contentPopup);

    const fg = L.featureGroup().addTo(this.map)
    fg.on('click',function(e){
      let layer = e.layer;
      layer.bindPopup(layer.popcontent).openPopup();
    });
    //let popup = L.popup().setContent("I am a standalone popup.");
    //marker.bindPopup(popup).openPopup();
  }

  enteredCity(city: string) {
    const obser = of(city);
    let sum = '';
    obser.pipe(
      switchMap(() => this.outputOneLetter(city, sum)),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  outputOneLetter(city: string, sum: string): Observable<any> {
    let varOutputOneLetter$;
    return varOutputOneLetter$ =
      interval(150).pipe(
        take(city.length),
        map(x => {
          if (x === 0) {
            return sum = sum + city[x].toUpperCase();
          }
          return sum = sum + city[x];
        }),
        map(x => this.inputCity.nativeElement.value = x)
      )
  }


  getCityFromOneLetter() {
    this.cityListOneLetter$ = this.citiesService.getListCityFromLetter(this.lastLetter, this.randomNumberNamePrefix());
    console.log('делаю запрос getCityFromOneLetter')
    //console.log('cityListOneLetter', this.cityListOneLetter$);
    return this.cityListOneLetter$;
  }

  findCity(): Observable<any> {
    return this.searchCity().pipe(
      map((arr: CityModel[]) => {
        if (!arr.length) {
          console.log('нужен повторный запрос')
          //error will be picked up by retryWhen
          throw arr;
        }
        return arr;
      }),
      retryWhen(errors =>
        this.searchCity()
      ),
      takeUntil(this.destroy$)
    )
  }

  randomNumberNamePrefix(): number {
    const random = Math.floor(Math.random() * 20);
    console.log('random', random)
    return random;
  }

  searchCity() {
    return timer(1500).pipe(
      concatMap(()=> this.getCityFromOneLetter()),
      map((str) => {
        str = str.data;
        return str;
      }),
      map((str: ListCityModel[]) => {
        //const arrCities = str.map(item => item.city);
        let arrCities = str.map(item => {
          return { name: item.city, lat: item.latitude, long: item.longitude }
        });
        console.log('буква ',this.lastLetter)

        return arrCities;
      }),
      map((str: CityModel[]) => {
        let filteredCities = str.filter(item => item.name[0].toLowerCase() === this.lastLetter);
        this.arrValidCities.push(...filteredCities);


        this.arrValidCities = this.arrValidCities.filter((item, index) => { // Убираем повторяющиеся значения
          return this.arrValidCities.indexOf(item) === index
        });
        this.arrValidCities = this.arrValidCities.map(item => {
          return { name: item.name.toLowerCase(), lat: item.lat, long: item.long }
        });

        return filteredCities;
      }),
      delay(10000)
    )
  }

  validateCityName() {
    this.inputCity.nativeElement.value = this.inputCity.nativeElement.value.replace(this.pattern, '');
  }



  // onClick(e) {
  //   alert(this.getLatLng());
  // }
}
