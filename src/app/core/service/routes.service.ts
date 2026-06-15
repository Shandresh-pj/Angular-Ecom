import { Injectable } from '@angular/core';
import { of, Observable, map, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { shareReplay } from 'rxjs/operators';
import { Router, UrlSegment } from '@angular/router';
import { AuthGuard } from '../guard/auth.guard';
import { NonAuthGuard } from '../guard/non-auth.guard';
import { removeSpecialCharacters } from '../../utils';
import { CommonService } from './common.service';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import * as CryptoJS from 'crypto-js';
// export const webResourceFactory = (
//   resourceService: ResourcesService
// ): (() => Observable<any>) => {
//   return () => resourceService.getResources({ ResourceType: 'WEB' });
// };
import { statusFactory, StatusService } from './status.service';

const STATIC_RESOURCES = [
  { ResourceId: '1', ResourceName: 'Banners', ResourceUrl: '/banners', children: [] },
  { ResourceId: '2', ResourceName: 'CMS', ResourceUrl: '/cms', children: [] },
  { ResourceId: '3', ResourceName: 'App Slider Content', ResourceUrl: '/app-slider-content', children: [] },
  { ResourceId: '4', ResourceName: 'Testimonial', ResourceUrl: '/testimonial', children: [] },
  { ResourceId: '5', ResourceName: 'Supports', ResourceUrl: '/supports', children: [] },
  { ResourceId: '6', ResourceName: 'Feedback', ResourceUrl: '/feedback', children: [] },
  { ResourceId: '7', ResourceName: 'Contact Us', ResourceUrl: '/contact-us', children: [] },
  { ResourceId: '8', ResourceName: 'Customer Apps', ResourceUrl: '/customer-apps', children: [] },
  { ResourceId: '9', ResourceName: 'Dealer', ResourceUrl: '/dealer', children: [] },
  { ResourceId: '10', ResourceName: 'Reseller', ResourceUrl: '/reseller', children: [] },
  { ResourceId: '11', ResourceName: 'Admin', ResourceUrl: '/admin', children: [] },
  { ResourceId: '12', ResourceName: 'Points', ResourceUrl: '/points', children: [] },
  { ResourceId: '13', ResourceName: 'Orders', ResourceUrl: '/orders', children: [] },
  { ResourceId: '14', ResourceName: 'Contest', ResourceUrl: '/contest', children: [] },
  { ResourceId: '15', ResourceName: 'Transaction', ResourceUrl: '/transaction', children: [] },
  { ResourceId: '16', ResourceName: 'Networks', ResourceUrl: '/networks', children: [] },
  { ResourceId: '17', ResourceName: 'Products', ResourceUrl: '/products', children: [] },
  { ResourceId: '18', ResourceName: 'Category', ResourceUrl: '/category', children: [] },
  { ResourceId: '19', ResourceName: 'Service Category', ResourceUrl: '/service-category', children: [] },
  { ResourceId: '20', ResourceName: 'Contest Category', ResourceUrl: '/contest-category', children: [] },
  { ResourceId: '21', ResourceName: 'Partake Category', ResourceUrl: '/partake-category', children: [] },
  { ResourceId: '22', ResourceName: 'Videos', ResourceUrl: '/videos', children: [] },
  { ResourceId: '23', ResourceName: 'Product Attribute', ResourceUrl: '/product-attribute', children: [] },
  { ResourceId: '24', ResourceName: 'Product Attribute Value', ResourceUrl: '/product-attribute-value', children: [] },
  { ResourceId: '25', ResourceName: 'Video Category', ResourceUrl: '/video-category', children: [] },
  { ResourceId: '26', ResourceName: 'Setting', ResourceUrl: '/setting', children: [] },
  { ResourceId: '27', ResourceName: 'Master Data', ResourceUrl: '/master-data', children: [] },
  { ResourceId: '28', ResourceName: 'Services', ResourceUrl: '/services', children: [] },
  { ResourceId: '29', ResourceName: 'Lable', ResourceUrl: '/lable', children: [] },
  { ResourceId: '30', ResourceName: 'Partake Task', ResourceUrl: '/partake-task', children: [] },
  { ResourceId: '31', ResourceName: 'Students', ResourceUrl: '/students', children: [] },
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

// export const webResourceFactory = (
//   resourceService: ResourcesService
// ): (() => Observable<any>) => {
//   return () => resourceService.getResources({ ResourceType: 'WEB' });
// };
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
    private commonService: CommonService,
    private statusService: StatusService,
  ) {
    this.loadAllComponent();
  }
  loadAllComponent() {
    //  All components load here
    this.AllComponents['resources'] = import(
      '../../authentication/resource/resource.component'
    ).then((m) => m.ResourceComponent);

    this.AllComponents['dashboard'] = import(
      '../../common/dashboard/dashboard.component'
    ).then((m) => m.DashboardComponent);

    this.AllComponents['banners'] = import(
      '../../pages/banner/banner.component'
    ).then((m) => m.BannerComponent);

    this.AllComponents['cms'] = import(
      '../../pages/cms/cms.component'
    ).then((m) => m.CmsComponent);

    this.AllComponents['app-slider-content'] = import(
      '../../pages/app-slider-content/app-slider-content.component'
    ).then((m) => m.AppSliderContentComponent);

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

    this.AllComponents['customer-apps'] = import(
      '../../pages/customer-apps/customer-apps.component'
    ).then((m) => m.CustomerAppsComponent);

    this.AllComponents['dealer'] = import(
      '../../pages/dealer/dealer.component'
    ).then((m) => m.DealerComponent);

    this.AllComponents['reseller'] = import(
      '../../pages/reseller/reseller.component'
    ).then((m) => m.ResellerComponent);

    this.AllComponents['admin'] = import(
      '../../pages/users/users.component'
    ).then((m) => m.UsersComponent);

    this.AllComponents['points'] = import(
      '../../pages/points/points.component'
    ).then((m) => m.PointsComponent);

    this.AllComponents['orders'] = import(
      '../../pages/orders/orders.component'
    ).then((m) => m.OrdersComponent);

    this.AllComponents['contest'] = import(
      '../../pages/contest/contest.component'
    ).then((m) => m.ContestComponent);

    this.AllComponents['transaction'] = import(
      '../../pages/transaction/transaction.component'
    ).then((m) => m.TransactionComponent);

    this.AllComponents['networks'] = import(
      '../../pages/networks/networks.component'
    ).then((m) => m.NetworksComponent);

    this.AllComponents['products'] = import(
      '../../pages/products/products.component'
    ).then((m) => m.ProductsComponent);

    this.AllComponents['category'] = import(
      '../../pages/category/category.component'
    ).then((m) => m.CategoryComponent);

    this.AllComponents['service-category'] = import(
      '../../pages/service-category/service-category.component'
    ).then((m) => m.ServiceCategoryComponent);

    this.AllComponents['contest-category'] = import(
      '../../pages/contest-category/contest-category.component'
    ).then((m) => m.ContestCategoryComponent);

    this.AllComponents['partake-category'] = import(
      '../../pages/partake-category/partake-category.component'
    ).then((m) => m.PartakeCategoryComponent);

    this.AllComponents['videos'] = import(
      '../../pages/videos/videos.component'
    ).then((m) => m.VideosComponent);

    this.AllComponents['product-attribute'] = import(
      '../../pages/product-attribute/product-attribute.component'
    ).then((m) => m.ProductAttributeComponent);

    this.AllComponents['product-attribute-value'] = import(
      '../../pages/product-attribute-value/product-attribute-value.component'
    ).then((m) => m.ProductAttributeValueComponent);

    this.AllComponents['video-category'] = import(
      '../../pages/video-category/video-category.component'
    ).then((m) => m.VideoCategoryComponent);

    this.AllComponents['setting'] = import(
      '../../pages/setting/setting.component'
    ).then((m) => m.SettingComponent);

    this.AllComponents['master-data'] = import(
      '../../pages/master-data/master-data.component'
    ).then((m) => m.MasterDataComponent);

    this.AllComponents['services'] = import(
      '../../pages/services/services.component'
    ).then((m) => m.ServicesComponent);

    this.AllComponents['lable'] = import(
      '../../pages/lable/lable.component'
    ).then((m) => m.LableComponent);

    this.AllComponents['partake-task'] = import(
      '../../pages/partake-task/partake-task.component'
    ).then((m) => m.PartakeTaskComponent);

    this.AllComponents['students'] = import(
      '../../pages/students/students.component'     // ← wrapper: userType="Student"
    ).then((m) => m.StudentsComponent);

    this.AllComponents['advertisers'] = import(
      '../../pages/advertisers/advertisers.component' // ← wrapper: userType="Advertiser"
    ).then((m) => m.AdvertisersComponent);

    this.AllComponents['app-admins'] = import(
      '../../pages/app-admins/app-admins.component'   // ← wrapper: userType="AppAdmin"
    ).then((m) => m.AppAdminsComponent);

    this.AllComponents['app-admin'] = import(
      '../../pages/app-admin/app-admin.component'
    ).then((m) => m.AppAdminComponent);

    this.AllComponents['e-products'] = import(
      '../../pages/e-com-products/e-com-products.component'
    ).then((m) => m.EComProductsComponent)

  }

  getActions(payload?: any) {
    this.Actions = [];
    return of([]);
  }

  getResources(payload?: any): Promise<any> {
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
  // getResources(payload?: any) {
  //   const user = localStorage.getItem('user');
  //   let userDetails = user ? user : null;
  //   let resourceRoute = '';
  //   if (userDetails) {
  //     resourceRoute = '/LoggedUserAccess';
  //   }
  //   this.commonService.getApi(`Actions`, {}).pipe(
  //     map((response: any) => {
  //       console.log('action response', response);
  //       this.Actions = response.data;
  //     })
  //   );
  //   return this.commonService
  //     .getApi(`Resources${resourceRoute}`, {
  //       ...payload,
  //     })
  //     .pipe(
  //       map((response: any) => {
  //         console.log('responseresponseresponse', response);
  //         this.Resources = response.data;
  //         this.setDynamicRoutes(this.Resources);
  //         return response.data;
  //       }),
  //       shareReplay()
  //     );
  // }
  getRoute(resources: any) {
    let ResourceUrl = resources.ResourceUrl?.split('/').join('');
    let ResourcePath = removeSpecialCharacters(
      resources.ResourceName
    ).toLowerCase();
    // console.log('checkresourcepath',ResourcePath)
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
      // console.log('checkresourul',ResourceUrl)
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
      // this is worked
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


      // { path: '**', redirectTo: '/404' },
    ]);
    // console.log('SSSEEEEE', this.router);
  }
}
