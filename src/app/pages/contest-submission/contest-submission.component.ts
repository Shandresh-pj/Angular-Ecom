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
import { FormsModule } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonService } from '../../core/service/common.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { MatTableComponent } from '../../shared/mat-table/mat-table.component';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

// ─────────────────────────────────────────────────────────────
//  Enums matching the backend
// ─────────────────────────────────────────────────────────────
export enum SubmissionStatus {
  Pending  = 'Pending',
  Verified = 'Verified',
  Rejected = 'Rejected',
}

export enum WinnerPrize {
  NotSelected = 'Not Selected',
  First       = '1st Prize',
  Second      = '2nd Prize',
  Third       = '3rd Prize',
}

@Component({
  selector: 'app-contest-submission',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCard,
    MatIcon,
    MatTooltipModule,
    MatTableComponent,
    TranslateModule,
  ],
  templateUrl: './contest-submission.component.html',
  styleUrl:    './contest-submission.component.scss',
})
export class ContestSubmissionComponent implements OnInit {

  // ── Inputs / Outputs ──────────────────────────────────────
  @Input()  selectedContest: any = null;
  @Output() back = new EventEmitter<void>();
  takenPrizes: Set<string> = new Set();
  @ViewChild('mattablechild') mattablechild: any;

  // ── Detail panel ──────────────────────────────────────────
  showDetailPanel     = false;
  selectedSubmission: any = null;
  adminScore: number | null = null;
  selectedPrize       = WinnerPrize.NotSelected;
  isSubmitting        = false;

  // ── Summary cards ─────────────────────────────────────────
  submissionStats: {
    totalSubmissions: number;
    pendingReview:    number;
    verifiedUsers:    number;
    winnersSelected:  number;
  } | null = null;

  // ── Status tabs ───────────────────────────────────────────
  submissionStatusTabs = ['All', 'Pending', 'Verified', 'Rejected'];
  submissionStatusTab  = 'All';

  prizeOptions = [
    { value: WinnerPrize.NotSelected, label: 'No Prize',  icon: '—'  },
    { value: WinnerPrize.First,       label: '1st Place', icon: '🥇' },
    { value: WinnerPrize.Second,      label: '2nd Place', icon: '🥈' },
    { value: WinnerPrize.Third,       label: '3rd Place', icon: '🥉' },
  ];

  // ── app-mat-table config ──────────────────────────────────
  action = { add: false, edit: false, view: true, delete: false, submissions: false };

