import { CanActivateFn } from '@angular/router';

import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { UserService } from '../service/user.service';

export const authGuard: CanActivateFn = (route, state) => {
  return true;
};
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  static currentUser: any;
  constructor(
    private router: Router,
    private authService: AuthService,
     private userService: UserService
  ) {}

  // ngOnInit(): void {
  //   if (!this.authService['isAuthenticated']()) {
  //     this.router.navigate(['/access-denied']);
  //   }
  // }
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> // | UrlTree // | boolean // | Promise<boolean | UrlTree> // | Observable<boolean | UrlTree>
  {
   
    const currentUser = this.authService.fetchUserDetails();
    if(currentUser) {
      if (currentUser.hasOwnProperty('token') && currentUser.token) {   
        let url=state.url;
     
        let urlNoQuery=url && url.split("?")[0]
        console.log('urlNoQuery',urlNoQuery)
        if(this.userService.hasPagePermission(urlNoQuery) || url=='/dashboard' || url=='/resources'){
          return Promise.resolve(true);  
         
        }     
        else{
          this.router.navigate(['/dashboard'], {
          //  queryParams: { return_url: state.url },
          });
        }
       
      }
      else {
        this.authService.logout();
      }
    }
    
    this.router.navigate(['/sign-in'], {
      queryParams: { return_url: state.url },
    });
    return Promise.reject(false);
  }
}

