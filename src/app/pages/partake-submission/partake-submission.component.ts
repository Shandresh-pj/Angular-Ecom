import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonService } from '../../core/service/common.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { MatTableComponent } from '../../shared/mat-table/mat-table.component'; // ✅ import
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment.development';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export enum SubmissionStatus {
  Pending  = 'Pending',
  Verified = 'Verified',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
}

@Component({
  selector: 'app-partake-submission',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatIcon,
    MatTooltipModule,
    MatTableComponent, 
    TranslateModule
  ],
  templateUrl: './partake-submission.component.html',
  styleUrl:    './partake-submission.component.scss',
})
export class PartakeSubmissionComponent implements OnInit {

  @Input()  selectedTask: any = null;
  @Output() back = new EventEmitter<void>();

  @ViewChild('mattablechild') mattablechild: any;

  showDetailPanel     = false;
  selectedSubmission: any = null;
  adminNotes          = '';
  isSubmitting        = false;

  submissionSummary: {
    TotalSubmissions: number;
    PendingReview:    number;
    Verified:         number;
    Rejected:         number;
  } | null = null;

  submissionStatusTabs = ['All', 'Pending', 'Verified', 'Rejected'];
  submissionStatusTab  = 'All';

  action = { add: false, edit: false, view: true, delete: false, submissions: false };

  columns = [
    {
      columnDef: 'UserName',
      header:    'User',
      cell:      (e: any) =>
        `${e?.User?.FirstName ?? ''} ${e?.User?.LastName ?? ''}`.trim(),
    },
    {
      columnDef: 'Email',
      header:    'Email',
      cell:      (e: any) => e?.User?.Email ?? '',
    },
    {
      columnDef: 'MediaType',
      header:    'Media Type',
      cell:      (e: any) => e?.MediaType ?? '',
    },
    {
      columnDef: 'CreatedAt',
      header:    'Submitted On',
      cell:      (e: any) =>
        e?.CreatedAt
          ? new Date(e.CreatedAt).toLocaleString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: true,
            })
          : '',
    },
    {
      columnDef: 'Status',
      header:    'Status',
      cell:      (e: any) => e?.Status ?? '',
    },
    {
      columnDef: 'PointsAwarded',
      header:    'Points',
      cell:      (e: any) => e?.PointsAwarded ? `${e.PointsAwarded} pts` : '—',
    },
  ];

  // ✅ Dynamic URL — recalculates whenever selectedTask changes
  get tableUrl(): string {
    return this.selectedTask?.Id
      ? `PartakeTask/Submissions/${this.selectedTask.Id}`
      : '';
  }

  // ✅ customParams drives the status filter sent to the backend
  // (app-mat-table's ngOnChanges reloads when this reference changes)
  tableCustomParams: Record<string, string> = {};

  constructor(
    public  themeService:  CustomizerSettingsService,
    private commonService: CommonService,
    private cdr:           ChangeDetectorRef,
    private translate:TranslateService,
    private sanitizer:     DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  // ══════════════════════════════════════════════════════════
  //  SUMMARY  — separate call so cards stay populated
  // ══════════════════════════════════════════════════════════
  loadSummary(): void {
    if (!this.selectedTask?.Id) return;

    this.commonService
      .getApi(`PartakeTask/Submissions/${this.selectedTask.Id}`, {
        currentPage: 1,
        pageSize: 1,
      })
      .subscribe({
        next: (res: any) => {
          this.submissionSummary = res?.data?.summary ?? null;
          this.cdr.markForCheck();
        },
        error: () => {},
      });
  }

  getMediaUrl(url: string | null): SafeResourceUrl {
    if (!url) return '';
    const clean = url.replace(/\\/g, '/');
    const full  = clean.startsWith('http')
      ? clean
      : `${environment.domain}/${clean}`;
  
    return this.sanitizer.bypassSecurityTrustResourceUrl(full); // ✅
  }
  
  getMediaType(submission: any): string {
    const url: string = submission?.MediaUrl ?? '';
    const ext = url.split('.').pop()?.toLowerCase() ?? '';
  
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'Video';
    if (['mp3', 'wav', 'aac', 'm4a'].includes(ext))  return 'Audio';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'Image';
  
    return submission?.MediaType ?? ''; // fallback to backend value
  }
  onSubmissionTabChange(tab: string): void {
    this.submissionStatusTab = tab;
    // Create a NEW object reference so ngOnChanges fires
    this.tableCustomParams = tab === 'All' ? {} : { status: tab };
  }

  // ══════════════════════════════════════════════════════════
  //  DETAIL PANEL
  // ══════════════════════════════════════════════════════════
  openDetail(sub: any): void {
    this.selectedSubmission = sub;
    this.adminNotes         = sub?.AdminNotes ?? '';
    this.showDetailPanel    = true;
  }

  closeDetail(): void {
    this.showDetailPanel    = false;
    this.selectedSubmission = null;
    this.adminNotes         = '';
  }

  // ══════════════════════════════════════════════════════════
  //  VERIFY / ACCEPT / REJECT
  // ══════════════════════════════════════════════════════════
  verifySubmission(sub: any, status: string): void {
    if (!sub?.Id || this.isSubmitting) return;
    this.isSubmitting = true;

    const payload: any = { Status: status };
    if (this.adminNotes?.trim()) {
      payload.AdminNotes = this.adminNotes.trim();
    }

    this.commonService
      .postApi(`PartakeTask/VerifySubmission/${sub.Id}`, payload)
      .subscribe({
        next: () => {
          this.isSubmitting = false;

          // Optimistic local update
          sub.Status     = status;
          sub.AdminNotes = payload.AdminNotes ?? sub.AdminNotes;
          if (status === SubmissionStatus.Accepted) {
            sub.PointsAwarded = this.selectedTask?.Points ?? 0;
          }

          // Refresh both the table and the summary cards
          this.mattablechild?.getData?.();
          this.loadSummary();

          if (this.showDetailPanel) this.closeDetail();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error verifying submission:', err);
        },
      });
  }

  // ══════════════════════════════════════════════════════════
  //  HELPERS
  // ══════════════════════════════════════════════════════════
  goBack(): void { this.back.emit(); }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'badge-pending', Verified: 'badge-verified',
      Accepted: 'badge-accepted', Rejected: 'badge-rejected',
      Active: 'badge-active', Upcoming: 'badge-upcoming',
      Completed: 'badge-completed',
    };
    return map[status] ?? '';
  }
}