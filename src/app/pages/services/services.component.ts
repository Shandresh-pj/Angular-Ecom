import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Utils } from '../../utils';
import { MatTableComponent } from '../../shared/mat-table/mat-table.component';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/service/auth.service';
import { CommonService } from '../../core/service/common.service';
import { EncryptionService } from '../../core/service/encryption.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { QuillComponent } from '../../shared/quill/quill.component';
import { FileuploadComponent } from '../../shared/fileupload/fileupload.component';
import { environment } from '../../../environments/environment';
import { DatePipe, DecimalPipe } from '@angular/common'; // ✅ சேர்க்கணும்
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-service',
  standalone: true,
  imports: [
    MatTableComponent, MatCard, MatIcon, MatFormField, MatInput,
    ReactiveFormsModule, MatLabel, QuillComponent, FileuploadComponent,
    MatSelect, MatOption,
    DatePipe, DecimalPipe,     TranslateModule,
  ],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class ServicesComponent extends Utils implements OnInit {

  CompanyId: any;
  isToggled: any;
// ✅ இதுவே correct — மாத்தாதீங்க
public action = { add: true, edit: true, view: true, submissions: true };
  GetAges: any;
  columns: any;
  showServiceForm = false;
  serviceForm!: FormGroup;
  formMode: any;
  serviceUrls: any[] = [];
  serviceImageFile: any;
  serviceFileName: any;
  deletedImage = false;

  // ✅ புதிய properties சேர்க்கணும்
  showDetailView = false;
  serviceDetail: any = null;
  recentClaims: any[] = [];
  environment = environment;

  statusOptions = ['Active', 'Inactive', 'Completed'];
  durationOptions = ['7 Days', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days', '120 Days'];
  category: any;

  claimsTableUrl = '';
claimsColumns: any[] = [
  {
    columnDef: 'StudentName',
    header: 'Student Name',
    cell: (e: any) => e?.StudentName || '—'
  },
  {
    columnDef: 'PhoneNumber',
    header: 'Phone Number',
    cell: (e: any) => e?.PhoneNumber || '—'
  },
  {
    columnDef: 'PointsUsed',
    header: 'Points Used',
    cell: (e: any) => e?.PointsUsed ? `${e.PointsUsed} pts` : '0'
  },
  {
    columnDef: 'Status',
    header: 'Status',
    cell: (e: any) => e?.Status || '—'
  },
  {
    columnDef: 'ClaimedAt',
    header: 'Claimed Date',
    cell: (e: any) => e?.ClaimedAt
      ? new Date(e.ClaimedAt).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        })
      : '—'
  },
];

