
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
            Id: [''],
            FirstName: ['', Validators.required],
            LastName: [''],
            MobileNumber: ['', Validators.required],
            Email: ['',  [Validators.required, Validators.email]],
            Address: [''],
            UserType: ['Admin'],
            Facebook: [''],
            Twitter:[''],
            Gplus: [''],
            MetaKeywords:[''],
            MetaDescription:[''],
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
    this.getStatues();
    this.showUsersForm = true;

    this.commonService
        .getApi('profile')
        .subscribe((res: any) => {
            const profile = res?.user || res?.data || res;
            if (profile) {
                const nameParts = (profile.name || '').trim().split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                this.UsersEdit = {
                    Id: profile.id || profile.Id,
                    FirstName: firstName,
                    LastName: lastName,
                    Email: profile.email || profile.Email,
                    MobileNumber: profile.mobilenumber || profile.MobileNumber,
                    Address: profile.address || profile.Address,
                    UserType: profile.usertype || profile.UserType || 'Admin'
                };

                this.UsersForm.patchValue({
                    ...this.UsersEdit
                });
            }
        });
}
    getStatues() {
        this.statuses = this.statusService.getStatus('COMMON');
        console.log('checkstatus', this.statuses);
    }
    closeUsersForm() {
        this.showUsersForm = false;
        this.formMode = '';
        this.selectedRow = null;
         this.UsersForm.enable();
    }

   SubmitUsersForm() {

    this.UsersForm.patchValue({
        UserType: 'Admin'
    });

    if (this.UsersForm.invalid) {
        console.log("Form invalid");
        return;
    }

    const formVal = this.UsersForm.value;
    const payload = {
        name: `${formVal.FirstName || ''} ${formVal.LastName || ''}`.trim(),
        email: formVal.Email,
        mobilenumber: formVal.MobileNumber,
        address: formVal.Address
    };

    console.log("Sending payload", payload);

    this.commonService.putApi('profile/update', payload)
        .subscribe(
            (res: any) => {
                if (res?.status === 200 || res?.success === true) {
                    console.log("Profile updated successfully", res);
                    this.closeUsersForm();
                } else {
                    console.log("Update failed", res);
                }
            },
            (err) => {
                console.error("API Error", err);
            }
        );
    }
}