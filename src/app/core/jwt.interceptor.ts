
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './service/auth.service';
import * as CryptoJS from 'crypto-js'; 
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  userDetails: any;

   
  constructor(private authService: AuthService,
  ) {}
  

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    
    let user=this.authService.fetchUserDetails();
    console.log("user",user)
    let currentUser:any =user ? user: null;
    if (currentUser && currentUser.token) {
      request = request.clone({
        setHeaders: {
          authorization: currentUser.token,
        },
        
      });
    }

    return next.handle(request);
  }
}
