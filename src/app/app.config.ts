import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection, InjectionToken, importProvidersFrom } from '@angular/core';
import { AUTH_SERVICE } from './core/service/idle.service';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { JwtInterceptor } from './core/jwt.interceptor';
import { ErrorInterceptor } from './core/error.interceptor';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CommonService } from './core/service/common.service';
import { AuthService } from './core/service/auth.service';
import { ResourcesService, webActionFactory, webResourceFactory } from './core/service/routes.service';
import { LoadingInterceptor, Spinner } from './spinner/spinner';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../app/app.component';
import { configFactory, ConfiglangService } from './core/service/configlang.service';
export const appConfig: ApplicationConfig = {
    providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration()
        ,provideAnimationsAsync(),provideHttpClient(withFetch()),
        CommonService, AuthService,LoadingInterceptor, Spinner,
         importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
        isolate: false,
      })
    ),
        provideHttpClient(
            withInterceptorsFromDi(),
          ),
          {
            provide: APP_INITIALIZER,
            useFactory: webResourceFactory,
            multi: true,
            deps: [ResourcesService],
          },
          {
            provide: APP_INITIALIZER,
            useFactory: webActionFactory,
            multi: true,
            deps: [ResourcesService],
          },
          {
            provide: APP_INITIALIZER,
            useFactory: configFactory,
            multi: true,
            deps: [ConfiglangService],
          },
            {provide:CommonService},provideHttpClient(),
            { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
            { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
            { provide: HTTP_INTERCEPTORS, useClass: Spinner, multi: true },
            { provide: AUTH_SERVICE, useClass: AuthService },
            provideNativeDateAdapter(),
    ]
};