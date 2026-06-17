import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Utils } from '../../utils';
import { passwordDifferentValidator, passwordMatchValidator, passwordStrengthValidator } from '../../utils/customValidator';
import { PasswordService } from '../../core/service/password.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
    templateUrl: './change-password.component.html',
    styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent extends Utils {
  public ChangePasswordForm: FormGroup;
  isLoading = false;
  hideCurrent = true;
  hideNew = true;
  hideConfirm = true;

  constructor(
      private formBuilder: FormBuilder,
      private passwordService: PasswordService,
      private router: Router,
      private location: Location,
  ) {
      super();
      this.ChangePasswordForm = this.formBuilder.group(
        {
          CurrentPassword: ['', [Validators.required]],
          NewPassword: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator(true)]],
          ConfirmPassword: ['', [Validators.required]],
        },
        {
          validators: [
            passwordMatchValidator('NewPassword', 'ConfirmPassword'),
            passwordDifferentValidator('CurrentPassword', 'NewPassword'),
          ],
        }
      );
  }

  onSubmit(form: FormGroup) {
    if (!form.valid) {
      this.validateAllFormFields(form);
      return;
    }

    this.isLoading = true;
    const payload = {
      currentPassword: form.value.CurrentPassword,
      newPassword: form.value.NewPassword,
      confirmPassword: form.value.ConfirmPassword,
    };

    this.passwordService.changePassword(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Password Changed',
          text: res?.message || 'Your password has been changed successfully.',
          showConfirmButton: false,
          timer: 1800,
        }).then(() => {
          form.reset();
          this.router.navigate(['/dashboard']);
        });
      },
      error: (error: any) => {
        this.isLoading = false;
        this.handleError(error, form);
      },
    });
  }

  onCancel() {
    this.location.back();
  }

  private handleError(error: any, form: FormGroup) {
    if (error?.status === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Unable to reach the server. Please check your connection and try again.',
      });
      return;
    }

    if (error?.status === 401) {
      Swal.fire({
        icon: 'error',
        title: 'Session Expired',
        text: 'Your session has expired. Please log in again.',
      });
      return;
    }

    const fieldErrors = error?.error?.errors;
    if (fieldErrors && typeof fieldErrors === 'object') {
      const fieldMap: Record<string, string> = {
        currentPassword: 'CurrentPassword',
        newPassword: 'NewPassword',
        confirmPassword: 'ConfirmPassword',
      };
      let mapped = false;
      Object.keys(fieldErrors).forEach((key) => {
        const control = form.get(fieldMap[key]);
        if (control) {
          const message = Array.isArray(fieldErrors[key]) ? fieldErrors[key][0] : fieldErrors[key];
          control.setErrors({ ...control.errors, server: message });
          control.markAsTouched();
          mapped = true;
        }
      });
      if (mapped) return;
    }

    const message: string = error?.error?.message || 'Something went wrong. Please try again.';

    if (/current password is incorrect/i.test(message)) {
      const control = form.get('CurrentPassword');
      control?.setErrors({ ...control.errors, incorrect: true });
      control?.markAsTouched();
      return;
    }

    if (/must be different/i.test(message)) {
      const control = form.get('NewPassword');
      control?.setErrors({ ...control.errors, sameAsCurrent: true });
      control?.markAsTouched();
      return;
    }

    Swal.fire({
      icon: 'error',
      title: 'Failed to Change Password',
      text: message,
    });
  }
}
