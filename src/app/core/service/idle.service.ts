import { Injectable, NgZone, OnDestroy, Injector, InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export const AUTH_SERVICE = new InjectionToken('AuthService');
import { Router } from '@angular/router';
import { fromEvent, Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IdleService implements OnDestroy {
  private idleTimeout = 30 * 60 * 1000; // 30 minute in milliseconds
  private idleTimer: any;
  private isIdle = false;
  private eventSubscriptions: Subscription[] = [];
  private authService: any;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private injector: Injector
  ) {
    // Use a small timeout to break the circular dependency chain
    // setTimeout(() => {
    //   try {
    //     this.authService = this.injector.get(AUTH_SERVICE);
    //     if (this.authService) {
    //       this.setupIdleTimer();
    //       this.setupEventListeners();
    //     }
    //   } catch (error) {
    //     console.error('Error initializing IdleService:', error);
    //   }
    // });
  }

  // private setupEventListeners() {
  //   const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
  //   events.forEach(event => {
  //     const sub = fromEvent(document, event).pipe(
  //       takeUntil(this.destroy$)
  //     ).subscribe(() => {
  //       this.resetIdleTimer();
  //     });
  //     this.eventSubscriptions.push(sub);
  //   });
  // }

  // private setupIdleTimer() {
  //   this.ngZone.runOutsideAngular(() => {
  //     this.resetIdleTimer();
  //   });
  // }

  // private resetIdleTimer() {
  //   if (this.idleTimer) {
  //     clearTimeout(this.idleTimer);
  //   }
  //   this.idleTimer = setTimeout(() => this.handleIdleTimeout(), this.idleTimeout);
  // }

  // private handleIdleTimeout() {
  //   this.ngZone.run(() => {
  //     if (this.authService?.isLoggedIn()) {
  //       this.isIdle = true;
  //       this.logout();
  //     }
  //   });
  // }

  // private async logout() {
  //   if (!this.authService) return;
    
  //   const userDetails = this.authService.fetchUserDetails();
  //   if (userDetails?.Id) {
  //     try {
  //       const baseUrl = environment.domain.replace('/api/v1', ''); // Remove /api/v1 as it's already in the path
  //       await fetch(`${baseUrl}/api/v1/Auth/Logout`, {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({
  //           userId: userDetails.Id,
  //           loggedAs: userDetails.LoggedAs || 'Employee'
  //         }),
  //         credentials: 'include'
  //       });
  //     } catch (error) {
  //       console.error('Logout API error:', error);
  //     } finally {
  //       this.performLogout();
  //     }
  //   } else {
  //     this.performLogout();
  //   }
  // }

  // private performLogout() {
  //   this.authService?.logout();
  //   this.router.navigate(['/authentication/sign-in']);
  // }

  // public startWatching() {
  //   this.isIdle = false;
  //   this.resetIdleTimer();
  // }

  // public stopWatching() {
  //   if (this.idleTimer) {
  //     clearTimeout(this.idleTimer);
  //   }
  //   this.isIdle = false;
  // }

  ngOnDestroy() {
    // this.destroy$.next();
    // this.destroy$.complete();
    
    // if (this.idleTimer) {
    //   clearTimeout(this.idleTimer);
    // }
    // this.eventSubscriptions.forEach(sub => sub.unsubscribe());
  }
}