// ✅ no action buttons needed in claims table
claimsAction = { add: false, edit: false, view: false, delete: false, submissions: false };

  constructor(
    private formBuilder: FormBuilder,
    public themeService: CustomizerSettingsService,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private encryptionService: EncryptionService,
    private translate:TranslateService
  ) {
    super();
    this.serviceForm = this.formBuilder.group({
      Id:                   [''],
      Name:                 ['', Validators.required],
      Description:          [''],
      Email:                ['', Validators.email],
      PhoneNumber:          [''],
      WhatsAppNumber:       [''],
      Location:             ['', Validators.required],
      GoogleMapLocationLink:[''],
      CategoryId:           ['', Validators.required],
      ScorePoint:           ['', Validators.required],
      CourseDuration:       ['', Validators.required],
      Instructions:         [''],
      AgeId:        ['',  Validators.required],
      Gender:        ['',  Validators.required],
      // Status:               ['Active'],
      UploadImage:          [''],
    });

    this.themeService.isToggled$.subscribe(t => this.isToggled = t);

    this.columns = [
      { columnDef: 'ID',          header: 'ID',       cell: (e: any) => e?.Id },
      { columnDef: 'Name',        header: 'Name',     cell: (e: any) => e?.Name },
      { columnDef: 'Location',    header: 'Location', cell: (e: any) => e?.Location || '-' },
      { columnDef: 'ScorePoint',  header: 'Points',   cell: (e: any) => e?.ScorePoint ? `${e.ScorePoint} pts` : '-' },
      { columnDef: 'CourseDuration', header: 'Duration', cell: (e: any) => e?.CourseDuration || '-' },
      {
        columnDef: 'StatusToggle',
        header: 'Status',
        cell: (element: any) => element?.Status,
        statusOn:  'APPROVED',              // checked  = Approved
        statusOff: 'ACTIVE',               // unchecked = Active
        toggleUrl: 'Service/Update',  // ← this now gets picked up correctly
      },
      { columnDef: 'TotalClaims', header: 'Claims',   cell: (e: any) => e?.TotalClaims },
      { columnDef: 'UploadImage', header: 'Image',    cell: (e: any) => e?.UploadImage },
    ];
  }

  ngOnInit(): void {
    this.getCategory();
    this.getMasterData();
  }

  getMasterData(): void {
    this.commonService.getApi('MasterData/All', {}).subscribe({
        next: (res: any) => {
            const responseData = Array.isArray(res?.data?.data) ? res.data.data : [];

            // this.GetViews = responseData.filter((item: any) => item.MasterType === 'Views');
            this.GetAges = responseData.filter((item: any) => item.MasterType === 'Age');

        },
        error: (err) => {
            console.error('Error fetching rental location data:', err);
        },
    });
}

  getCategory() {
    const params = { Feature: 'true', All: 'true', Type: 'Service' };
    this.commonService.getApi('Category/All', params).subscribe((res: any) => {
      this.category = res?.data?.data.map((item: any) => ({
        ...item,
        Name: item?.CategoryTranslations?.[0]?.Name
      }));
    });
  }

  Toggleclass(value: any, mode: any) {
    this.formMode = mode;

    // ✅ submissions click — Detail & Usage panel காட்டும்
    if (mode === 'submissions') {
      this.showServiceForm = false;
      this.showDetailView = true;
      this.loadServiceDetail(value?.Id);
      return;
    }

    this.showServiceForm = true;
    this.showDetailView = false;

    if (mode === 'edit' || mode === 'view') {
      this.commonService.getApi(`Service/Detail/${value?.Id}`, {}).subscribe((res: any) => {
        const svc = res?.data?.data?.[0];
        const img = svc?.UploadImage?.trim() || '';
        this.serviceUrls = img ? [`${environment.domain}/${img.replace(/\\/g, '/')}`] : [];
        this.serviceImageFile = null;
        this.serviceForm.patchValue({ ...svc });
      });
      if (mode === 'view') this.serviceForm.disable();
    } else if (mode === 'add') {
      this.serviceForm.reset({ Status: 'Active' });
      this.serviceUrls = [];
      this.serviceImageFile = null;
      this.serviceFileName = '';
    }
  }

  // ✅ புதிய method — detail + recent claims load
  loadServiceDetail(id: number) {
    this.serviceDetail = null;
    this.recentClaims = [];
    this.claimsTableUrl = `Service/Claims/${id}`;
    this.commonService.getApi(`Service/Detail/${id}`, {}).subscribe((res: any) => {
      this.serviceDetail = res?.data?.data?.[0];
    });

    this.commonService.getApi(`Service/Claims/${id}`, { page: 1, limit: 5 }).subscribe((res: any) => {
      this.recentClaims = res?.data?.data || [];
    });
  }

  // ✅ Detail panel-ல் Edit button
  editFromDetail() {
    const id = this.serviceDetail?.Id;
    this.showDetailView = false;
    this.serviceDetail = null;
    this.recentClaims = [];
    this.Toggleclass({ Id: id }, 'edit');
  }

  // ✅ Detail panel close
  closeDetailView() {
    this.showDetailView = false;
    this.serviceDetail = null;
    this.recentClaims = [];
    this.formMode = '';
  }

  // ✅ View All Claims button
  viewAllClaims() {
    this.router.navigate(['/service-claims'], {
      queryParams: { serviceId: this.serviceDetail?.Id }
    });
  }

  // Category name helper
  getCategoryName(id: number): string {
    return this.category?.find((c: any) => c.Id === id)?.Name || '—';
  }

  onImageReceived(file: any) {
    this.serviceImageFile = file;
    this.deletedImage = false;
  }

  onDeleteImage(flag: boolean) {
    this.deletedImage = flag;
    if (flag) this.serviceImageFile = null;
  }

  updateDescription(value: string) {
    this.serviceForm.patchValue({ Description: value });
  }

  updateInstructions(value: string): void {
    this.serviceForm.patchValue({ Instructions: value });
  }

  SubmitServiceForm(form: FormGroup) {
    if (form.valid) {
      const formData = new FormData();
      if (this.serviceImageFile) formData.append('UploadImage', this.serviceImageFile);
      if (this.deletedImage)      formData.append('UploadImage', '');

      ['Name','Description','Email','PhoneNumber','WhatsAppNumber',
       'Location','GoogleMapLocationLink','CategoryId','ScorePoint',
       'CourseDuration','Instructions','AgeId','Gender'].forEach(key => {
        formData.append(key, form.value[key] ?? '');
      });

      this.formDataSubmit(
        form.value.Id, formData, this.serviceForm, 'Service',
        { redirect: '/services', formInitialValues: {}, commonService: this.commonService, router: this.router },
      ).then(() => this.closeServiceForm());
    } else {
      this.validateAllFormFields(form);
    }
  }

  closeServiceForm() {
    this.showServiceForm = false;
    this.showDetailView = false;
    this.formMode = '';
    this.serviceUrls = [];
    this.serviceForm.enable();
    this.serviceForm.reset({ Status: 'Active' });
  }
}