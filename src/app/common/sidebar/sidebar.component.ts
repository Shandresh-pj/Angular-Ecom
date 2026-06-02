import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { NgClass } from '@angular/common';
import { ToggleService } from '../header/toggle.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { AuthService } from '../../core/service/auth.service';
import { UserService } from '../../core/service/user.service';
import { CommonService } from '../../core/service/common.service';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { EncryptionService } from '../../core/service/encryption.service';
import { ResourcesService } from '../../core/service/routes.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    NgScrollbarModule,
    MatExpansionModule,
    RouterLinkActive,
    RouterLink,
    NgClass,
    MatIconModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit, OnDestroy {
  readonly panelOpenState = signal(false);
  ActiveUrl = { Customer: '', Vendor: '' };
  // isSidebarToggled
  isSidebarToggled = false;
  // isToggled
  isToggled = false;
  userDetails: any;
  routes: any = [];
  EmployeeList: any;
  RoleId: any;
  CompanyId: any;
  FirstName: any;
  QueryParams: any;
  NewQueryParams: any;
  GetCompany: any;
  imagechange: string = '/Logo/fb_logo1.jpg';
  CompanyUrlId: any;
  encrypted: any = '';
  lastCompanyId: any;
  companyProfileRoutes: { Url: string; Label: string }[] = [];

  activeRoute: any;
  vendor_customers: any;
  companyidencrypt: any;
  activeRouteUrl = '';
  private resourcesSub!: Subscription;

  constructor(
    private userService: UserService,
    private commonService: CommonService,
    private toggleService: ToggleService,
    public themeService: CustomizerSettingsService,
    public authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public router: Router,
    private resourcesService: ResourcesService,
    private encryptionService: EncryptionService,
  ) {
    this.toggleService.isSidebarToggled$.subscribe((isSidebarToggled) => {
      this.isSidebarToggled = isSidebarToggled;
      this.updateImage();
    });
    this.themeService.isToggled$.subscribe((isToggled) => {
      this.isToggled = isToggled;
      this.updateImage();
    });
    this.userDetails = this.authService.fetchUserDetails();
    console.log('userDetailssssssss', this.userDetails);
    // this.activatedRoute.queryParams.subscribe((params: any) => {
    //     console.log('sidebar value',params)
    //      console.log('company_idcompany_id',params['company_id'])
    //     this.NewQueryParams = params['company_id'] || this.userDetails?.CompanyId ;
    //     const queryObj={company_id:this.NewQueryParams}
    //     this.encrypted=this.encryptionService.encrypt(queryObj)
    // });
    this.activatedRoute.queryParams.subscribe((params: any) => {
      const decryptedObj = params['data'] ? this.encryptionService.decrypt(params['data']) : {};
      console.log('Decrypted Params:', decryptedObj);
      if (decryptedObj?.company_id) {
        // this.NewQueryParams = decryptedObj.company_id || 0;
        // this.lastCompanyId = decryptedObj.company_id || 0;
        this.CompanyId = decryptedObj.company_id || 0;
      }
      // else if (this.lastCompanyId) {
      //   this.NewQueryParams = this.lastCompanyId;
      // } else {
      //   this.NewQueryParams = this.userDetails?.CompanyId;
      //   this.lastCompanyId = this.userDetails?.CompanyId;
      // }
      // this.vendor_customers = decryptedObj.vendor_customers || "Disable";

      // const queryObj = { company_id: this.NewQueryParams, vendor_customers: this.vendor_customers };
      const queryObj = { company_id: this.CompanyId };
      this.encrypted = this.encryptionService.encrypt(queryObj);
      // const companyidencrpt={
      //   company_id: this.NewQueryParams
      // }
      // this.companyidencrypt=this.encryptionService.encrypt(companyidencrpt);
      // // this.cdr.detectChanges();
      // console.log('query params:', this.lastCompanyId, this.NewQueryParams);
    });
    this.router.events.subscribe(() => {
      this.activeRouteUrl = this.router.url;
      console.log(this.activeRouteUrl)
    });
    // this.commonService.getApi(`Company/${this.NewQueryParams}`, {}).subscribe(async (res: any) => {
    //   this.GetCompany = res?.data;
    //   if ((this.GetCompany?.CompanyType == 'Customer' && this.userDetails?.UserType == 'Customer') || (this.userDetails?.UserType == 'Vendor' && this.GetCompany?.CompanyType == 'Customer')) {
    //     this.routes = [
    //       { Url: '/customers/company', Label: 'Company Profile' },
    //       { Url: '/customers/adminuser', Label: 'Admin Profile' },
    //       { Url: '/customers/branch', Label: 'Branches' },
    //       { Url: '/customers/settings', Label: 'Settings' },
    //       { Url: '/customers/department', Label: 'Departments' },
    //       { Url: '/customers/employees', Label: 'Employee' },
    //       { Url: '/customers/roles', Label: 'Roles' },
    //       { Url: '/customers/roleaccess', Label: 'Roles Access' },
    //       { Url: '/customers/customer-vendors', Label: 'Vendors', },
    //       { Url: '/customers/tariff', Label: 'Tariff' },
    //       { Url: '/customers/customer-booking', Label: 'Customer Booking', },
    //       { Url: '/customers/panic-alert', Label: "Panic Alert" },
    //       { Url: '/customers/invoicepayments', Label: "Invoice Payments" }
    //     ];
    //   } else if (
    //     this.GetCompany?.CompanyType == 'Vendor' &&
    //     this.userDetails?.UserType == 'Vendor'
    //   ) {
    //     this.routes = [
    //       // Vendor
    //       { Url: '/vendors/company', Label: 'Company Profile' },
    //       { Url: '/vendors/adminuser', Label: 'Admin Profile' },
    //       { Url: '/vendors/branch', Label: 'Branches' },
    //       { Url: '/vendors/settings', Label: 'Settings' },
    //       { Url: '/vendors/department', Label: 'Departments' },
    //       { Url: '/vendors/roles', Label: 'Roles' },
    //       { Url: '/vendors/roleaccess', Label: 'Roles Access' },
    //       { Url: '/vendors/employees', Label: 'Employee' },
    //       { Url: '/vendors/sub-vendors', Label: 'Sub Vendors' },
    //       { Url: '/vendors/drivers', Label: 'Drivers' },
    //       { Url: '/vendors/vehicle', Label: 'Vehicles' },
    //       { Url: '/vendors/vendor-customer', Label: 'Customers' },
    //       { Url: '/vendors/customer-tariff', Label: 'Customer Tariff', },
    //       { Url: '/vendors/vendor-tariff', Label: 'Subvendor Tariff', },
    //       { Url: '/vendors/vendor-booking', Label: 'Vendor Booking', },
    //       { Url: '/vendors/notify-ce', Label: 'Notified Drivers', },
    //       { Url: '/vendors/feedback', Label: 'Feedback', },
    //       { Url: '/vendors/bulkimport', Label: 'Bulk Import', },
    //       { Url: '/vendors/advance', Label: 'Advance', },
    //       { Url: '/vendors/panic-alert', Label: 'Panic Alert', },
    //       { Url: '/vendors/receipts', Label: 'Receipt', },
    //       { Url: '/vendors/invoice', Label: 'Invoice', },

    //     ];
    //   } else if (this.userDetails) {
    //     const rawCompanyType = this.GetCompany?.CompanyType?.toLowerCase();
    //     const companyType = rawCompanyType === 'vendorbranch' ? 'vendor' : rawCompanyType === 'customerbranch' ? 'customer' : rawCompanyType;

    //     setTimeout(() => {
    //       let empAcc = this.userService.getUserResources(
    //         (companyType || '').toUpperCase()
    //       );

    //       const companytypecheck = this.userDetails?.Company?.CompanyType;
    //       if ((companytypecheck === 'Vendor' || companytypecheck === 'Customer') &&
    //         this.userDetails?.VerificationSettings?.TripClose === 'Yes') {
    //         empAcc.push({
    //           ResourceName: 'Tripclose',
    //           ResourceType: companytypecheck,
    //           ResourceUrl: `/${companytypecheck.toLowerCase()}s/trip-close`,
  }

  ngOnInit(): void {
    // Subscribe reactively so the sidebar refreshes whenever resources load after login
    this.resourcesSub = this.resourcesService.Resources$.subscribe((resources) => {
      if (!resources || resources.length === 0) return;
      this.routes = resources
        ?.filter((r: any) =>
          r.ResourceName.toLowerCase() !== 'resources' &&
          r.ResourceName.toLowerCase() !== 'setting'
        )
        ?.map((route: any) => ({
          Url: route.ResourceUrl,
          Label: route.ResourceName,
          Type: route.ResourceType,
        }));
      console.log('sidebar routes updated:', this.routes);
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.resourcesSub?.unsubscribe();
  }

  setActiveRoute(url: string) {
    this.activeRoute = url.split('?')[0];
  }

  isActive(route: string): boolean {
    return this.activeRoute === route;
  }

  isRouteActive(routePath: string): boolean {
    // return this.router.url.includes(routePath);
    const currentUrl = this.router.url.split('?')[0];
    return currentUrl === routePath;
  }


  navigateHome() {
    this.router.navigate(['/dashboard'], {
      queryParams: {
        company_id: this.EmployeeList?.CompanyId
          ? this.EmployeeList?.CompanyId
          : this.QueryParams,
      },
    });
  }

  // Burger Menu Toggle
  toggle() {
    this.toggleService.toggle();
  }

  screenWidth: number = window.innerWidth;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    this.isSidebarToggled = this.isSidebarToggled;
    this.disablePaddingkey = false;
    this.cdr.detectChanges();
  }

  isForcedLogo2 = true;
  mouseHover = false;
  hasMouseEntered = false;
  onMouseEnter(isHover: boolean): void {
    const screenWidth = window.innerWidth;
    if (
      this.disablePaddingkey &&
      this.isSidebarToggled &&
      screenWidth <= 1200
    ) {
      return;
    }
    this.hasMouseEntered = true;
    this.mouseHover = isHover;
    if (this.isForcedLogo2) {
      this.imagechange = '/Logo/fb_logo1.jpg';
      this.isForcedLogo2 = false;
      return;
    }
    if (screenWidth <= 1200 && this.isSidebarToggled && isHover) {
      this.imagechange = '/Logo/fb_logo1.jpg';
    } else if (screenWidth <= 1200 && this.isSidebarToggled && !isHover) {
      this.imagechange = '/Logo/fb_logo1.jpg';
    } else if (screenWidth > 1200 && isHover && this.isSidebarToggled) {
      this.imagechange = '/Logo/fb_logo1.jpg';
    } else if (screenWidth > 1200 && !isHover && this.isSidebarToggled) {
      this.imagechange = '/Logo/fb_smalllogo.png';
    }
  }

  disablePaddingkey = false;

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'F12') {
      this.isForcedLogo2 = true;
      this.disablePaddingkey = true;
      this.updateImage();
    }
  }

  updateImage(): void {
    const screenWidth = window.innerWidth;
    if (this.isSidebarToggled && screenWidth < 1200) {
      this.imagechange = '/Logo/fb_logo1.jpg';
    } else if (this.isSidebarToggled && screenWidth > 1200) {
      this.imagechange = '/Logo/fb_smalllogo.png';
    } else if (!this.isSidebarToggled) {
      this.imagechange = '/Logo/fb_logo1.jpg';
    }
  }

  onMouseLeave() {
    // Handle mouse leave event
  }

}
