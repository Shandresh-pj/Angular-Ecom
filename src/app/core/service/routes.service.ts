import { Injectable } from '@angular/core';
import { of, Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router, UrlSegment } from '@angular/router';
import { AuthGuard } from '../guard/auth.guard';
import { NonAuthGuard } from '../guard/non-auth.guard';
import { removeSpecialCharacters } from '../../utils';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import CryptoJS from 'crypto-js';

const STATIC_RESOURCES = [
  { ResourceId: '4', ResourceName: 'Testimonial', ResourceUrl: '/testimonial', children: [] },
  { ResourceId: '5', ResourceName: 'Supports', ResourceUrl: '/supports', children: [] },
  { ResourceId: '6', ResourceName: 'Feedback', ResourceUrl: '/feedback', children: [] },
  { ResourceId: '7', ResourceName: 'Contact Us', ResourceUrl: '/contact-us', children: [] },
  { ResourceId: '9', ResourceName: 'Dealer', ResourceUrl: '/dealer', children: [] },
  { ResourceId: '10', ResourceName: 'Reseller', ResourceUrl: '/reseller', children: [] },
  { ResourceId: '11', ResourceName: 'Admin', ResourceUrl: '/admin', children: [] },
  { ResourceId: '13', ResourceName: 'Orders', ResourceUrl: '/orders', children: [] },
  { ResourceId: '15', ResourceName: 'Transaction', ResourceUrl: '/transaction', children: [] },
  { ResourceId: '17', ResourceName: 'Products', ResourceUrl: '/products', children: [] },
  { ResourceId: '18', ResourceName: 'Category', ResourceUrl: '/category', children: [] },
  { ResourceId: '23', ResourceName: 'Product Attribute', ResourceUrl: '/product-attribute', children: [] },
  { ResourceId: '24', ResourceName: 'Product Attribute Value', ResourceUrl: '/product-attribute-value', children: [] },
  { ResourceId: '40', ResourceName: 'Status', ResourceUrl: '/status', children: [] },
  { ResourceId: '26', ResourceName: 'Setting', ResourceUrl: '/setting', children: [] },
  { ResourceId: '27', ResourceName: 'Master Data', ResourceUrl: '/master-data', children: [] },
  { ResourceId: '29', ResourceName: 'Lable', ResourceUrl: '/lable', children: [] },
  { ResourceId: '32', ResourceName: 'Advertisers', ResourceUrl: '/advertisers', children: [] },
  { ResourceId: '33', ResourceName: 'App Admins', ResourceUrl: '/app-admins', children: [] },
  { ResourceId: '34', ResourceName: 'Resources', ResourceUrl: '/resources', children: [] },
  { ResourceId: '35', ResourceName: 'App Admin', ResourceUrl: '/app-admin', children: [] },
  { ResourceId: '36', ResourceName: 'E-Products', ResourceUrl: '/e-products', children: [] },
];

export const webActionFactory = (
  resourceService: ResourcesService
): (() => Observable<any>) => {
  return () => resourceService.getActions({ ActionFor: 'WEB' });
};

