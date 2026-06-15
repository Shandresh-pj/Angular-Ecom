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
  selector: 'app-e-com-products',
  standalone: true,
  imports: [MatTableComponent, MatCard, MatFormField, MatInput, MatLabel, ReactiveFormsModule,
    MatOption, MatSelectModule, MatCheckboxModule, MatIcon, ReactiveFormsModule, FileuploadComponent, QuillComponent],
  templateUrl: './e-com-products.component.html',
  styleUrl: './e-com-products.component.scss'
})
export class EComProductsComponent extends Utils implements OnInit{

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
    BannerfileName: any;
    companycode :any;
    userdetails: any;
    deletedImage = false;
    page = 1;
limit = 10;
totalRecords = 0;

BannerImageFile: File | null = null;
BannerImagesFiles: File[] = [];

Bannerurls: string[] = [];
BannerMultiUrls: string[] = [];
    


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
            price: ['', Validators.required],
            description: ['',  Validators.required],
            barcode: [''],
            image: ['', Validators.required],
            images: [[], Validators.required],
            register_id : ['']
        });
        this.themeService.isToggled$.subscribe((isToggled) => {
            this.isToggled = isToggled;
});

  this.columns = [
            {columnDef: 'ID',header: 'ID',cell: (element: any) => `${element?.id}`,},
            {columnDef: 'Name',header: 'Name',cell: (element: any) => `${element?.name}`,},
            {columnDef: 'Price',header: 'Price',cell: (element: any) => `${element?.price}`,},
            {columnDef: 'Barcode',header: 'Barcode',cell: (element: any) => `${element?.barcode}`,},
            // {columnDef: 'Description',header: 'Description',cell: (element: any) => `${element?.description}`,},
            {columnDef: 'UploadImage',header: 'Image',cell: (element: any) => `${element?.image}`},
            // {columnDef: 'Status',header: 'Status',cell: (element: any) => `${element?.status}`,},

        ];

}


ngOnInit(): void {
    this.GetProfile();
    // this.getStatues();
    this.showUsersForm = true;

        this.userdetails = this.authService?.fetchUserDetails();
        console.log('userdetails', this.userdetails);

    this.bannersurl = this.router.url.includes('/e-products');
        this.sendimgname=this.bannersurl ? 'Products' : 'App Slider';
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

        this.BannerMultiUrls = this.BannerEdit?.images ? this.BannerEdit.images : [];
        this.UsersForm.patchValue({
            id: this.BannerEdit?.id || '--',
            name: this.BannerEdit?.name || '--',
            price: this.BannerEdit?.price || '--',
            description: this.BannerEdit?.description || '--',
            barcode: this.BannerEdit?.barcode || '--',
            image: this.BannerEdit?.image || '--',
            images: this.BannerEdit?.images || [],
            register_id: this.userdetails?.id || '--'
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

  this.commonService
    .getApi(`products?page=${this.page}&limit=${this.limit}`)
    .subscribe(
      (res: any) => {

        console.log('API Response:', res);

        this.BannerEdit = res?.products || [];

        this.totalRecords =
          res?.pagination?.totalRecords || 0;

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

onSingleImageReceived(event: any): void {

    const file = Array.isArray(event)
        ? event[0]
        : event;

    if (file) {

        this.BannerImageFile = file;

        this.UsersForm.patchValue({
            image: file
        });

        this.UsersForm.get('image')?.updateValueAndValidity();

        console.log('Single Image Selected:', file);

    }

}

onSingleImageDelete(): void {

    this.Bannerurls = [];
    this.BannerImageFile = null;

    this.UsersForm.patchValue({
        image: ''
    });

    this.UsersForm.get('image')?.updateValueAndValidity();

}

onMultipleImagesReceived(event: any): void {

    const files = Array.isArray(event)
        ? event
        : [event];

    this.BannerImagesFiles = files;

    this.UsersForm.patchValue({
        images: files
    });

    this.UsersForm.get('images')?.updateValueAndValidity();

    console.log('Multiple Images Selected:', files);

}

onMultipleImageDelete(): void {

    this.BannerMultiUrls = [];
    this.BannerImagesFiles = [];

    this.UsersForm.patchValue({
        images: []
    });

    this.UsersForm.get('images')?.updateValueAndValidity();

}

SubmitUsersForm(form: FormGroup): void {

    if (this.UsersForm.invalid) {

        this.UsersForm.markAllAsTouched();

        return;

    }
    this.UsersForm.patchValue({
         register_id: this.userdetails?.id || '--'
    });

    console.log('register_idddddddd', this.UsersForm.get('register_id')?.value);


    const formData = new FormData();

    // Normal Fields
    formData.append(
        'name',
        this.UsersForm.get('name')?.value
    );

    formData.append(
        'price',
        this.UsersForm.get('price')?.value
    );

    formData.append(
        'description',
        this.UsersForm.get('description')?.value
    );

    formData.append(
        'barcode',
        this.UsersForm.get('barcode')?.value || ''
    );

    

    // Single Image
    if (this.BannerImageFile) {

        formData.append(
            'image',
            this.BannerImageFile
        );

    }

    // Multiple Images
    if (this.BannerImagesFiles.length) {

        this.BannerImagesFiles.forEach(file => {

            formData.append(
                'images',
                file
            );

        });

    }

    const id = this.UsersForm.get('id')?.value;

    // CREATE
    if (!id) {

        this.commonService
            .postApi('products/add', formData)
            .subscribe({

                next: (res: any) => {

                    Swal.fire({
                        title: 'Success',
                        text: 'Product Created Successfully',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 2000
                    });

                    this.UsersForm.reset();

                    this.BannerImageFile = null;
                    this.BannerImagesFiles = [];

                    this.Bannerurls = [];
                    this.BannerMultiUrls = [];

                    this.closeBannerForm();

                },

                error: (err) => {

                    console.error(err);

                    Swal.fire({
                        title: 'Error',
                        text:
                            err?.error?.message ||
                            'Product Creation Failed',
                        icon: 'error'
                    });

                }

            });

    }

    // UPDATE
    else {

        this.commonService
            .putApi(`products/${id}`, formData)
            .subscribe({

                next: (res: any) => {

                    Swal.fire({
                        title: 'Success',
                        text: 'Product Updated Successfully',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 2000
                    });

                    this.UsersForm.reset();

                    this.BannerImageFile = null;
                    this.BannerImagesFiles = [];

                    this.Bannerurls = [];
                    this.BannerMultiUrls = [];

                    this.closeBannerForm();

                },

                error: (err) => {

                    console.error(err);

                    Swal.fire({
                        title: 'Error',
                        text:
                            err?.error?.message ||
                            'Product Update Failed',
                        icon: 'error'
                    });

                }

            });

    }

}


}
