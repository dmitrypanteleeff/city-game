import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import * as L from 'leaflet';
import * as MapConfig from 'src/app/shared/config/map.config';
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
import { Select, Store } from '@ngxs/store';
import { GameStateModel } from 'src/app/shared/state/game.state';
import { START_PAGE_ENG, START_PAGE_RUS } from './start-page.config';
import { ListCityModel } from 'src/app/shared/types/listcities.interface';
import { environment } from 'src/environments/environment';
import { CityModel } from 'src/app/shared/types/cities.interface';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { GameDialogComponent } from 'src/app/components/dialog/game-dialog.component';
import { GameSelectors } from 'src/app/shared/state/game.selectors';
import { arrValidCities, arrUsedCities } from 'src/app/shared/config/geography.config';
import {
  ruAlphabet,
  engAlphabet,
  patternEng,
  patternRus
} from 'src/app/shared/config/game.config';
import {
  handleMapZoomEnd,
  handleMapZoomStart,
  handleMapMoveStart,
  handleMapMoveEnd
} from 'src/app/shared/utils/handle-map.functions'


@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('inputCity') inputCity!: ElementRef;
  @ViewChild('timerElem') timerElem!: ElementRef;
  @ViewChild('scoreElem') scoreElem!: ElementRef;

  @Select(GameSelectors.currentLanguage) currentLanguagee$!: Observable<string>;
  @Select(GameSelectors.score) score$!: Observable<number>;

  map!: L.Map;
  mapOptions!: L.MapOptions;
  city!: string;
  provider: any;
  searchControl: any;
  lastLetter!: string;
  cityListOneLetter$!: Observable<any>;
  countdown!: number;

  arrCitiesOneLetter!: any[];
  arrUsedCities: CityModel[] = arrUsedCities;
  arrValidCities: CityModel[] = arrValidCities;

  arrUsedByUser: string[] = [];
  arrUsedByComp: string[] = [];

  initialSnapshot: GameStateModel;
  currentLanguage!: string;
  currentAlphabet!: string[];
  pageLanguage = START_PAGE_ENG;
  pattern!: RegExp;

  zoomEnd: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();

  readonly patternEng: RegExp = patternEng;
  readonly patternRus: RegExp = patternRus;
  readonly ruAlphabet: string[] = ruAlphabet;
  readonly engAlphabet: string[] = engAlphabet;

  firstLetter!: string;

  dialogConfig: any;
  scoreElemNumber!: number;

  cities$: Observable<any> | undefined;

  handleMapZoomStart = handleMapZoomStart;
  handleMapZoomEnd = handleMapZoomEnd;
  handleMapMoveStart = handleMapMoveStart;
  handleMapMoveEnd = handleMapMoveEnd;


  constructor(
    private citiesService: CitiesService,
    private _store: Store,
    private _dialog: MatDialog
  ) {
    this.initialSnapshot = this._store.snapshot().game;
  }

  ngOnInit() {
    this.initializeValues();
    console.log(11111,this.arrValidCities);
    //this._dialog.open(`DialogContentExampleDialog`);
    this.initializeMapOptions();
    this.initializeDialog();

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
          this.dialogConfig.data = {
            id: 1,
            title: 'Angular For Beginners',
            description: `
            <div class="d-flex flex-column">
              <div>
                ${this.pageLanguage.warningMessage5}
              </div>
              <div>
                ${this.pageLanguage.warningMessage6} <b>${this.scoreElemNumber}</b>
              </div>
            </div>`
          };
          this._dialog.open(GameDialogComponent, this.dialogConfig);
          console.log('конец игры')
        }
      });
  }

  ngAfterViewInit() {
    console.log(this.timerElem);
    this.scoreElem.nativeElement.innerText = this.scoreElemNumber;
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

  private initializeValues() {

    this.currentLanguagee$
      .pipe(
        takeUntil(this.destroy$))
      .subscribe(val => this.currentLanguage = val);

    this.score$
      .pipe(
        takeUntil(this.destroy$))
      .subscribe(val => this.scoreElemNumber = val);

    this.currentLanguage === 'eng' ? this.pageLanguage = START_PAGE_ENG : this.pageLanguage = START_PAGE_RUS;
    this.currentLanguage === 'eng' ? this.pattern = this.patternEng : this.pattern = this.patternRus;
    this.currentLanguage === 'eng' ? this.currentAlphabet = this.engAlphabet : this.currentAlphabet = this.ruAlphabet;

    this.lastLetter = this.getRandomLetter();
    this.countdown = 20;
  }

  private initializeMapOptions() {
    this.mapOptions = {
      center: L.latLng(51.505, 0),
      zoom: 12,
      layers: [
        MapConfig.streetMap
      ]
    };
  }

  private initializeDialog() {
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.disableClose = false;
    this.dialogConfig.autoFocus = true;
    this.dialogConfig.hasBackdrop = true;
  }



  layersControl = {
    baseLayers: {
      'Cartographic map': MapConfig.streetMap,
      'Map view': MapConfig.hybridMap
    },
    overlays: {
      // 'Vehicle': this.vehicleMarker
    }
  };

  onMapReady(map: L.Map) {
    this.map = map;
    this.map.setMaxBounds([[-90, -180], [90, 180]]);
    // const provider = new BingProvider({
    //   params: {
    //     key: environment.bingApiKey,
    //   },
    // });
    const provider = new OpenStreetMapProvider;
    this.map.zoomControl.remove();
    this.provider = provider;
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
        this.dialogConfig.data = {
          id: 1,
          description: `${this.pageLanguage.warningMessage1}`
        };
        this._dialog.open(GameDialogComponent, this.dialogConfig);

        //alert('Кажется, название этого города уже было. Давайте попробуем другой')
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
          this.countdown = this.countdown + 30;
          this.scoreElemNumber = this.scoreElemNumber + 1;
          this.scoreElem.nativeElement.innerText = this.scoreElemNumber;

          this.arrUsedByUser.push(this.city);
          console.log(333333, this.arrUsedByUser);

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
              this.arrUsedByComp.push(matches[0].name);
              console.log(4444444, this.arrUsedByComp)
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
                this.arrUsedByComp.push(matches[0].name);
                console.log(4444444, this.arrUsedByComp);
                this.flyToCity(matches[0]);
              })

          console.log('after 1500')
          }
        }
        else {
          console.log(`Что-то пошло не так. ${this.city} - точно верно написали город?`)
          this.dialogConfig.data = {
            id: 1,
            description: `${this.pageLanguage.warningMessage3} <b>${this.city.toLocaleUpperCase()}</b> ${this.pageLanguage.warningMessage4}</b>`
          };
          this._dialog.open(GameDialogComponent, this.dialogConfig);
        }
      }
    }
    else {
      console.log('буква из города', this.city[0])
      this.dialogConfig.data = {
        id: 1,
        description: `${this.pageLanguage.warningMessage2} <b>${this.lastLetter.toLocaleUpperCase()}</b>`
      };
      this._dialog.open(GameDialogComponent, this.dialogConfig);
      //alert(`Вы ввели город на неверную букву. Попробуйте ещё раз. ${this.lastLetter}`)
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

  // вынести
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
