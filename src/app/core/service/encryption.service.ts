import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
private secretKey = 'ridea@2025!bookingSecureKey';
  userDetails: any;

  constructor(private router: Router,public authService: AuthService) {
    this.userDetails = this.authService.fetchUserDetails();
   }

encrypt(data: any): string {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, this.secretKey).toString();
  }

  decrypt(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  }
   ChangeRoutes(pagename:string, data:any) {
    const encrypted = this.encrypt(data);

    this.router.navigate([`/${pagename}`], {
      queryParams: { data: encrypted }
    });
  }
  WindowOpen(pagename: string, data: any, tabName: any = 'NewTab') {
    const encrypted = this.encrypt(data);
    const url = new URL(window.location.origin + `/${pagename}`);
    url.searchParams.set('data', encrypted);
    if(this.userDetails?.UserType === 'RootUser'){
      window.open(url.toString(), tabName); 
    }else{
      this.router.navigate([`/${pagename}`], { queryParams: { data: encrypted } });
    }
  }

  WindowOpenNew(
    pagename: string,
    data: any,
    extraParams: Record<string, any> = {}
  ) {
    const encrypted = this.encrypt(data);
    const queryParams = { data: encrypted, ...extraParams };
    this.router.navigate([`/${pagename}`], { queryParams });
  }  

}
