import { Component, OnInit } from "@angular/core";
import { MatTableComponent } from "../../shared/mat-table/mat-table.component";
import { MatCard } from "@angular/material/card";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatOption } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIcon } from "@angular/material/icon";
import { Utils } from "../../utils";
import { CustomizerSettingsService } from "../../customizer-settings/customizer-settings.service";
import { CommonService } from "../../core/service/common.service";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../../core/service/user.service";
import { EncryptionService } from "../../core/service/encryption.service";
import { AuthService } from "../../core/service/auth.service";
import { StatusService } from "../../core/service/status.service";
import { environment } from "../../../environments/environment.development";
import Swal from "sweetalert2";
import { FileuploadComponent } from "../../shared/fileupload/fileupload.component";
import { QuillComponent } from "../../shared/quill/quill.component";


@Component({
  selector: 'app-app-admin',
  standalone: true,
  imports: [MatTableComponent, MatCard, MatFormField, MatInput, MatLabel, ReactiveFormsModule,
    MatOption, MatSelectModule, MatCheckboxModule, MatIcon, ReactiveFormsModule, FileuploadComponent, QuillComponent],
  templateUrl: './app-admin.component.html',
  styleUrl: './app-admin.component.scss'
})
export class AppAdminComponent extends Utils implements OnInit{
    CompanyId: any;
    isToggled: any;
    public action = { add: true, edit: true, view: true };
    columns: any;
    formMode: any;
    showUsersForm: boolean = false;
    UsersForm!: FormGroup;
    selectedRow: any = null;
    statuses: any;
    UsersEdit: any;

    selectedFile: any;
    imagePreview: any;

    bannersurl=false;
    sendimgname: any;
    showBannerForm: boolean = false;
    BannerEdit :any;
    Bannerurls: any[] = [];
    BannerfileName: any;
    BannerImageFile: any;
    companycode :any;
    userdetails: any;
    deletedImage = false;
    


constructor(
        private formBuilder: FormBuilder,
        public themeService: CustomizerSettingsService,
        private commonService: CommonService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        public userService: UserService,
        private encryptionService: EncryptionService,
        private statusService: StatusService,
        private authService: AuthService,
    ) {
        super();
        this.UsersForm = this.formBuilder.group({
            id: [''],
            name: ['', Validators.required],
            mobilenumber: ['', Validators.required],
            email: ['',  [Validators.required, Validators.email]],
            address: ['', Validators.required],
            status:['', Validators.required],
            usertype:['', Validators.required],
            logintype:[''],
            image: [''],
            password : ['', Validators.required]
        });
        this.themeService.isToggled$.subscribe((isToggled) => {
            this.isToggled = isToggled;
});

  this.columns = [
            {columnDef: 'ID',header: 'ID',cell: (element: any) => `${element?.id}`,},
            {columnDef: 'Name',header: 'Name',cell: (element: any) => `${element?.name}`,},
            {columnDef: 'Email',header: 'Email',cell: (element: any) => `${element?.email}`,},
            {columnDef: 'Mobile Number',header: 'Mobile Number',cell: (element: any) => `${element?.mobilenumber}`,},
            {columnDef: 'User Type',header: 'User Type',cell: (element: any) => `${element?.usertype}`,},
            {columnDef: 'UploadImage',header: 'Image',cell: (element: any) => `${element?.image}`},
            {columnDef: 'Status',header: 'Status',cell: (element: any) => `${element?.status}`,},

        ];

}


ngOnInit(): void {
    this.GetProfile();
    // this.getStatues();
    this.showUsersForm = true;

        this.userdetails = this.authService?.fetchUserDetails();

    this.bannersurl = this.router.url.includes('/app-admin');
        this.sendimgname=this.bannersurl ? 'App-Admin' : 'App Slider';
        console.log('checkbannerurl',this.bannersurl)
}

Toggleclass(value: any, mode: any) {
    this.formMode = mode;
    this.selectedRow = value;
    this.showBannerForm = true;

    if (mode === 'edit' || mode === 'view') {

        this.BannerEdit = value;

        this.Bannerurls = this.BannerEdit?.image
            ? [this.BannerEdit.image]
            : [];

        this.UsersForm.patchValue({
            id: this.BannerEdit.id || '--',
            name: this.BannerEdit.name || '--',
            email: this.BannerEdit.email || '--',
            mobilenumber: this.BannerEdit.mobilenumber || '--',
            address: this.BannerEdit.address || '--',
            usertype: this.BannerEdit.usertype || '--',
            image: this.BannerEdit.image || '--',
            password: this.BannerEdit.password || '--',
            status: this.BannerEdit.status || '--'
        });

        if (mode === 'view') {
            this.UsersForm.disable();
        } else {
            this.UsersForm.enable();
        }
    }

    if (mode === 'add') {
        this.UsersForm.reset();
        this.Bannerurls = [];
    }
}

GetProfile() {
  this.commonService.getApi('profile/all').subscribe(
    (res: any) => {

      console.log('API Response:', res);

      this.BannerEdit = res?.users || [];

      console.log('Table Data:', this.BannerEdit);

    },
    (error) => {
      console.error(error);
    }
  );
}

    closeUsersForm() {
        this.showUsersForm = false;
        this.formMode = '';
        this.selectedRow = null;
         this.UsersForm.enable();
    }

     closeBannerForm() {
        this.showBannerForm = false;
        this.formMode = '';
        this.selectedRow = null;
        this.Bannerurls = [];
        this.UsersForm.enable();
        this.UsersForm.reset();
    }

onImageReceived(event: any) {

    const file = Array.isArray(event) ? event[0] : event;

    if (file) {

        this.BannerImageFile = file;

        this.UsersForm.patchValue({
            image: file
        });

        console.log('Selected Image:', file);
    }
}

onDeleteImage(event: any) {

    this.Bannerurls = [];
    this.BannerImageFile = null;

    this.UsersForm.patchValue({
        image: ''
    });

    this.UsersForm.get('image')?.setValue('');

    console.log('Image Deleted');
}


SubmitUsersForm(form: FormGroup) {

  if (this.UsersForm.invalid) {
    this.UsersForm.markAllAsTouched();
    return;
  }

  const formData = new FormData();

  Object.keys(this.UsersForm.value).forEach((key: string) => {
    const value = this.UsersForm.value[key];

    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, value);
    }
  });

  const id = this.UsersForm.get('id')?.value;

  if (!id) {

    this.commonService.postApi('profile/add', formData).subscribe({
      next: (res: any) => {

        Swal.fire({
          title: 'Success',
          text: 'Profile Created Successfully',
          icon: 'success',
          showConfirmButton: false,
          timer: 2000
        });

        this.UsersForm.reset();
        // this.GetProfile();
        this.closeBannerForm();

      },
      error: (err) => {

        console.error(err);

        Swal.fire({
          title: 'Error',
          text: err?.error?.message || 'Profile Creation Failed',
          icon: 'error'
        });

      }
    });

  } else {

    this.commonService.putApi(`profile/update`, formData).subscribe({
      next: (res: any) => {

        Swal.fire({
          title: 'Success',
          text: 'Profile Updated Successfully',
          icon: 'success',
          showConfirmButton: false,
          timer: 2000
        });

        this.UsersForm.reset();
        // this.GetProfile();
        this.closeBannerForm();

      },
      error: (err) => {

        console.error(err);

        Swal.fire({
          title: 'Error',
          text: err?.error?.message || 'Profile Update Failed',
          icon: 'error'
        });

      }
    });

  }
}


}
