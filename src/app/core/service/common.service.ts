import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, catchError, debounceTime, tap } from 'rxjs/operators';
import { BehaviorSubject, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CommonService {
private StateData = new BehaviorSubject<any[]>([]);
private CityData = new BehaviorSubject<any[]>([]);
  public savedLang = localStorage.getItem('selectedLanguage') || 'en';
  State$ = this.StateData.asObservable();
  City$ = this.CityData.asObservable();
    constructor(private http: HttpClient) {
        // Promise.all([
        //     Promise.resolve(this.getMasterState()),
        //     Promise.resolve(this.getMasterCity()),
        // ])
    }
    public getApi(resourceURL: string, params?: any) {
        return this.http
            .get(`${environment.domain}/` + resourceURL, { params: params })
            .pipe(
                map((res) => res),
                catchError((error: HttpErrorResponse): any => throwError(error))
            );
    }

    public downloadApi(resourceURL: string, blob?: any) {
        return this.http.get(`${environment.domain}/` + resourceURL, blob).pipe(
            map((res) => res),
            catchError((error: HttpErrorResponse): any => throwError(error))
        );
    }

    // post api service
    public postApi(resourceURL: string, payloads: Object) {
        return this.http
            .post(`${environment.domain}/` + resourceURL, payloads)
            .pipe(
                map((res) => res),
                catchError((error: HttpErrorResponse): any => throwError(error))
            );
    }

    // post form data service
    public postFormData(resourceURL: string, payloads: Object) {
        return this.http
            .post(`${environment.domain}/` + resourceURL, payloads, {
                headers: new HttpHeaders({
                    enctype: 'multipart/form-data',
                }),
            })
            .pipe(
                map((res) => res),
                catchError((error: HttpErrorResponse): any => throwError(error))
            );
    }

    // put form data service (multipart PUT)
    public putFormData(resourceURL: string, payloads: Object) {
        return this.http
            .put(`${environment.domain}/` + resourceURL, payloads)
            .pipe(
                map((res) => res),
                catchError((error: HttpErrorResponse): any => throwError(error))
            );
    }

    // put api service
    public putApi(resourceURL: string, payloads: Object) {
        return this.http
            .put(`${environment.domain}/` + resourceURL, payloads)
            .pipe(
                map((res) => res),
                catchError((error: HttpErrorResponse): any => throwError(error))
            );
    }

    // delete api service
    public deleteApi(resourceURL: string) {
        return this.http.delete(`${environment.domain}/` + resourceURL).pipe(
            map((res) => res),
            catchError((error: HttpErrorResponse): any => throwError(error))
        );
    }

    getMasterState(): void {
        // this.http
        //   .get(`${environment.domain}/MasterData/States`, {})
        //   .pipe(debounceTime(300),
        //     tap((res: any) => {
        //       this.StateData.next(res?.object?.data || []);
        //     })
        //   )
        //   .subscribe();
      }
    
      getMasterCity(): void {
        // this.http
        //   .get(`${environment.domain}/RentalLocation/Cities`, {})
        //   .pipe(debounceTime(300),
        //     tap((res: any) => {
        //       this.CityData.next(res?.object?.data || []);
        //     })
        //   )
        //   .subscribe();
      }
}
