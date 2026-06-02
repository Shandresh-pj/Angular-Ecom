import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { of,Observable,map, catchError, firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";

export const configFactory = (config: ConfiglangService): (() => Promise<boolean>) => {
  return () => firstValueFrom(config.loadAppConfig());
};

@Injectable({
  providedIn: 'root'
})
export class ConfiglangService {

  public config:any={};
  constructor(private http: HttpClient) {
    
  }
  private CreateConfig(key:any,value:any){
      this.config[key]=value;
      console.log("createlangu",this.config);
  }

  get lang(){
    console.log("config languu",this.config);
      return this.config?.lang ?? [];
  }

  loadAppConfig(): Observable<boolean> {
    this.CreateConfig('lang', [{ code: 'en', name: 'English' }]);
    return of(true);
  }
}
