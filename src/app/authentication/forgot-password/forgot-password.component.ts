import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Utils } from '../../utils';
import { PasswordService } from '../../core/service/password.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [RouterLink, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatProgressSpinnerModule],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class ForgotPasswordComponent extends Utils {
  public ForgotPasswordForm: FormGroup;
  isLoading = false;
  isToggled = false;

  constructor(
      public themeService: CustomizerSettingsService,
      private formBuilder: FormBuilder,
      private passwordService: PasswordService,
      private router: Router,
  ) {
      super();
      this.ForgotPasswordForm = this.formBuilder.group({
        Email: ['', [Validators.required, Validators.email]],
      });

      this.themeService.isToggled$.subscribe(isToggled => {
        this.isToggled = isToggled;
      });
  }

  onSubmit(form: FormGroup) {
    if (!form.valid) {
      this.validateAllFormFields(form);
      return;
    }

    const email = form.value.Email;
    this.isLoading = true;

    this.passwordService.sendOtp({ email }).subscribe(
      (res: any) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'OTP Sent',
          text: res?.message || 'An OTP has been sent to your email.',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          this.router.navigate(['/verify-otp'], { queryParams: { email } });
        });
      },
      (error: any) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Failed to Send OTP',
          text: error?.error?.message || 'Something went wrong. Please try again.',
        });
      }
    );
  }
}
