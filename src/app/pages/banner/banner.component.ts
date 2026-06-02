import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { CommonService } from '../../core/service/common.service';
import { EncryptionService } from '../../core/service/encryption.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { Utils } from '../../utils';
import { MatTableComponent } from '../../shared/mat-table/mat-table.component';
import { MatCard } from '@angular/material/card';
import { AuthService } from '../../core/service/auth.service';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { QuillComponent } from '../../shared/quill/quill.component';
import { MatInput } from '@angular/material/input';
import { environment } from '../../../environments/environment';
import { FileuploadComponent } from '../../shared/fileupload/fileupload.component';

@Component({
    selector: 'app-banner',
    standalone: true,
    imports: [MatTableComponent,MatCard,MatIcon,MatFormField,MatInput,MatLabel,QuillComponent,
        ReactiveFormsModule,FileuploadComponent
    ],
    templateUrl: './banner.component.html',
    styleUrl: './banner.component.scss',
})
export class BannerComponent extends Utils implements OnInit {
    @ViewChild('bannerInput') bannerInput!: ElementRef;
    CompanyId: any;
    isToggled: any;
    public action = { add: true, edit: true, view: true };
    columns: any;
    userdetails: any;
    companycode: any;
    showBannerForm: boolean = false;
    formMode: string = '';
    selectedRow: any = null;
    Bannerurls: any[] = [];
    BannerfileName: any;
    BannerImageFile: any;
    BannerId: any;
    bannerForm!: FormGroup;
    BannerEdit: any;
    deletedImage = false;
    bannersurl=false;
    sendimgname: any;

    constructor(
        private formBuilder: FormBuilder,
        public themeService: CustomizerSettingsService,
        private commonService: CommonService,
        private activatedRoute: ActivatedRoute,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router,
        public userService: UserService,
        private encryptionService: EncryptionService,
    ) {
        super();
        this.bannerForm = this.formBuilder.group({
            Id: [''],
            Title: ['',Validators.required],
            Description: [''],
            UploadImage: [''],
        });
        this.themeService.isToggled$.subscribe((isToggled) => {
            this.isToggled = isToggled;
        });

        this.activatedRoute.queryParams.subscribe((params) => {
            const encryptedData = params['data'];
            this.CompanyId = params['company_id'] || 0;
            if (encryptedData) {
                const decryptedObj =this.encryptionService.decrypt(encryptedData);
                console.log('Decrypted Params:', decryptedObj);
                this.CompanyId = decryptedObj.company_id || 0;
            }
        });

        this.columns = [
            {columnDef: 'ID',header: 'ID',cell: (element: any) => `${element?.Id}`,},
            {columnDef: 'Title',header: 'Title',cell: (element: any) => `${element?.Title}`,},
            {columnDef: 'Description',header: 'Description',cell: (element: any) =>element.Description
                ? element.Description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g,' ',): ''},
            {columnDef: 'UploadImage',header: 'Image',cell: (element: any) => `${element.UploadImage}`},
        ];
    }
    ngOnInit(): void {
        this.userdetails = this.authService?.fetchUserDetails();
        this.companycode = this.userdetails?.Companys?.CompanyCode;

        this.bannersurl = this.router.url.includes('/banners');
        this.sendimgname=this.bannersurl ? 'Banner' : 'App Slider';
        console.log('checkbannerurl',this.bannersurl)
    }

    Toggleclass(value: any, mode: any) {
        this.formMode = mode;
        this.selectedRow = value;
        this.showBannerForm = true;
        if (mode === 'edit' || mode === 'view') {
            this.commonService
                .getApi(`Banner/${value?.Id}`, {})
                .subscribe((res: any) => {
                    this.BannerEdit = res.data;
                    const UploadImage =this.BannerEdit?.UploadImage?.trim() || '';
                    this.Bannerurls = UploadImage ? [`${environment.domain}/${UploadImage}`] : [];
                    this.BannerImageFile = null;
                    this.bannerForm.patchValue({
                        ...this.BannerEdit,
                    });
                });
            // this.Bannerurls = value?.Bannerurls ?? [];
             if (mode === 'view') {
                this.bannerForm.disable();
            }
        } else if (mode === 'add') {
            this.Bannerurls = [];
        }
    }

    closeBannerForm() {
        this.showBannerForm = false;
        this.formMode = '';
        this.selectedRow = null;
        this.Bannerurls = [];
        this.bannerForm.enable();
        this.bannerForm.reset();
    }
    updateDescription(value: string) {
        // console.log('valuevaluevalue', value);
        this.bannerForm.patchValue({
            Description: value,
        });
    }

    onImageReceived(file: any) {
  this.BannerImageFile = file;
    this.deletedImage = false;
}
onDeleteImage(flag: boolean) {
  this.deletedImage = flag;
  if (flag) {
    this.BannerImageFile = null; 
  }
}

    SubmitBannerForm(form: FormGroup) {
        if (form.valid) {
            const logoForm = new FormData();
            logoForm.append('Title', form.value.Title);
            logoForm.append('Description', form.value.Description);
            logoForm.append('Type',this.bannersurl ? 'WEB' : 'APP');
            if (this.BannerImageFile) {
                logoForm.append('UploadImage', this.BannerImageFile);
            }
            if (this.deletedImage) {
                logoForm.append('UploadImage', '');
            }
            this.formDataSubmit(this.selectedRow?.Id,logoForm,'Banner','Banner',{
                    formInitialValues: this.formInitialValues,
                    commonService: this.commonService,
                    router: this.router,
                },
            ).then(() => {
                this.closeBannerForm();
            });
        } else {
            this.validateAllFormFields(form);
          }
    }
}
