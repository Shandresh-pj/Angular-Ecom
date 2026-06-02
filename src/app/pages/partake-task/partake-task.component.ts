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
import { PartakeSubmissionComponent } from '../partake-submission/partake-submission.component';

@Component({
  selector: 'app-partake-task',
  standalone: true,
  imports: [
    MatTableComponent, MatCard, MatFormField, MatInput,
    ReactiveFormsModule, MatLabel, QuillComponent,
    FileuploadComponent, MatSelect, MatOption,
    CommonModule, MatIcon, PartakeSubmissionComponent,
  ],
  templateUrl: './partake-task.component.html',
  styleUrl: './partake-task.component.scss',
})
export class PartakeTaskComponent extends Utils implements OnInit {

  @ViewChild('mattablechild') mattablechild: any;
  statusOptions = ['Active', 'Upcoming', 'Completed'];
  CompanyId: any;
  isToggled: any;
  category: any;
  // ── Table config ───────────────────────────────────────────────
  // ✅ FIX: added `submissions: true` so app-mat-table renders the button
  public action = { add: true, edit: true, view: true, submissions: true };
  columns: any;

  // ── Task form ──────────────────────────────────────────────────
  showTaskForm   = false;
  taskForm!: FormGroup;
  formMode: 'add' | 'edit' | 'view' = 'add';

  taskImageUrls: any[] = [];
  taskImageFile: any   = null;
  deletedImage         = false;

  ageGroups: any[] = [];

  // ── Submissions ────────────────────────────────────────────────
  // ✅ FIX: showSubmissions controls which view is active
  showSubmissions = false;
  selectedTask: any = null;

  // ──────────────────────────────────────────────────────────────
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

    // Build task form
    this.taskForm = this.formBuilder.group({
      Id:           [''],
      Title:        ['', Validators.required],
      Description:  [''],
      Instructions: [''],
      Points:       [null, [Validators.required, Validators.min(1)]],
      AgeId:        ['',  Validators.required],
      Gender:        ['',  Validators.required],
      StartDate:    ['',  Validators.required],
      EndDate:      ['',  Validators.required],
      Status:      ['',  Validators.required],
      CategoryId:   ['', Validators.required],
      TaskImage:    [''],
    });

    this.themeService.isToggled$.subscribe((isToggled) => {
      this.isToggled = isToggled;
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      const encryptedData = params['data'];
      this.CompanyId = params['company_id'] || 0;
      if (encryptedData) {
        const decryptedObj = this.encryptionService.decrypt(encryptedData);
        this.CompanyId = decryptedObj.company_id || 0;
      }
    });

