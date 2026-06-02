import { CanActivateFn } from '@angular/router';
import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../service/auth.service';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class NonAuthGuard implements CanActivate {
  constructor(public auth: AuthService, public router: Router) {}

  ngOnInit() {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.auth.fetchUserDetails()) {
      if (this.auth.fetchUserDetails().hasOwnProperty('token') && this.auth.fetchUserDetails().token) {        
        const currentUser = this.auth.fetchUserDetails();
        console.log('currentUser',currentUser);
          this.router.navigate(['/dashboard']);
        return false;
      }
      else {
        this.auth.logout();
      }
    }
    return true;


  }
}
