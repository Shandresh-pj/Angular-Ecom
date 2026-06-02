import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import  io from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
@Injectable({providedIn: 'root'})
export class SocketService {
  // public socket;
  public Socketmessage$: BehaviorSubject<string> = new BehaviorSubject('');
  public Mqttmessage$: BehaviorSubject<string> = new BehaviorSubject('');
  public message$: BehaviorSubject<string> = new BehaviorSubject('');
  constructor(
      private authService: AuthService){
      const user = this.authService.fetchUserDetails();
      // this.socket = io(environment.socket, {
      //   path: '/chintam', 
      //   auth: {token:user?.token}
      // });
  }

  // public getPanicAlert = () => {
  //   const user = this.authService.fetchUserDetails();
  //   console.log("commiddddddd", user, user?.CompanyId)
  //   this.socket.on('LatestPanicAlert/'+user?.CompanyId, (message:any) =>{
  //     this.Mqttmessage$.next(message);
  //   });
  //   return this.Mqttmessage$.asObservable();
  // };

  // public getPanicAlert = () => {
  //   const user = this.authService.fetchUserDetails();
  
  //   if (!user?.CompanyId || !user?.Company?.CompanyType) {
  //     return this.Mqttmessage$.asObservable();
  //   }
  //   const comapnyType=user?.OriginalCompany?.CompanyType;
  
  //   let role: 'Vendor' | 'Customer' | null = null;
  //   if (comapnyType === 'Customer' || comapnyType === 'CustomerBranch') {
  //     role = 'Customer';
  //   } else if (comapnyType === 'Vendor' || comapnyType === 'VendorBranch') {
  //     role = 'Vendor';
  //   }
  
  //   const channel = `LatestPanicAlert/${role}/${user.CompanyId}`;
  
  //   console.log('Listening PanicAlert Channel:', channel);
  
  //   this.socket.on(channel, (message: any) => {
  //     this.Mqttmessage$.next(message);
  //   });
  
  //   return this.Mqttmessage$.asObservable();
  // };
  
  // public getNotifyDriver = () => {
  //   const user = this.authService.fetchUserDetails();
  //   console.log("commidddddddss", user, user?.Id)
  //   this.socket.on('LatestNotifyDriver/'+user?.CompanyId, (message:any) =>{
  //     this.Socketmessage$.next(message);
  //   });
  //   return this.Socketmessage$.asObservable();
  // };

  public getPanicAlert = () => {
    const user = this.authService.fetchUserDetails();
    if (!user?.OriginalCompany?.CompanyType) {
      return this.Mqttmessage$.asObservable();
    }
  
    const companyType = user.OriginalCompany.CompanyType;
    let role: 'Vendor' | 'Customer';
    if (companyType === 'Vendor' || companyType === 'VendorBranch') {
      role = 'Vendor';
    } else {
      role = 'Customer';
    }
    const branchIds: number[] = Array.isArray(user.BranchAccess) && user.BranchAccess.length ? user.BranchAccess : [user.CompanyId];
  
    branchIds.forEach(branchId => {
      const channel = `LatestPanicAlert/${role}/${branchId}`;
      console.log('Listening PanicAlert Channel:', channel);
      // this.socket.off(channel);
      // this.socket.on(channel, (message: any) => {
      //   this.Mqttmessage$.next(message);
      // });
    });
  
    return this.Mqttmessage$.asObservable();
  };
  
    public getNotifyDriver = () => {
    const user = this.authService.fetchUserDetails();
    const companyIds: number[] = user?.BranchAccess || [user?.CompanyId];
    companyIds.forEach((companyId) => {
      // this.socket.on(`LatestNotifyDriver/${companyId}`, (message: any) => {
      //   this.Socketmessage$.next(message);
      // });
      // console.log('Listening LatestNotifyDriver Channel',companyId)
    });
  
    return this.Socketmessage$.asObservable();
  };

}

