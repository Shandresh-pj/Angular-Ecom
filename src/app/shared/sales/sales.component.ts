import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [MatFormFieldModule,
          MatInputModule,
          MatSelectModule,MatChipsModule,MatIconModule,
          ReactiveFormsModule,],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
})
export class SalesComponent implements OnInit{

      myControl = new FormControl();
      @Input() controlKey!: string;
      @Input() clearSalesEmails: any = '';
      @Input() GetSalesEmails: any[] = [];
      @Input() parentFormGroup!: FormGroup;
      SalesForm: FormGroup;
      separatorKeysCodes: number[] = [ENTER, COMMA]; 
  isUploadDisabled=false;
  emails: string[] = [];  
      constructor(private fb: FormBuilder) {
          this.SalesForm = this.fb.group({
              Id: [''],
              SalesCycle:['', ],
              SalesName:[''],
              SalesMobile:[''],
              SalesEmail:[[]],
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
        // Log the data you are about to use (for debugging)
              this.parentFormGroup.setControl(
                  this.controlKey ? this.controlKey : 'SalesDetails',
                  this.SalesForm
              );
              this.SalesForm.valueChanges.subscribe((value) => {
                console.log('valuecheck 111',value)
                  this.parentFormGroup.updateValueAndValidity();
              });
          } else {
              console.error(
                  'Parent FormGroup or controlKey is missing in AddressComponent'
              );
          }
      }


      ngOnChanges(changes: SimpleChanges): void {
       if (changes['clearSalesEmails'] && changes['clearSalesEmails'].currentValue) {
           this.emails = [];
    this.SalesForm.get('SalesEmail')?.reset();
       }
        if(changes['GetSalesEmails'] && changes['GetSalesEmails'].currentValue){
           this.emails = [...this.GetSalesEmails]; 
             this.SalesForm.patchValue({
           SalesEmail: this.emails
          });
          
        }
      }

       addEmail(event: MatChipInputEvent): void {
              const value = (event.value || '').trim();
              console.log('checkvalue',value)
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
                 this.SalesForm.patchValue({ SalesEmail: this.emails });
              
              } else if (value) {
                console.log(`${value} is not a valid email`);
              }
            
              event.chipInput!.clear(); 
            }
            onBlur(event: Event): void {
              const input = event.target as HTMLInputElement;
              const value = input.value.trim();
                console.log('checkvalue 111',value)
              if (value  ) { 
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
                this.SalesForm.patchValue({ SalesEmail: this.emails });
              }
            }
            
}
