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
    return of({ data: { data: [] } })
      .pipe(
        map((response:any) => {
          return this.Statuses;
        }),
        shareReplay ()
      )
  }
 getStatus(StatusFor:any){
    return this.Statuses[StatusFor] || [];
  }
}