  columns = [
    {
      columnDef: 'UserName',
      header:    'Participant',
      cell:      (e: any) =>
        `${e?.User?.FirstName ?? ''} ${e?.User?.LastName ?? ''}`.trim(),
    },
    {
      columnDef: 'Email',
      header:    'Email',
      cell:      (e: any) => e?.User?.Email ?? '',
    },
    {
      columnDef: 'Type',
      header:    'Type',
      cell:      (e: any) => e?.Type ?? '',
    },
    {
      columnDef: 'Status',
      header:    'Status',
      cell:      (e: any) => e?.Status ?? '',
    },
    {
      columnDef: 'Score',
      header:    'Score',
      cell:      (e: any) => e?.Score != null ? `${e.Score}/100` : '—',
    },
    {
      columnDef: 'WinnerPrize',
      header:    'Prize',
      cell:      (e: any) =>
        e?.WinnerPrize && e.WinnerPrize !== 'Not Selected' ? e.WinnerPrize : '—',
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
  ];

  get tableUrl(): string {
    return 'ContestSubmission/All';
  }

  // ── Status filter via customParams ────────────────────────
  tableCustomParams: Record<string, string> = {};

  constructor(
    public  themeService:  CustomizerSettingsService,
    private commonService: CommonService,
    private cdr:           ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.tableCustomParams = {
      ContestId: String(this.selectedContest?.Id ?? ''),
    };
    this.loadStats();
  }

  loadStats(): void {
    if (!this.selectedContest?.Id) return;
  
    this.commonService
      .getApi('ContestSubmission/All', {
        ContestId: this.selectedContest.Id,
        currentPage: 1,
        pageSize: 1,
        maxPages: 1,
      })
      .subscribe({
        next: (res: any) => {
          this.submissionStats = res?.data?.stats ?? null;
  
          // ✅ Populate takenPrizes from stats
          const taken: string[] = res?.data?.takenPrizes ?? [];
          this.takenPrizes = new Set(taken);
  
          this.cdr.markForCheck();
        },
        error: () => {},
      });
  }

  onSubmissionTabChange(tab: string): void {
    this.submissionStatusTab = tab;
  
    this.tableCustomParams = {
      ContestId: String(this.selectedContest?.Id ?? ''),
      ...(tab !== 'All' ? { Status: tab } : {}),
    };
  
    this.mattablechild?.getData?.();
  }

  // ══════════════════════════════════════════════════════════
  //  DETAIL PANEL
  // ══════════════════════════════════════════════════════════
  openDetail(sub: any): void {
    // Fetch full submission detail from backend
    this.commonService
      .getApi(`ContestSubmission/${sub.Id}`, {})
      .subscribe({
        next: (res: any) => {
          this.selectedSubmission = res?.data ?? sub;
          this.adminScore         = this.selectedSubmission?.Score ?? null;
          this.selectedPrize      = this.selectedSubmission?.WinnerPrize ?? WinnerPrize.NotSelected;
          this.showDetailPanel    = true;
          this.cdr.markForCheck();
        },
        error: () => {
          // Fallback: use row data if detail fetch fails
          this.selectedSubmission = sub;
          this.adminScore         = sub?.Score ?? null;
          this.selectedPrize      = sub?.WinnerPrize ?? WinnerPrize.NotSelected;
          this.showDetailPanel    = true;
        },
      });
  }

  isPrizeAlreadyTaken(prize: string): boolean {
    if (prize === WinnerPrize.NotSelected) return false;
    // Allow re-selecting the prize already assigned to this submission
    if (this.selectedSubmission?.WinnerPrize === prize) return false;
    return this.takenPrizes.has(prize);
  }

  closeDetail(): void {
    this.showDetailPanel    = false;
    this.selectedSubmission = null;
    this.adminScore         = null;
    this.selectedPrize      = WinnerPrize.NotSelected;
  }

  verifySubmission(sub: any, status: string): void {
    if (!sub?.Id || this.isSubmitting) return;
  
    this.isSubmitting = true;
  
    const payload: any = {
      Status: status,
      Score: this.adminScore ?? 0,
      WinnerPrize: this.selectedPrize,
    };
  
    this.commonService
      .postApi(`ContestSubmission/Verify/${sub.Id}`, payload)
      .subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
  
          sub.Status = status;
          sub.Score = this.adminScore;
          sub.WinnerPrize = this.selectedPrize;
  
          const taken: string[] = res?.data?.takenPrizes ?? [];
          this.takenPrizes = new Set(taken);
  
          // ✅ Success Swal Only
          Swal.fire({
            icon: 'success',
            title: res?.message || 'Added Successfully',
            showConfirmButton: false,
            timer: 2500,
            width: 400,
          });
  
          this.mattablechild?.getData?.();
          this.loadStats();
  
          if (this.showDetailPanel) {
            this.closeDetail();
          }
  
          this.cdr.markForCheck();
        },
  
        error: (err: any) => {
          this.isSubmitting = false;
          Swal.fire({
            icon: 'error',
            title: 'Verification Failed',
            text: err?.error?.message || 'Something went wrong',
            showConfirmButton: true,
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33',
            width: 380,
            padding: '1.5em',
            backdrop: `rgba(0,0,0,0.4)`,
            customClass: {
              popup: 'small-error-swal',
              icon: 'small-error-icon',
            },
          });
          console.error('Verify failed:', err);
        },
      });
  }

  goBack(): void { this.back.emit(); }

  getMediaUrl(path: string): string {
    if (!path) return '';
    return `${environment.domain}/${path.replace(/\\/g, '/')}`;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Pending:   'badge-pending',
      Verified:  'badge-verified',
      Rejected:  'badge-rejected',
      Active:    'badge-active',
      Upcoming:  'badge-upcoming',
      Completed: 'badge-completed',
    };
    return map[status] ?? '';
  }

// ✅ Keys must match the new enum values
getPrizeClass(prize: string): string {
  const map: Record<string, string> = {
    '1st Prize': 'prize-gold',
    '2nd Prize': 'prize-silver',
    '3rd Prize': 'prize-bronze',
  };
  return map[prize] ?? '';
}

getPrizeIcon(prize: string): string {
  const map: Record<string, string> = {
    '1st Prize': '🥇',
    '2nd Prize': '🥈',
    '3rd Prize': '🥉',
  };
  return map[prize] ?? '';
}
}