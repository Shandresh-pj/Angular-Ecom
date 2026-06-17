import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function vehicleNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const regex = /^[A-Z]{2} \d{2}( [A-Z]{1,3})? \d{4}$/;
  
      return regex.test(value)
        ? null
        : {
            invalidVehicleNumber: {
              message: 'Invalid format. Expected: XX 00 YY 0000 or XX 00 0000',
            },
          };
    };
  }

export function passwordStrengthValidator(requireSpecialChar: boolean = false): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value || '';
    if (!value) return null;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = !requireSpecialChar || /[^\da-zA-Z]/.test(value);
    return hasUpper && hasLower && hasNumber && hasSpecial ? null : { weakPassword: true };
  };
}

export function passwordDifferentValidator(currentKey: string, newKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const formGroup = group as FormGroup;
    const currentControl = formGroup.get(currentKey);
    const newControl = formGroup.get(newKey);
    if (!currentControl || !newControl) return null;

    if (newControl.value && currentControl.value && newControl.value === currentControl.value) {
      newControl.setErrors({ ...newControl.errors, sameAsCurrent: true });
    } else if (newControl.hasError('sameAsCurrent')) {
      const { sameAsCurrent, ...rest } = newControl.errors || {};
      newControl.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
  };
}

export function passwordMatchValidator(passwordKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const formGroup = group as FormGroup;
    const passwordControl = formGroup.get(passwordKey);
    const confirmControl = formGroup.get(confirmKey);
    if (!passwordControl || !confirmControl) return null;

    if (confirmControl.value && passwordControl.value !== confirmControl.value) {
      confirmControl.setErrors({ ...confirmControl.errors, passwordMismatch: true });
    } else if (confirmControl.hasError('passwordMismatch')) {
      const { passwordMismatch, ...rest } = confirmControl.errors || {};
      confirmControl.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
  };
}