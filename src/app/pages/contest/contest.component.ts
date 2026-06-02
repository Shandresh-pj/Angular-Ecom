import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Utils } from '../../utils';
import { MatTableComponent } from '../../shared/mat-table/mat-table.component';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/service/auth.service';
import { CommonService } from '../../core/service/common.service';
import { EncryptionService } from '../../core/service/encryption.service';
import { UserService } from '../../core/service/user.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { QuillComponent } from '../../shared/quill/quill.component';
import { FileuploadComponent } from '../../shared/fileupload/fileupload.component';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ContestSubmissionComponent } from '../contest-submission/contest-submission.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contest',
  standalone: true,
  imports: [
    MatTableComponent, MatCard, MatFormField, MatInput,
    ReactiveFormsModule, MatLabel, QuillComponent,
    FileuploadComponent, MatSelect, MatOption,
    CommonModule, MatIcon, TranslateModule, ContestSubmissionComponent
  ],
  templateUrl: './contest.component.html',
  styleUrl: './contest.component.scss',
})
export class ContestComponent extends Utils implements OnInit {

  @ViewChild('mattablechild') mattablechild: any;
  ageGroups: any[] = [];
  CompanyId: any;
  isToggled: any;
  category: any;
  // ── Table config ────────────────────────────────────────────────
  public action = { add: true, edit: true, view: true, delete: true, submissions: true };
  columns: any;

  // ── Contest form ────────────────────────────────────────────────
  showContestForm = false;
  contestForm!: FormGroup;
  formMode: 'add' | 'edit' | 'view' = 'add';

  bannerImageUrls: any[] = [];
  bannerImageFile: any   = null;
  deletedImage           = false;

  // ── Submissions ──────────────────────────────────────────────────
  showSubmissions  = false;
  selectedContest: any = null;

  // ── Dropdown options ─────────────────────────────────────────────
  contestTypes       = ['Image', 'Video', 'Audio', 'Text'];
  competitionTypes   = ['Individual', 'Team'];
  contestStatuses    = ['Upcoming', 'Active', 'Completed'];

