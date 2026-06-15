import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { CommonService } from '../../core/service/common.service';
import { EncryptionService } from '../../core/service/encryption.service';
import { UserService } from '../../core/service/user.service';
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
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

export enum LoggedAsList {
  Admin      = 'Admin',
  Dealer     = 'Dealer',
  Reseller   = 'Reseller',
  Student    = 'Student',
  Advertiser = 'Advertiser',
  AppAdmin   = 'AppAdmin',
}

/** Per-type field visibility config */
const USER_TYPE_CONFIG: Record<string, {
  showDOB: boolean;
  showGender: boolean;
  showReferralCode: boolean;
  showAadhar: boolean;
  showAddress: boolean;
}> = {
  Admin:      { showDOB: false, showGender: false, showReferralCode: false, showAadhar: true,  showAddress: true  },
  AppAdmin:   { showDOB: false, showGender: false, showReferralCode: false, showAadhar: false, showAddress: false },
  Dealer:     { showDOB: false, showGender: false, showReferralCode: true,  showAadhar: true,  showAddress: true  },
  Reseller:   { showDOB: false, showGender: false, showReferralCode: true,  showAadhar: true,  showAddress: true  },
  Student:    { showDOB: true,  showGender: true,  showReferralCode: true,  showAadhar: false, showAddress: false },
  Advertiser: { showDOB: false, showGender: false, showReferralCode: false, showAadhar: false, showAddress: true  },
};

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableComponent,
    MatCard,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatOption,
    MatSelectModule,
    MatCheckboxModule,
    MatIcon,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent extends Utils implements OnInit {
  @ViewChild('mattablechild') mattablechild!: MatTableComponent;
  @Input() userType: string = LoggedAsList.Admin;
@Input() filterOptions: string[] = ['All'];
@Input() action: any = { add: true, edit: true, view: true };
  CompanyId: any;
  isToggled: any;
  // action = { add: true, edit: true, view: true };
  columns: any[] = [];
  formMode: 'add' | 'edit' | 'view' | '' = '';
  showUsersForm = false;
  UsersForm!: FormGroup;
  selectedRow: any = null;
  statuses: any[] = [];
  UsersEdit: any;

  get pageLabel(): string {
    return this.userType;
  }

  get typeConfig() {
    return USER_TYPE_CONFIG[this.userType] ?? USER_TYPE_CONFIG['Admin'];
  }

  get formTitle(): string {
    const action = this.formMode === 'add' ? 'Add'
                 : this.formMode === 'edit' ? 'Edit'
                 : 'View';
    return `${action} ${this.pageLabel}`;
  }

  constructor(
    private formBuilder: FormBuilder,
    public  themeService: CustomizerSettingsService,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    public  userService: UserService,
    private encryptionService: EncryptionService,
    private statusService: StatusService,
  ) {
    super();

    this.buildForm();

    this.themeService.isToggled$.subscribe(v => (this.isToggled = v));

    this.activatedRoute.queryParams.subscribe(params => {
      const encryptedData = params['data'];
      this.CompanyId = params['company_id'] || 0;
      if (encryptedData) {
        const decryptedObj = this.encryptionService.decrypt(encryptedData);
        this.CompanyId = decryptedObj.company_id || 0;
      }
    });
  }

  ngOnInit(): void {
    this.buildColumns();
    this.applyFieldValidators();
    this.getStatuses();
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  private buildForm(): void {
    this.UsersForm = this.formBuilder.group({
      Id:           [''],
      FirstName:    ['', [Validators.required, Validators.minLength(2)]],
      LastName:     [''],
      MobileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      Email:        ['', [Validators.required, Validators.email]],
      Password:     [''],
      Address:      [''],
      AadharNumber: [''],
      ReferralCode: [''],
      DOB:          [''],
      Gender:       [''],
      UserType:     [''],
      StatusId:     ['', Validators.required],
    });
  }

  private applyFieldValidators(): void {
    const cfg = this.typeConfig;
    this.setValidator('ReferralCode', cfg.showReferralCode ? Validators.required : null);
    this.setValidator('AadharNumber', cfg.showAadhar
      ? [Validators.required, Validators.minLength(12), Validators.maxLength(12)]
      : null);
    this.setValidator('DOB',    cfg.showDOB    ? Validators.required : null);
    this.setValidator('Gender', cfg.showGender ? Validators.required : null);
  }

  private setValidator(field: string, validator: any): void {
    const ctrl = this.UsersForm.get(field);
    if (!ctrl) return;
    ctrl.clearValidators();
    if (validator) ctrl.setValidators(validator);
    ctrl.updateValueAndValidity();
  }

  // ── Columns ───────────────────────────────────────────────────────────────
  private buildColumns(): void {
    const base: any[] = [
      { columnDef: 'ID',          header: 'S No',         cell: (e: any) => `${e?.Id}` },
      { columnDef: 'Name',        header: 'Name',         cell: (e: any) => `${e.FirstName || ''} ${e.LastName || ''}` },
      { columnDef: 'Mobile',      header: 'Mobile',       cell: (e: any) => `${e.MobileNumber || ''}` },
        // ── Age column (calculated from DOB) ──────────────────────
    ...(this.userType === 'Student' ? [{
      columnDef: 'Age',
      header: 'Age',
      cell: (e: any) => {
        if (!e.DOB) return '--';
        const dob = new Date(e.DOB);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        return `${age}`;
      }
    }] : []),
    // ── Gender column (Student only) ──────────────────────────
    ...(this.typeConfig.showGender ? [{
      columnDef: 'Gender',
      header: 'Gender',
      cell: (e: any) => `${e.Gender || '--'}`
    }] : []),
      { columnDef: 'CreatedDate', header: 'Created Date', cell: (e: any) => `${this.datePipe.transform(e.CreatedAt, 'MMM dd, yyyy') || ''}` },
      { columnDef: 'Status',      header: 'Status',       cell: (e: any) => `${e.StatusName || ''}` },
    ];

    if (this.typeConfig.showReferralCode) {
      base.splice(1, 0, {
        columnDef: 'ReferralCode',
        header:    'Referral Code',
        cell:      (e: any) => `${e?.ReferralCode || ''}`,
      });
    }

    this.columns = base;
  }

  // ── Statuses ──────────────────────────────────────────────────────────────
  getStatuses(): void {
    this.statuses = this.statusService.getStatus('COMMON');
  }

  // ── Toggle Form ───────────────────────────────────────────────────────────
  Toggleclass(value: any, mode: 'add' | 'edit' | 'view'): void {
    this.formMode      = mode;
    this.showUsersForm = true;
    this.selectedRow   = value;

    const passwordCtrl = this.UsersForm.get('Password');

    if (mode === 'add') {
      this.UsersForm.enable();
      this.UsersForm.reset();
      passwordCtrl?.setValidators([Validators.required, Validators.minLength(8)]);
      passwordCtrl?.updateValueAndValidity();
      return;
    }

    // edit / view
    passwordCtrl?.clearValidators();
    passwordCtrl?.updateValueAndValidity();

    this.commonService.getApi(`User/Detail/${value?.Id}`, {}).subscribe((res: any) => {
      this.UsersEdit = res.data;
      this.UsersForm.patchValue({ ...this.UsersEdit, Password: '' });

      setTimeout(() => {
        if (this.UsersEdit?.ReferralCode) {
          this.UsersForm.get('ReferralCode')?.disable();
        }
        if (mode === 'view') {
          this.UsersForm.disable();
        }
      }, 300);
    });
  }

  closeUsersForm(): void {
    this.showUsersForm = false;
    this.formMode      = '';
    this.selectedRow   = null;
    this.UsersForm.enable();
    this.UsersForm.reset();
  }

  onDelete(element: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this student?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#602F80',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.commonService.deleteApi(`User/${element?.Id}`).subscribe({
          next: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Student deleted successfully.',
              icon: 'success',
              confirmButtonColor: '#602F80'
            });
            this.mattablechild.getData();
          },
          error: (err) => {
            const errorMessage = err?.error?.message || 'Delete failed. Please try again.';
            Swal.fire({
              title: 'Error!',
              text: errorMessage,
              icon: 'error',
              confirmButtonColor: '#602F80'
            });
            console.error('Delete failed:', err);
          }
        });
      }
    });
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  SubmitUsersForm(form: FormGroup): void {
    form.patchValue({ UserType: this.userType });

    if (!form.valid) {
      this.validateAllFormFields(form);
      return;
    }

    const formData = new FormData();
    const raw = form.getRawValue();          // includes disabled fields (e.g. ReferralCode)

    for (const key in raw) {
      const value = raw[key];
      if (value === null || value === undefined || value === '') continue;
      formData.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
    }

    this.formDataSubmit(
      this.selectedRow?.Id,
      formData,
      'User',
      'User',
      {
        formInitialValues: this.formInitialValues,
        commonService:     this.commonService,
        router:            this.router,
      },
    ).then(() => this.closeUsersForm());
  }

  override numericOnly(event: KeyboardEvent): boolean {
    return /[0-9]/.test(event.key);
  }
}