import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CitiesService {

  constructor(private _http: HttpClient) { }

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

  getListCityFromLetter(character: string): Observable<any> {
    const headers = {
      'X-RapidAPI-Key': `${environment.rapidApiKey}`,
      'X-RapidAPI-Host': `${environment.rapidApiHost}`,
    };
    return this._http
      .get<any>(`${environment.urlLetterCity}${character}`, { headers })
  }
}
