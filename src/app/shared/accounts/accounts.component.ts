import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../core/service/auth.service';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [MatFormFieldModule,
    MatInputModule,
    MatSelectModule, MatChipsModule, MatIconModule,
    ReactiveFormsModule,],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss'
})
export class AccountsComponent implements OnInit {

  myControl = new FormControl();
  @Input() controlKey!: string;
  @Input() clearAccountEmails: any = '';
  @Input() GetAccountEmails: any[] = [];
  @Input() parentFormGroup!: FormGroup;
  AccountsForm: FormGroup;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  isUploadDisabled = false;
  userDetails:any;
  emails: string[] = [];
  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.AccountsForm = this.fb.group({
      Id: [''],
      AccountCycle: ['',],
      AccountName: [''],
      AccountMobile: [''],
      AccountEmail: [[]],
    });
  }
  numericOnly(event: { key: string; }): boolean {
    let patt = /^([0-9])$/;
    let result = patt.test(event.key);
    return result;
  }

  ngOnInit(): void {
    // Sync initial data
    // if (this.addressData) {
    //   this.BillingForm.patchValue(this.addressData);
    // }

    // Link BillingForm to the parent form
    if (this.parentFormGroup) {
      console.log('parentFormGroupss', this.parentFormGroup)
      // Log the data you are about to use (for debugging)
      this.parentFormGroup.setControl(
        this.controlKey ? this.controlKey : 'AccountsDetails',
        this.AccountsForm
      );
      this.AccountsForm.valueChanges.subscribe((value) => {
        console.log('valuecheck 111', value)
        this.parentFormGroup.updateValueAndValidity();
      });
    } else {
      console.error(
        'Parent FormGroup or controlKey is missing in AddressComponent'
      );
    }
    this.userDetails = this.authService.fetchUserDetails();
    
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clearAccountsEmails'] && changes['clearAccountsEmails'].currentValue) {
      this.emails = [];
      this.AccountsForm.get('AccountEmail')?.reset();
    }
    if (changes['GetAccountEmails'] && changes['GetAccountEmails'].currentValue) {
      this.emails = [...this.GetAccountEmails];
      this.AccountsForm.patchValue({
        AccountEmail: this.emails
      });

    }
  }

  addEmail(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    console.log('checkvalue', value)
    if (!value) {
      event.chipInput!.clear();
      return;
    }
    if (this.emails.includes(value)) {
      console.log(`${value} already added`);
      event.chipInput?.clear();
      return;
    }
    const emailControl = new FormControl(value, Validators.email);

    if (value && emailControl?.valid) {
      this.emails.push(value);
      this.AccountsForm.patchValue({ AccountEmail: this.emails });

    } else if (value) {
      console.log(`${value} is not a valid email`);
    }

    event.chipInput!.clear();
  }
  onBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    console.log('checkvalue 111', value)
    if (value) {
      const chipInputEvent: MatChipInputEvent = {
        input,
        value,
        chipInput: {
          clear: () => (input.value = ''),
        } as any,
      };
      this.addEmail(chipInputEvent);
    }
  }
  removeEmail(email: string): void {
    const index = this.emails.indexOf(email);
    if (index >= 0) {
      this.emails.splice(index, 1);
      this.AccountsForm.patchValue({ AccountEmail: this.emails });
    }
  }

}