  // ──────────────────────────────────────────────────────────────────
  constructor(
    private formBuilder:       FormBuilder,
    public  themeService:      CustomizerSettingsService,
    private commonService:     CommonService,
    private activatedRoute:    ActivatedRoute,
    private authService:       AuthService,
    private cdr:               ChangeDetectorRef,
    private router:            Router,
    public  userService:       UserService,
    private encryptionService: EncryptionService,
  ) {
    super();

    // Build contest form
    this.contestForm = this.formBuilder.group({
      Id:                   [''],
      Title:                ['', Validators.required],
      Description:          [''],
      Instructions:         [''],
      SponsorId:            [''],
      SponsorName:          [''],
      AgeId:        ['',  Validators.required],
      Gender:        ['',  Validators.required],
      Type:                 ['', Validators.required],
      CategoryId:           ['', Validators.required],
      // CompetitionType:      ['', Validators.required],
      ParticipantSetPoints: ['', Validators.required],
      FirstPrizePoints:     [null, [Validators.required, Validators.min(1)]],
      SecondPrizePoints:    [null, [Validators.required, Validators.min(1)]],
      ThirdPrizePoints:     [null, [Validators.required, Validators.min(1)]],
      StartDate:            ['', Validators.required],
      EndDate:              ['', Validators.required],
      Duration:             [''],
      Status:               ['Upcoming'],
      BannerImage:          [''],
    });

    this.themeService.isToggled$.subscribe(t => (this.isToggled = t));

    this.activatedRoute.queryParams.subscribe(params => {
      this.CompanyId = params['company_id'] || 0;
      const encryptedData = params['data'];
      if (encryptedData) {
        const decryptedObj = this.encryptionService.decrypt(encryptedData);
        this.CompanyId = decryptedObj.company_id || 0;
      }
    });

    // Table columns
    this.columns = [
      {
        columnDef: 'Title',
        header:    'Title',
        cell:      (e: any) => `${e?.Title ?? ''}`,
      },
      {
        columnDef: 'Type',
        header:    'Type',
        cell:      (e: any) => `${e?.Type ?? ''}`,
      },
      // {
      //   columnDef: 'CompetitionType',
      //   header:    'Competition',
      //   cell:      (e: any) => `${e?.CompetitionType ?? ''}`,
      // },
      // {
      //   columnDef: 'TotalPoints',
      //   header:    'Total Points',
      //   cell:      (e: any) => `${e?.TotalPoints ?? 0}`,
      // },
      {
        columnDef: 'SubmissionCount',
        header:    'Submissions',
        cell:      (e: any) => `${e?.SubmissionCount ?? 0}`,
      },
      {
        columnDef: 'StartDate',
        header:    'Start Date',
        cell:      (e: any) =>
          e?.StartDate
            ? new Date(e.StartDate).toLocaleString('en-IN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true,
              })
            : '',
      },
      {
        columnDef: 'EndDate',
        header:    'End Date',
        cell:      (e: any) =>
          e?.EndDate
            ? new Date(e.EndDate).toLocaleString('en-IN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true,
              })
            : '',
      },
      {
        columnDef: 'Status',
        header:    'Status',
        cell:      (e: any) => `${e?.Status ?? ''}`,
      },
    ];
  }

  ngOnInit(): void {
    this.contestForm.get('StartDate')?.valueChanges.subscribe(() => {
      this.calculateDuration();
    });
  
    this.contestForm.get('EndDate')?.valueChanges.subscribe(() => {
      this.calculateDuration();
    });

    this.loadAgeGroups()
    this.getCategory()
  }

  getCategory() {
    const params = { Feature: 'true', All: 'true', Type: 'Contest' };
    this.commonService.getApi('Category/All', params).subscribe((res: any) => {
      this.category = res?.data?.data.map((item: any) => ({
        ...item,
        Name: item?.CategoryTranslations?.[0]?.Name
      }));
    });
  }

  calculateDuration(): void {
    const start = this.contestForm.get('StartDate')?.value;
    const end = this.contestForm.get('EndDate')?.value;
  
    if (!start || !end) {
      this.contestForm.patchValue(
        { Duration: '' },
        { emitEvent: false }
      );
      return;
    }
  
    const startDate = new Date(start);
    const endDate = new Date(end);
  
    if (endDate <= startDate) {
      this.contestForm.patchValue(
        { Duration: '' },
        { emitEvent: false }
      );
      return;
    }
  
    const diffMs = endDate.getTime() - startDate.getTime();
  
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
  
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;
  
    let durationText = '';
  
    if (days > 0) {
      durationText += `${days} day${days > 1 ? 's' : ''} `;
    }
  
    if (hours > 0) {
      durationText += `${hours} hour${hours > 1 ? 's' : ''} `;
    }
  
    if (minutes > 0) {
      durationText += `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  
    this.contestForm.patchValue(
      { Duration: durationText.trim() },
      { emitEvent: false }
    );
  }

  loadAgeGroups(): void {
    this.commonService.getApi('MasterData/All', {}).subscribe({
      next: (res: any) => {
        const responseData = Array.isArray(res?.data?.data) ? res.data.data : [];
        this.ageGroups = responseData.filter((item: any) => item.MasterType === 'Age');
      },
      error: (err) => console.error('Error fetching age groups:', err),
    });
  }

  // ── Toggle (Add / Edit / View form) ───────────────────────────────
  Toggleclass(value: any, mode: 'add' | 'edit' | 'view'): void {
    this.formMode        = mode;
    this.showContestForm = true;
    this.showSubmissions = false;

    if (mode === 'edit' || mode === 'view') {
      this.commonService
        .getApi(`Contest/${value?.Id}`, {})
        .subscribe((res: any) => {
          const contest = res?.data;

          const banner = contest?.BannerImage?.trim() || '';
          this.bannerImageUrls = banner
            ? [`${environment.domain}/${banner.replace(/\\/g, '/')}`]
            : [];
          this.bannerImageFile = null;

          this.contestForm.patchValue({
            ...contest,
            StartDate: contest?.StartDate ? this.toDatetimeLocal(contest.StartDate) : '',
            EndDate:   contest?.EndDate   ? this.toDatetimeLocal(contest.EndDate)   : '',
          });

          mode === 'view' ? this.contestForm.disable() : this.contestForm.enable();
        });

    } else {
      this.contestForm.enable();
      this.contestForm.reset({
        Id: '', Title: '', Description: '', Instructions: '',
        SponsorId: '', SponsorName: '', Type: '',
        ParticipantSetPoints: null, FirstPrizePoints: null,
        SecondPrizePoints: null, ThirdPrizePoints: null,
        StartDate: '', EndDate: '', Duration: '', Status: 'Upcoming',
      });
      this.bannerImageUrls = [];
      this.bannerImageFile = null;
      this.deletedImage    = false;
    }
  }

  // ── Close form ────────────────────────────────────────────────────
  closeContestForm(): void {
    this.showContestForm = false;
    this.formMode        = 'add';
    this.bannerImageUrls = [];
    this.contestForm.enable();
    this.contestForm.reset();
    this.mattablechild?.getData?.();
  }

  // ── Image handlers ────────────────────────────────────────────────
  onImageReceived(file: any): void {
    this.bannerImageFile = file;
    this.deletedImage    = false;
  }

  onDeleteImage(flag: boolean): void {
    this.deletedImage = flag;
    if (flag) { this.bannerImageFile = null; }
  }

  // ── Quill handlers ─────────────────────────────────────────────────
  updateDescription(value: string):  void { this.contestForm.patchValue({ Description:  value }); }
  updateInstructions(value: string): void { this.contestForm.patchValue({ Instructions: value }); }

onDelete(element: any): void {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You want to delete this contest?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#602F80',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      this.commonService.deleteApi(`Contest/Delete/${element?.Id}`).subscribe({
        next: () => {
          Swal.fire({
            title: 'Deleted!',
            text: 'Contest deleted successfully.',
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

  // ── Submit ─────────────────────────────────────────────────────────
  SubmitContestForm(form: FormGroup): void {
    if (form.valid) {
      const formData = new FormData();
      const v = form.value;

      if (this.bannerImageFile) { formData.append('BannerImage', this.bannerImageFile); }
      if (this.deletedImage)    { formData.append('BannerImage', ''); }

      formData.append('Title',                v.Title);
      formData.append('Description',          v.Description          || '');
      formData.append('Instructions',         v.Instructions         || '');
      // formData.append('SponsorId',            v.SponsorId            || '');
      // formData.append('SponsorName',          v.SponsorName          || '');
      formData.append('Type',                 v.Type);
      // formData.append('CompetitionType',      v.CompetitionType);
      formData.append('ParticipantSetPoints', v.ParticipantSetPoints || '');
      formData.append('FirstPrizePoints',     v.FirstPrizePoints);
      formData.append('SecondPrizePoints',    v.SecondPrizePoints);
      formData.append('ThirdPrizePoints',     v.ThirdPrizePoints);
      formData.append('AgeId',        form.value.AgeId);
      formData.append('Gender',        form.value.Gender);
      formData.append('CategoryId',      form.value.CategoryId);
      formData.append(
        'StartDate',
        new Date(v.StartDate).toISOString()
      );
      
      formData.append(
        'EndDate',
        new Date(v.EndDate).toISOString()
      );
      formData.append('Duration',             v.Duration             || '');
      formData.append('Status',               v.Status               || 'Upcoming');

      this.formDataSubmit(
        v.Id,
        formData,
        this.contestForm,
        'Contest',
        {
          redirect:          '/contest',
          formInitialValues: {},
          commonService:     this.commonService,
          router:            this.router,
        },
      ).then(() => { this.closeContestForm(); });

    } else {
      this.validateAllFormFields(form);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────
  deleteContest(contest: any): void {
    if (!confirm(`Delete "${contest?.Title}"?`)) return;
    // this.commonService.deleteApi(`Contest/Delete/${contest?.Id}`, {}).subscribe({
    //   next: () => this.mattablechild?.getData?.(),
    //   error: (err) => console.error('Delete failed:', err),
    // });
  }

  // ── Submissions navigation ─────────────────────────────────────────
  openSubmissions(contest: any): void {
    this.selectedContest = contest;
    this.showSubmissions = true;
    this.showContestForm = false;
  }

  closeSubmissions(): void {
    this.showSubmissions  = false;
    this.selectedContest  = null;
    this.mattablechild?.getData?.();
  }

  // ── Status badge ───────────────────────────────────────────────────
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Active:    'badge-active',
      Upcoming:  'badge-upcoming',
      Completed: 'badge-completed',
      Pending:   'badge-pending',
      Verified:  'badge-verified',
      Rejected:  'badge-rejected',
    };
    return map[status] ?? '';
  }

  // ── Private helpers ────────────────────────────────────────────────
  private toDatetimeLocal(dateStr: string): string {
    const d   = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
           `T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}