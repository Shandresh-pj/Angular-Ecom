import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { of,Observable,map, catchError, throwError, firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import { shareReplay } from "rxjs/operators";
export const statusFactory = (statusService: StatusService): (() => Promise<any>) => {
  return () => firstValueFrom(statusService.getStatues());
};
@Injectable({
  providedIn: 'root'
})
export class StatusService {

  public Statuses:any={};
  constructor(private http: HttpClient) {
    
  }
 

  getStatues( payload?:any ){
    return this.http
      .get(`${environment.domain}/Status/All`)
      .pipe(
        map((response:any) => {
          const list = response?.data?.data || [];
          this.Statuses = list.reduce((acc: any, s: any) => {
            const key = s.StatusFor || 'COMMON';
            (acc[key] = acc[key] || []).push(s);
            return acc;
          }, {});
          return this.Statuses;
        }),
        catchError(() => {
          this.Statuses = {};
          return of(this.Statuses);
        }),
        shareReplay ()
      )
  }
 getStatus(StatusFor:any){
    return this.Statuses[StatusFor] || [];
  }
}
