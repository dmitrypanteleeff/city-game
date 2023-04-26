import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Store } from '@ngxs/store';
import { GameStateModel } from './state/game.state';

@Injectable({
  providedIn: 'root'
})
export class CitiesService {

  constructor(
    private _http: HttpClient,
    private _store: Store
  ) {

  }

  getCity(city: string): Observable<any>  {
    const headers = { 'X-Api-Key': `${environment.apiKey}` };
    return this._http
      .get<any>(`${environment.fbDbUrl}${city}`, { headers })
  }

  getCity2(): Observable<any>  {
    const headers = {
      'X-RapidAPI-Key': `${environment.rapidApiKey}`,
      'X-RapidAPI-Host': `${environment.rapidApiHost}`,
    };
    return this._http
      .get<any>(`${environment.dbUrl}`, { headers })
  }

  getListCityFromLetter(character: string, numPrefix: number): Observable<any> {
    const currentLanguage = this.getCurrentLanguage();
    const languageCode = currentLanguage === 'eng' ? '' : '&languageCode=ru';
    const headers = {
      'X-RapidAPI-Key': `${environment.rapidApiKey}`,
      'X-RapidAPI-Host': `${environment.rapidApiHost}`,
    };
    let bodyRequest = `${environment.urlLetterCity}${numPrefix}${environment.urlLetterCityNamePrefix}${character}${languageCode}`;
    console.log('bodyRequest', bodyRequest);
    return this._http
      .get<any>(bodyRequest, { headers })
      .pipe(map((res: any) => {
        const data = res;
        console.log('service data', data)
        return data;
        }))
  }

  getCurrentLanguage(): string {
    const initialSnapshot = this._store.snapshot().game;
    const currentLanguage = initialSnapshot.options.currentLanguage;
    return currentLanguage;
  }

}
