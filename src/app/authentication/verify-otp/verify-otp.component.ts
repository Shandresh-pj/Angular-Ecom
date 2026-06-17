import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { Utils } from '../../utils';
import { PasswordService } from '../../core/service/password.service';
import Swal from 'sweetalert2';

const OTP_LENGTH = 6;

@Component({
    selector: 'app-verify-otp',
    standalone: true,
    imports: [RouterLink, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
    templateUrl: './verify-otp.component.html',
    styleUrl: './verify-otp.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class VerifyOtpComponent extends Utils implements OnInit, OnDestroy {
  @ViewChildren('otpBox') otpBoxes!: QueryList<ElementRef<HTMLInputElement>>;

  email = '';
  otpDigits: string[] = new Array(OTP_LENGTH).fill('');
  otpBoxIndexes = Array.from({ length: OTP_LENGTH }, (_, i) => i);
  otpError = '';
  isLoading = false;
  isResending = false;
  resendCooldown = 0;
  otpStatus: 'success' | 'failed' | null = null;
  isToggled = false;

  private cooldownTimer?: ReturnType<typeof setInterval>;

  constructor(
      public themeService: CustomizerSettingsService,
      private passwordService: PasswordService,
      private router: Router,
      private route: ActivatedRoute,
  ) {
      super();
      this.themeService.isToggled$.subscribe(isToggled => {
        this.isToggled = isToggled;
      });
  }

  get otp(): string {
    return this.otpDigits.join('');
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    if (!this.email) {
      this.router.navigate(['/forgot-password']);
      return;
    }
    this.startCooldown();
  }

  ngOnDestroy(): void {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }
  }

  onDigitInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/[^0-9]/g, '').slice(-1);
    this.otpDigits[index] = digit;
    input.value = digit;
    this.otpError = '';
    this.otpStatus = null;

    if (digit && index < OTP_LENGTH - 1) {
      this.focusBox(index + 1);
    }
  }

  onDigitKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      this.focusBox(index - 1);
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') || '';
    const digits = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH).split('');
    if (!digits.length) return;

    this.otpDigits = new Array(OTP_LENGTH).fill('');
    digits.forEach((d, i) => (this.otpDigits[i] = d));
    this.otpBoxes?.forEach((box, i) => (box.nativeElement.value = this.otpDigits[i] || ''));
    this.otpError = '';
    this.otpStatus = null;
    this.focusBox(Math.min(digits.length, OTP_LENGTH - 1));
  }

  onVerify() {
    if (this.otp.length !== OTP_LENGTH) {
      this.otpError = 'Please enter the complete 6-digit OTP';
      return;
    }

    this.isLoading = true;
    this.passwordService.verifyOtp({ email: this.email, otp: this.otp }).subscribe(
      (res: any) => {
        this.isLoading = false;
        this.otpStatus = 'success';
        this.router.navigate(['/reset-password'], {
          queryParams: { email: this.email, reset_token: res?.reset_token },
        });
      },
      (error: any) => {
        this.isLoading = false;
        this.otpStatus = 'failed';
        this.otpError = error?.error?.message || 'Invalid OTP. Please try again.';
      }
    );
  }

  onResend() {
    if (this.resendCooldown > 0 || this.isResending) return;

    this.isResending = true;
    this.passwordService.sendOtp({ email: this.email }).subscribe(
      (res: any) => {
        this.isResending = false;
        this.clearOtpBoxes();
        Swal.fire({
          icon: 'success',
          title: 'OTP Resent',
          text: res?.message || 'A new OTP has been sent to your email.',
          showConfirmButton: false,
          timer: 1500,
        });
        this.startCooldown();
      },
      (error: any) => {
        this.isResending = false;
        Swal.fire({
          icon: 'error',
          title: 'Failed to Resend OTP',
          text: error?.error?.message || 'Something went wrong. Please try again.',
        });
      }
    );
  }

  private clearOtpBoxes() {
    this.otpDigits = new Array(OTP_LENGTH).fill('');
    this.otpBoxes?.forEach((box) => (box.nativeElement.value = ''));
    this.otpError = '';
    this.otpStatus = null;
    this.focusBox(0);
  }

  private focusBox(index: number) {
    this.otpBoxes?.toArray()[index]?.nativeElement.focus();
  }

  private startCooldown(seconds: number = 30) {
    this.resendCooldown = seconds;
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }
    this.cooldownTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0 && this.cooldownTimer) {
        clearInterval(this.cooldownTimer);
      }
    }, 1000);
  }
}
