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
import { GooglePlacesAutocompleteComponent } from '../../google-places-autocomplete/google-places-autocomplete.component';
import { CommonService } from '../../../core/service/common.service';
import { SearchableAutocompleteComponent } from "../searchable-autocomplete/searchable-autocomplete.component";
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'app-address',
    standalone: true,
    imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    GooglePlacesAutocompleteComponent,
    SearchableAutocompleteComponent
],
    templateUrl: './address.component.html',
    styleUrl: './address.component.scss',
})
export class AddressComponent implements OnInit {
    @Input() public controlName: any;
    myControl = new FormControl();
    @Input() controlKey!: string;
    @Input() addressData: any = null;
    @Input() parentFormGroup!: FormGroup;
    @Input() AddressValid!:boolean;
    addressForm: FormGroup;
    states: any[] = [];
    cities: any[] = [];
    City:any[]=[];
    StateId: number | null = null;

    constructor(private fb: FormBuilder, private commonService: CommonService,) {
        this.addressForm = this.fb.group({
            Id: 0,
            AddressLine_1: ['', Validators.required],
            AddressLine_2: [''],
            Pincode: [''],
            City: [''],
            State: [''],
            Latitude: ['0'],
            Longitude: ['0'],
        });
        this.commonService.State$.subscribe((State) => {
            this.states = State;
          });
          
          this.commonService.City$.subscribe((City) => {
            this.City = City;
          });
    }
    
    numericOnly(event: { key: string }): boolean {
        let patt = /^([0-9])$/; 
        let result = patt.test(event.key);
        return result;
    }
    // handlePlaceChanged(palace: any) {
    //     console.log('palaces', palace);
    //     const location = palace.geometry.location;
    //     const latitude = location.lat();
    //     const longitude = location.lng();
    //     this.addressForm.patchValue({
    //         Latitude:latitude,
    //         Longitude:longitude
    //     })
    //     console.log("Latitude:", latitude, "Longitude:", longitude);
    // }
    handlePlaceChanged(place: any) {
        if (place && place.location) {
            this.addressForm.patchValue({
                // AddressLine_1: place.name || place.formatted_address,
                AddressLine_1: `${place.name}, ${place.formatted_address}` || place.name,
                Latitude: place.location.lat,
                Longitude: place.location.lng
            });
        }
    }
    async ngOnInit(): Promise<void> {
        // Sync initial data
        // if (this.addressData) {
        //   this.addressForm.patchValue(this.addressData);
        // }

        // Link addressForm to the parent form
       
        if (this.parentFormGroup) {
            this.parentFormGroup.setControl(
                this.controlKey ? this.controlKey : 'Address',
                this.addressForm
            );
            this.addressForm.valueChanges.subscribe(() => {
                // Trigger change detection in the parent form
                this.parentFormGroup.updateValueAndValidity();
            });
        } else {
            console.error(
                'Parent FormGroup or controlKey is missing in AddressComponent'
            );
        }
        // await Promise.all([
        //     Promise.resolve(this.getMasterState()),
        //     Promise.resolve(this.getMasterCity()),
        // ])
       
    }
    ngOnChanges(changes: SimpleChanges): void {
        // console.log('AddressValid',this.AddressValid)
    if (changes['AddressValid']) {
      if (this.AddressValid) {
        this.addressForm.controls["AddressLine_1"].clearValidators();
      } else {
        this.addressForm.controls["AddressLine_1"].setValidators(Validators.required);
      }
      this.addressForm.controls["AddressLine_1"].updateValueAndValidity();
    }
  }
    clearInput(Event:any) {
            this.addressForm.get('State')?.setValue('');
            this.addressForm.get('City')?.setValue('');
          }

//    getMasterState() {
//     this.commonService
//       .getApi(`MasterData/States`, {})
//       .pipe(debounceTime(300))
//       .subscribe((res: any) => {
//         this.states = res?.object?.data;
//         console.log("States Data:", this.states);
//       });
//   }

//   getMasterCity() {
//     this.commonService
//   .getApi(`RentalLocation/Cities`,{})
//   .pipe(debounceTime(300))
//   .subscribe((res: any) => {
//     this.City = res?.object?.data;
//   });
//   }

//   async getMasterCity(event: any) {
//     this.StateId = event?.Id; 
//     if (this.StateId) {
//       await this.commonService
//         .getApi(`MasterData/Cities/${this.StateId}`, { StateId: this.StateId })
//         .subscribe((res: any) => {
//           this.City = res?.object?.data;
//           console.log("City Data:", this.City);
//         });
//     }
//   }

@Input() set isDisabled(value:boolean){
    if(value){
    this.addressForm.disable();
}else{
    this.addressForm.enable()
}
}
}
