import { Injectable } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { throwError, Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import { IdleService } from './idle.service'; 
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  [x: string]: any;
  public userDetails:any;
  constructor(
    private http: HttpClient,
    private idleService: IdleService
  ) {}

  isLoggedIn(): boolean {
    return !!this.fetchUserDetails();
  }

  public storeUserDetails(loginDetails: any) {
    console.log("login",loginDetails);
    this.userDetails=JSON.stringify(loginDetails);
    let ciphertext = CryptoJS.AES.encrypt(this.userDetails,environment.cryptoKey).toString();
    console.log("this.userDetails",this.userDetails,"ciphertext",ciphertext);
    localStorage.setItem('user', ciphertext);
    // this.idleService.startWatching();
  }

  public fetchUserDetails(): any {
    const user = localStorage.getItem('user') || '';
    try {
      let decrypted = CryptoJS.AES.decrypt(user, environment.cryptoKey).toString(CryptoJS.enc.Utf8);
      this.userDetails = decrypted ? JSON.parse(decrypted) : null;
  } catch (error) {
      console.error('Decryption failed:', {error});
      this.userDetails = null;
  }
  
    // let decrypted = CryptoJS.AES.decrypt(user, environment.cryptoKey).toString(CryptoJS.enc.Utf8);
    // this.userDetails=decrypted ?JSON.parse(decrypted) : null;
    // console.log(CryptoJS.AES.decrypt(user, environment.cryptoKey))
    return this.userDetails;
  
  }
  
  public logout() {
    localStorage.clear();
    this.userDetails = null;
    // this.idleService.stopWatching();
  }

  public getUserAccess(CompanyType:string){
    // let UserAccess:any=[];
    // this.userDetails.UserAccess && this.userDetails?.UserAccess.map((ua:any)=>{
    //   UserAccess=[...UserAccess,...ua.RoleAccess]
    // })
    // this.userDetails=this.fetchUserDetails()
    return this.userDetails?.RoleAccess[CompanyType]
  }
         
  public file_upload(request: any, itemNo:any, img:any): Observable<any> {
    let uploadURL;
    if (itemNo !== '') {
      uploadURL = `${environment.domain}/extraitem/upload/${itemNo}/${img}`;
    } else {
      uploadURL = `${environment.domain}/extraitem/uploadOne`;
    }
    return this.http
    .post(uploadURL, request, {
        headers: new HttpHeaders({
          Authorization: this.fetchUserDetails()['token'],
          enctype: 'multipart/form-data',
        }),
      })
      .pipe(
        map(res => {
          return res;
        }),
        catchError((error: HttpErrorResponse): any => throwError(error.error)),
      );
  }
}
