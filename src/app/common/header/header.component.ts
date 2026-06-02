import { ChangeDetectorRef,Component,HostListener,Inject,OnInit,PLATFORM_ID,ViewChild,} from '@angular/core';
import { RouterLink,NavigationEnd,Router,ActivatedRoute,} from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { ToggleService } from './toggle.service';
import { NgClass, isPlatformBrowser, CommonModule } from '@angular/common';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/service/auth.service';
import { Utils } from '../../utils';
import { CommonService } from '../../core/service/common.service';
import { UserService } from '../../core/service/user.service';
import { FormBuilder,FormGroup,ReactiveFormsModule,} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SocketService } from '../../core/service/socket.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        RouterLink,MatButtonModule,CommonModule,MatMenuModule,MatInputModule,NgClass,MatCardModule,
        MatFormFieldModule,ReactiveFormsModule,
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
})
export class HeaderComponent extends Utils implements OnInit {
    //@ViewChild(NotifyCeComponent) notifyChild!: NotifyCeComponent;
    isSidebarToggled = false;
    public notifyalertForm: FormGroup;
    isToggled = false;
    FirstName: any;
    public CompanyId = 0;
    CompanyName: string = '';
    userRole: string = 'RootUser';
    EmployeeList: any;
    Notify: any;
    classPanicAlertApplied = false;
    classApplied = false;
    apiRoute: any;
    currentNotificationIndex = 0;
    currentPanicAlertNotificationIndex = 0;
    currentNotification: any;
    currentPanicAlertNotification: any;
    PanicAlert: any;
    ListShowNew: boolean = false;