export function webResourceFactory(resourcesService: ResourcesService) {
  return () => resourcesService.getResources({ ResourceType: 'WEB' });
}
@Injectable({
  providedIn: 'root',
})
export class ResourcesService {
  private _resources$ = new BehaviorSubject<any[]>([]);
  public Resources$ = this._resources$.asObservable();
  /** Synchronous snapshot kept in sync with the BehaviorSubject */
  public get Resources(): any[] { return this._resources$.getValue(); }
  public set Resources(value: any[]) { this._resources$.next(value); }
  public Actions: any;
  public AllComponents: any = {};
  constructor(
    private router: Router,
  ) {
    this.loadAllComponent();
  }
  loadAllComponent() {
    this.AllComponents['resources'] = import(
      '../../authentication/resource/resource.component'
    ).then((m) => m.ResourceComponent);

    this.AllComponents['dashboard'] = import(
      '../../common/dashboard/dashboard.component'
    ).then((m) => m.DashboardComponent);

    this.AllComponents['testimonial'] = import(
      '../../pages/testimonial/testimonial.component'
    ).then((m) => m.TestimonialComponent);

    this.AllComponents['supports'] = import(
      '../../pages/supports/supports.component'
    ).then((m) => m.SupportsComponent);

    this.AllComponents['feedback'] = import(
      '../../pages/feedback/feedback.component'
    ).then((m) => m.FeedbackComponent);

    this.AllComponents['contact-us'] = import(
      '../../pages/contact-us/contact-us.component'
    ).then((m) => m.ContactUsComponent);

    this.AllComponents['dealer'] = import(
      '../../pages/dealer/dealer.component'
    ).then((m) => m.DealerComponent);

    this.AllComponents['reseller'] = import(
      '../../pages/reseller/reseller.component'
    ).then((m) => m.ResellerComponent);

    this.AllComponents['admin'] = import(
      '../../pages/users/users.component'
    ).then((m) => m.UsersComponent);

    this.AllComponents['orders'] = import(
      '../../pages/orders/orders.component'
    ).then((m) => m.OrdersComponent);

    this.AllComponents['transaction'] = import(
      '../../pages/transaction/transaction.component'
    ).then((m) => m.TransactionComponent);

    this.AllComponents['products'] = import(
      '../../pages/products/products.component'
    ).then((m) => m.ProductsComponent);

    this.AllComponents['category'] = import(
      '../../pages/category/category.component'
    ).then((m) => m.CategoryComponent);

    this.AllComponents['product-attribute'] = import(
      '../../pages/product-attribute/product-attribute.component'
    ).then((m) => m.ProductAttributeComponent);

    this.AllComponents['product-attribute-value'] = import(
      '../../pages/product-attribute-value/product-attribute-value.component'
    ).then((m) => m.ProductAttributeValueComponent);

    this.AllComponents['status'] = import(
      '../../pages/status/status.component'
    ).then((m) => m.StatusComponent);

    this.AllComponents['setting'] = import(
      '../../pages/Profile/setting.component'
    ).then((m) => m.SettingComponent);

    this.AllComponents['master-data'] = import(
      '../../pages/master-data/master-data.component'
    ).then((m) => m.MasterDataComponent);

    this.AllComponents['lable'] = import(
      '../../pages/lable/lable.component'
    ).then((m) => m.LableComponent);

    this.AllComponents['advertisers'] = import(
      '../../pages/advertisers/advertisers.component'
    ).then((m) => m.AdvertisersComponent);

    this.AllComponents['app-admins'] = import(
      '../../pages/app-admins/app-admins.component'
    ).then((m) => m.AppAdminsComponent);

    this.AllComponents['app-admin'] = import(
      '../../pages/app-admin/app-admin.component'
    ).then((m) => m.AppAdminComponent);

    this.AllComponents['e-products'] = import(
      '../../pages/e-com-products/e-com-products.component'
    ).then((m) => m.EComProductsComponent);
  }

  getActions(_payload?: any) {
    this.Actions = [];
    return of([]);
  }

  getResources(_payload?: any): Promise<any> {
    const user: string = localStorage.getItem('user') || '';
    let userDetails: any;

    try {
      let decrypted = CryptoJS.AES.decrypt(user, environment.cryptoKey).toString(CryptoJS.enc.Utf8);
      userDetails = decrypted ? JSON.parse(decrypted) : null;
    } catch (error) {
      console.error('Decryption failed:', { error });
      userDetails = null;
    }
    console.log('user', userDetails);

    this.Resources = STATIC_RESOURCES;
    this.setDynamicRoutes(this.Resources);
    return Promise.resolve(STATIC_RESOURCES);
  }

  getRoute(resources: any) {
    let ResourceUrl = resources.ResourceUrl?.split('/').join('');
    let ResourcePath = removeSpecialCharacters(
      resources.ResourceName
    ).toLowerCase();
    return {
      matcher: (url: any) => {
        if (url.length >= 1 && url[0].path == ResourcePath) {
          const fullUrl = url.map((a: any) => a.path).join('/');
          return {
            consumed: url,
            posParams: {
              id: new UrlSegment(url.length == 3 ? url[2].path : fullUrl, {}),
              resourceId: new UrlSegment(resources.ResourceId, {}),
            },
          };
        }

        return null;
      },
      loadComponent: () => {
        return this.AllComponents[ResourceUrl]
          ? this.AllComponents[ResourceUrl]
          : this.AllComponents['404'];
      },
      canActivate: [AuthGuard],
    };
  }
  async setDynamicRoutes(routes: any) {
    console.log('routes', routes)
    let AllRoutes: any = [];
    routes.map((resources: any) => {
      let ResourceUrl = resources.ResourceUrl?.split('/').join('');
      resources.children.map((child: any) => {
        AllRoutes.push(this.getRoute(child));
      });
      if (ResourceUrl != '') {
        AllRoutes.push(this.getRoute(resources));
      }
    });
    if (AllRoutes.length == 0) {
      AllRoutes.push({
        path: 'dashboard',
        loadComponent: () =>
          import('../../common/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        canActivate: [AuthGuard],
      });
    }
    AllRoutes.push({
      path: 'dashboard',
      loadComponent: () =>
        import('../../common/dashboard/dashboard.component').then(
          (m) => m.DashboardComponent
        ),
    });

    this.router.resetConfig([
      { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
      {
        path: 'sign-in',
        loadComponent: () =>
          import('../../authentication/sign-in/sign-in.component').then(
            (m) => m.SignInComponent
          ),
        canActivate: [NonAuthGuard],
      },
      {
        path: '',
        component: DashboardComponent,
        children: AllRoutes,
      },
    ]);
  }
}
