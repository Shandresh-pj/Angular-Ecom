import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'app-bank-details',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
    ],
    templateUrl: './bank-details.component.html',
    styleUrl: './bank-details.component.scss',
})
export class BankDetailsComponent implements OnInit {
    @Input() public controlName: any;
    myControl = new FormControl();
    @Input() controlKey!: string;
    @Input() addressData: any = null;
    @Input() BankValidator!: boolean;
    @Input() parentFormGroup!: FormGroup;
    BankForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.BankForm = this.fb.group({
            Id: [''],
            Name:['', Validators.required],
            AccountType:[''],
            IfscCode:[''],
            AccountNumber:[''],
            Branch:['']
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
        //   this.BankForm.patchValue(this.addressData);
        // }

        // Link BankForm to the parent form
        if (this.parentFormGroup) {
            this.parentFormGroup.setControl(
                this.controlKey ? this.controlKey : 'BankDetails',
                this.BankForm
            );
            this.BankForm.valueChanges.subscribe(() => {
                // Trigger change detection in the parent form
                this.parentFormGroup.updateValueAndValidity();
            });
        } else {
            console.error(
                'Parent FormGroup or controlKey is missing in AddressComponent'
            );
        }
    }
     ngOnChanges(changes: SimpleChanges): void {
            // console.log('BankValidator',this.BankValidator)
        if (changes['BankValidator']) {
          if (this.BankValidator) {
            this.BankForm.controls["Name"].clearValidators();
          } else {
            this.BankForm.controls["Name"].setValidators(Validators.required);
          }
          this.BankForm.controls["Name"].updateValueAndValidity();
        }
      }
}
