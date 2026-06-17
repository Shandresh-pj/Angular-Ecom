import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { Utils } from '../../utils';
import { passwordMatchValidator, passwordStrengthValidator } from '../../utils/customValidator';
import { PasswordService } from '../../core/service/password.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [RouterLink, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatProgressSpinnerModule],
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class ResetPasswordComponent extends Utils implements OnInit {
  public ResetForm: FormGroup;
  email = '';
  resetToken = '';
  isLoading = false;
  hideNew = true;
  hideConfirm = true;
  isToggled = false;

  constructor(
      public themeService: CustomizerSettingsService,
      private formBuilder: FormBuilder,
      private passwordService: PasswordService,
      private router: Router,
      private route: ActivatedRoute,
  ) {
      super();
      this.ResetForm = this.formBuilder.group(
        {
          NewPassword: ['', [Validators.required, Validators.minLength(6), passwordStrengthValidator()]],
          ConfirmPassword: ['', [Validators.required]],
        },
        { validators: passwordMatchValidator('NewPassword', 'ConfirmPassword') }
      );

      this.themeService.isToggled$.subscribe(isToggled => {
        this.isToggled = isToggled;
      });
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.resetToken = this.route.snapshot.queryParamMap.get('reset_token') || '';
    if (!this.resetToken) {
      this.router.navigate(['/forgot-password']);
    }
  }

  onSubmit(form: FormGroup) {
    if (!form.valid) {
      this.validateAllFormFields(form);
      return;
    }

    this.isLoading = true;
    this.passwordService
      .resetPassword({ reset_token: this.resetToken, newPassword: form.value.NewPassword })
      .subscribe(
        (res: any) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Password Reset',
            text: res?.message || 'Your password has been reset successfully.',
            showConfirmButton: false,
            timer: 1800,
          }).then(() => {
            this.router.navigate(['/sign-in']);
          });
        },
        (error: any) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Reset Failed',
            text: error?.error?.message || 'Something went wrong. Please try again.',
          });
        }
      );
  }
}
