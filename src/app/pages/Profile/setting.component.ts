
import {Component, OnInit } from '@angular/core';
import {FormBuilder,FormGroup,ReactiveFormsModule,Validators,} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../core/service/common.service';
import { EncryptionService } from '../../core/service/encryption.service';
import { UserService } from '../../core/service/user.service';
import { AuthService } from '../../core/service/auth.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { Utils } from '../../utils';
import { MatTableComponent } from '../../shared/mat-table/mat-table.component';
import { MatCard } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StatusService } from '../../core/service/status.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-setting',
    standalone: true,
    imports: [MatTableComponent,MatCard,MatFormField,MatInput,MatLabel,ReactiveFormsModule,
        MatOption,MatSelectModule,MatCheckboxModule,MatIcon],
    templateUrl: './setting.component.html',
    styleUrl: './setting.component.scss',
})
export class SettingComponent extends Utils implements OnInit {
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
    userId: any;
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
            address: [''],
            status:[''],
            usertype:[''],
            logintype:[''],
            image: ['']
        });
        this.themeService.isToggled$.subscribe((isToggled) => {
            this.isToggled = isToggled;
        });

        this.activatedRoute.queryParams.subscribe((params) => {
            const encryptedData = params['data'];
            this.CompanyId = params['company_id'] || 0;
            if (encryptedData) {
                const decryptedObj =
                    this.encryptionService.decrypt(encryptedData);
                console.log('Decrypted Params:', decryptedObj);
                this.CompanyId = decryptedObj.company_id || 0;
            }
        });

        this.columns = [
            {columnDef: 'ID',header: 'S No',cell: (element: any) => `${element?.Id}`},
            {columnDef: 'UserId',header: 'User Id',cell: (element: any) => `${element?.ReferralCode}`},
            {columnDef: 'Name',header: 'Name',cell: (element: any) =>`${element.FirstName || ''} ${element.LastName || ''}`},
            {columnDef: 'Mobile',header: 'Mobile',cell: (element: any) => `${element.MobileNumber || ''}`},
            {columnDef: 'CreatedDate',header: 'Created Date',cell: (element: any) =>
                    `${this.datePipe.transform(element.CreatedAt, 'MMM dd, yyyy') || ''}`},
            {columnDef: 'Status',header: 'Status',cell: (element: any) => `${element.StatusName || ''}`},
        ];
    }

    ngOnInit(): void {
    this.GetProfile();
    // this.getStatues();
    this.showUsersForm = true;
}

GetProfile() {
    this.userId = this.authService.fetchUserDetails()?.user?.id;
    if (!this.userId) {
        return;
    }

    this.commonService
        .getApi(`profile/${this.userId}`)
        .subscribe((res: any) => {

            const profile = res?.data || res?.user || res;

                this.UsersForm.patchValue({
                    id: profile?.id || '',
                    name: profile?.name || '',
                    email: profile?.email || '',
                    mobilenumber: profile?.mobilenumber || '',
                    address: profile?.address || '',
                    usertype: profile?.usertype || 'Super Admin',
                    status: profile?.status || '',
                    image: profile?.image || ''
                });

                // Set image preview
                if (profile?.image) {
                    this.imagePreview = profile.image.startsWith('http')
                        ? profile.image
                        : `${environment.domain.replace('/api', '')}${profile.image}`;
                } else {
                    this.imagePreview = 'Logo/admin.png';
                }

                console.log("Profile Loaded:", this.UsersForm.value);
        },
        (error) => {
            console.error(error);
        });
}

    closeUsersForm() {
        this.showUsersForm = false;
        this.formMode = '';
        this.selectedRow = null;
        this.UsersForm.enable();
        this.router.navigate(['/dashboard']);
    }

SubmitUsersForm() {
    if (!this.userId) {
        return;
    }

    const formData = new FormData();
    const formValue = this.UsersForm.value;
    const allowedFields = ['name', 'email', 'mobilenumber', 'address', 'usertype', 'status'];

    allowedFields.forEach((key: string) => {
        const value = formValue[key];
        if (value !== null && value !== undefined) {
            formData.append(key, value);
        }
    });

    if (formValue.image instanceof File) {
        formData.append('image', formValue.image);
    }

    this.commonService.putApi(`profile/${this.userId}`, formData).subscribe({
        next: (res: any) => {
            this.userService.notifyProfileUpdated();
            Swal.fire({
                title: 'Success',
                text: 'Profile Updated Successfully',
                icon: 'success'
            }).then(() => {
                this.router.navigate(['/dashboard']);
            });
        },
        error: (err) => {
            Swal.fire({
                title: 'Error',
                text: 'Profile Update Failed',
                icon: 'error'
            });
            console.error(err);
        }
    });
}



onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    if (!file.type.startsWith('image/')) {
        Swal.fire({
            title: 'Invalid File',
            text: 'Please select a valid image file',
            icon: 'error'
        });
        event.target.value = '';
        return;
    }

    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
        Swal.fire({
            title: 'File Too Large',
            text: 'Image size should not exceed 2 MB',
            icon: 'error'
        });
        event.target.value = '';
        return;
    }

    this.UsersForm.patchValue({ image: file });

    const reader = new FileReader();
    reader.onload = () => {
        this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
}

}