    // Table columns
    this.columns = [
      {
        columnDef: 'ID',
        header:    'ID',
        cell:      (element: any) => `${element?.Id}`,
      },
      {
        columnDef: 'Title',
        header:    'Title',
        cell:      (element: any) => `${element?.Title}`,
      },
      {
        columnDef: 'Points',
        header:    'Points',
        cell:      (element: any) => `${element?.Points}`,
      },
      {
        columnDef: 'StartDate',
        header:    'Start Date & Time',
        cell:      (element: any) =>
          element?.StartDate
            ? new Date(element.StartDate).toLocaleString('en-IN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true,
              })
            : '',
      },
      {
        columnDef: 'EndDate',
        header:    'End Date & Time',
        cell:      (element: any) =>
          element?.EndDate
            ? new Date(element.EndDate).toLocaleString('en-IN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true,
              })
            : '',
      },
    ];
  }

  // ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadAgeGroups();
    this.getCategory();
  }

  getCategory() {
    const params = { Feature: 'true', All: 'true', Type: 'Partake' };
    this.commonService.getApi('Category/All', params).subscribe((res: any) => {
      this.category = res?.data?.data.map((item: any) => ({
        ...item,
        Name: item?.CategoryTranslations?.[0]?.Name
      }));
    });
  }

  // ── Load Age Groups ────────────────────────────────────────────
  loadAgeGroups(): void {
    this.commonService.getApi('MasterData/All', {}).subscribe({
      next: (res: any) => {
        const responseData = Array.isArray(res?.data?.data) ? res.data.data : [];
        this.ageGroups = responseData.filter((item: any) => item.MasterType === 'Age');
      },
      error: (err) => console.error('Error fetching age groups:', err),
    });
  }

  // ── Toggle (Add / Edit / View form) ───────────────────────────
  Toggleclass(value: any, mode: 'add' | 'edit' | 'view'): void {
    this.formMode       = mode;
    this.showTaskForm   = true;
    this.showSubmissions = false;

    if (mode === 'edit' || mode === 'view') {
      this.commonService
        .getApi(`PartakeTask/Detail/${value?.Id}`, {})
        .subscribe((res: any) => {
          const task = res?.data;

          const image = task?.TaskImage?.trim() || '';
          this.taskImageUrls = image
            ? [`${environment.domain}/${image.replace(/\\/g, '/')}`]
            : [];
          this.taskImageFile = null;

          this.taskForm.patchValue({
            ...task,
            StartDate: task?.StartDate ? this.toDatetimeLocal(task.StartDate) : '',
            EndDate:   task?.EndDate   ? this.toDatetimeLocal(task.EndDate)   : '',
          });

          mode === 'view' ? this.taskForm.disable() : this.taskForm.enable();
        });

    } else {
      // ADD — reset everything
      this.taskForm.enable();
      this.taskForm.reset({
        Id: '', Title: '', Description: '', Instructions: '',
        Points: null, AgeId: '', StartDate: '', EndDate: '',
      });
      this.taskImageUrls = [];
      this.taskImageFile = null;
      this.deletedImage  = false;
    }
  }

  // ── Close task form ────────────────────────────────────────────
  closeTaskForm(): void {
    this.showTaskForm = false;
    this.formMode     = 'add';
    this.taskImageUrls = [];
    this.taskForm.enable();
    this.taskForm.reset();
    this.mattablechild?.loadTableData?.();
  }

  // ── Image handlers ─────────────────────────────────────────────
  onImageReceived(file: any): void {
    this.taskImageFile = file;
    this.deletedImage  = false;
  }

  onDeleteImage(flag: boolean): void {
    this.deletedImage = flag;
    if (flag) { this.taskImageFile = null; }
  }

  // ── Quill handlers ─────────────────────────────────────────────
  updateDescription(value: string):  void { this.taskForm.patchValue({ Description:  value }); }
  updateInstructions(value: string): void { this.taskForm.patchValue({ Instructions: value }); }

  // ── Submit ─────────────────────────────────────────────────────
  SubmitTaskForm(form: FormGroup): void {
    if (form.valid) {
      const formData = new FormData();

      if (this.taskImageFile) { formData.append('TaskImage', this.taskImageFile); }
      if (this.deletedImage)  { formData.append('TaskImage', ''); }

      formData.append('Title',        form.value.Title);
      formData.append('Description',  form.value.Description  || '');
      formData.append('Instructions', form.value.Instructions || '');
      formData.append('Points',       form.value.Points);
      formData.append('AgeId',        form.value.AgeId);
      formData.append('Gender',        form.value.Gender);
      formData.append('StartDate',    form.value.StartDate);
      formData.append('EndDate',      form.value.EndDate);
      formData.append('Status',      form.value.Status);
      formData.append('CategoryId',      form.value.CategoryId);
      this.formDataSubmit(
        form.value.Id,
        formData,
        this.taskForm,
        'PartakeTask',
        {
          redirect:           '/partake-task',
          formInitialValues:  {},
          commonService:      this.commonService,
          router:             this.router,
        },
      ).then(() => { this.closeTaskForm(); });

    } else {
      this.validateAllFormFields(form);
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  SUBMISSIONS NAVIGATION
  //  ✅ FIX: This is what the table's (submissions) event calls.
  //  It hides the task list and form, stores the selected task,
  //  then shows app-partake-submission which loads its own data.
  // ══════════════════════════════════════════════════════════════

  openSubmissions(task: any): void {
    this.selectedTask    = task;
    this.showSubmissions = true;
    this.showTaskForm    = false;
  }

  // Called by app-partake-submission's (back) output — returns to task list
  closeSubmissions(): void {
    this.showSubmissions = false;
    this.selectedTask    = null;
    this.mattablechild?.loadTableData?.();   // refresh task list counts
  }

  // ── Status badge helper (used by task list) ────────────────────
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Active:    'badge-active',
      Pending:   'badge-pending',
      Verified:  'badge-verified',
      Accepted:  'badge-accepted',
      Rejected:  'badge-rejected',
      Upcoming:  'badge-upcoming',
      Completed: 'badge-completed',
    };
    return map[status] ?? '';
  }

  // ── Private helpers ────────────────────────────────────────────
  private toDatetimeLocal(dateStr: string): string {
    const d   = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
           `T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}