    constructor(
        private formBuilder: FormBuilder,
        private userService: UserService,
        private authService: AuthService,
        private toggleService: ToggleService,
        private commonService: CommonService,
        private socketService: SocketService,
        private activatedRoute: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        public themeService: CustomizerSettingsService,
        @Inject(PLATFORM_ID) private platformId: Object,
        private router: Router
    ) {
        super();
        this.notifyalertForm = this.formBuilder.group({
            Id: [''],
            ViewedAt: [''],
        });
        this.activatedRoute.params.subscribe((val: any) => {
            // console.log('headerval', val, this.router.url);
        });
        this.router.events.subscribe((event: any) => {
            if (event instanceof NavigationEnd) {
                // console.log('headerval events', this.router.url);
                // console.log('headerval URL changed to:', event.url);
                this.checkAndChangeUrl(event.url);
            }
        });
        this.activatedRoute.queryParams.subscribe((params) => {
            this.CompanyId = params['company_id'] || 0;
        });

        this.toggleService.isSidebarToggled$.subscribe((isSidebarToggled) => {
            this.isSidebarToggled = isSidebarToggled;
        });
        this.themeService.isToggled$.subscribe((isToggled) => {
            this.isToggled = isToggled;
        });
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
                if (this.isSidebarToggled) {
                    this.toggleService.toggle(); 
                }
            });
    }
    ngOnInit(): void {
        this.EmployeeList = this.authService.fetchUserDetails();
        this.FirstName = this.EmployeeList?.Company?.Name || null;
        if (Array.isArray(this.EmployeeList?.OriginalCompany?.NotifyDriverTo) && this.EmployeeList?.LoggedAs == 'Employee' &&
            this.EmployeeList.OriginalCompany.NotifyDriverTo.includes(this.EmployeeList.Id))
            this.getnotify();

            if (Array.isArray(this.EmployeeList?.OriginalCompany?.PanicAlertTo) &&this.EmployeeList?.LoggedAs == 'Employee' &&
            this.EmployeeList.OriginalCompany.PanicAlertTo.includes(this.EmployeeList.Id)) {
            this.getPanicAlert();
            }
     
    }
    checkAndChangeUrl(url: string): void {
        let urlNoQuery = url && url.split('?')[0];
        if (this.userService.hasPagePermission(urlNoQuery)) {
            console.log('Page have access');
        } else {
            console.log('Page No Access');
        }
    }
    logout() {
        Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to logout?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, logout!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                console.log('Logout confirmed');
                this.authService.logout();
                this.router.navigate(['/sign-in'], {
                    queryParams: { return_url: this.router.url },
                });
            }
        });
    }
    toggle() {
        this.toggleService.toggle();
    }

    settingsButtonToggle() {
        this.themeService.toggle();
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    isSticky: boolean = false;
    @HostListener('window:scroll', ['$event'])
    checkScroll() {
        const scrollPosition = window.scrollY ||document.documentElement.scrollTop ||document.body.scrollTop ||0;
        if (scrollPosition >= 50) {
            this.isSticky = true;
        } else {
            this.isSticky = false;
        }
    }

    isFullscreen: boolean = false;
    ngAfterViewInit() {
        this.ListShowNew = false;
        this.ListShowNew = false;
        if (isPlatformBrowser(this.platformId)) {
            document.addEventListener('fullscreenchange',this.onFullscreenChange.bind(this));
            document.addEventListener('webkitfullscreenchange',this.onFullscreenChange.bind(this));
            document.addEventListener('mozfullscreenchange',this.onFullscreenChange.bind(this));
            document.addEventListener('MSFullscreenChange',this.onFullscreenChange.bind(this));
        }
    }
    toggleFullscreen() {
        if (this.isFullscreen) {
            this.closeFullscreen();
        } else {
            this.openFullscreen();
        }
    }
    openFullscreen() {
        if (isPlatformBrowser(this.platformId)) {
            const element = document.documentElement as HTMLElement & {
                mozRequestFullScreen?: () => Promise<void>;
                webkitRequestFullscreen?: () => Promise<void>;
                msRequestFullscreen?: () => Promise<void>;
            };
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        }
    }
    closeFullscreen() {
        if (isPlatformBrowser(this.platformId)) {
            const doc = document as Document & {
                mozCancelFullScreen?: () => Promise<void>;
                webkitExitFullscreen?: () => Promise<void>;
                msExitFullscreen?: () => Promise<void>;
            };
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (doc.mozCancelFullScreen) {
                doc.mozCancelFullScreen();
            } else if (doc.webkitExitFullscreen) {
                doc.webkitExitFullscreen();
            } else if (doc.msExitFullscreen) {
                doc.msExitFullscreen();
            }
        }
    }

    onFullscreenChange() {
        if (isPlatformBrowser(this.platformId)) {
            const doc = document as Document & {
                webkitFullscreenElement?: Element;
                mozFullScreenElement?: Element;
                msFullscreenElement?: Element;
            };
            this.isFullscreen = !!(document.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
        }
    }

    getCompanyDetails() {
        this.commonService
            .getApi(`Company/${this.CompanyId}`, {})
            .subscribe((res: any) => {
                console.log(res?.data);
                this.CompanyName = res?.data?.Name || '';
                console.log('companyname', this.CompanyName);
            });
    }
    getnotify() {
        this.socketService.getNotifyDriver().subscribe((res: any) => {
            console.log('resres', res);
            this.Notify = res ? [res] : [];
            if (this.Notify.length > 0) {
                this.showNextNotification();
            }
            this.cdr.detectChanges();
        });
    }

    showNextNotification() {
        if (this.currentNotificationIndex < this.Notify.length) {
            this.currentNotification =
                this.Notify[this.currentNotificationIndex];
            console.log('this.Notify', this.currentNotification);
            this.classApplied = true;
            this.notifyalertForm.patchValue({
                Id: this.currentNotification.Id,
            });
        } else {
            this.toggleClose();
        }
    }
  
    toggleClose() {
        this.classApplied = false;
    }
    PanicAlertClose() {
        this.classPanicAlertApplied = false;
    }
    getPanicAlert() {
        this.socketService.getPanicAlert().subscribe((res: any) => {
            this.PanicAlert = res ? [res] : [];
            if (this.PanicAlert.length > 0) {
                this.showNextPanicAlertNotification();
            }
            // this.cdr.detectChanges();
        });
    }
    showNextPanicAlertNotification() {
        if (this.currentPanicAlertNotificationIndex < this.PanicAlert.length) {
            const current =this.PanicAlert[this.currentPanicAlertNotificationIndex];
            this.currentPanicAlertNotification = current;
            this.classPanicAlertApplied = true;
            console.log("thisPanicAlertcurrent", this.currentPanicAlertNotification)

        } else {
            this.PanicAlertClose();
        }
    }

    getAlertDate(date: any) {
        return this.datePipe.transform(date, 'dd/MM/yyyy', 'UTC');
    }      


    PanicAlertCancel(id: any) {
        this.commonService.postApi(`PanicAlert/View/${id}`, {}).subscribe(
          () => {
            this.PanicAlertClose(); // close modal after API success
          },
          (err) => {
            console.error('Cancel API Failed:', err);
            this.PanicAlertClose(); // still close popup even if API fails
          }
        );
      }
}