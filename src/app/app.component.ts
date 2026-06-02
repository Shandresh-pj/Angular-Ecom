import { Component } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterOutlet, Router, Event, NavigationEnd } from '@angular/router';
import { SpinnerComponent } from './spinner/spinner.component';
import { TranslateLoader } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
export function HttpLoaderFactory(http: HttpClient) {
  return new CustomLoader(http);
}
export class CustomLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  public getTranslation(lang: String): Observable<any> {
    return this.http.get(`${environment.domain}/${lang}/label`, {}).pipe(
      map((res) => {
        return res;
      })
    );
    //return this.commonService.getApi('/labels',{});
  }
}
@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, CommonModule,SpinnerComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {

    title = 'Trypdek';

    constructor(
        private router: Router,
        private viewportScroller: ViewportScroller
    ) {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                // Scroll to the top after each navigation end
                this.viewportScroller.scrollToPosition([0, 0]);
            }
        });
        const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.display = 'none';
  }
    }

}