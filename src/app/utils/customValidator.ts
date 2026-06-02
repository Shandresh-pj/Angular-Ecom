import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

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