import {
    Component,
    ElementRef,
    EventEmitter,
    OnDestroy,
    OnInit,
    AfterViewInit,
    Output,
    ViewChild,
    Input,
    ChangeDetectorRef,
} from '@angular/core';
import {
    FormGroup,
    FormGroupDirective,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

declare let google: any;

@Component({
    selector: 'app-google-places-autocomplete',
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
    templateUrl: './google-places-autocomplete.component.html',
    styleUrl: './google-places-autocomplete.component.scss',
})
export class GooglePlacesAutocompleteComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('autocompleteInput', { static: true })
    autocompleteInput!: ElementRef<HTMLInputElement>;

    @Output() placeChanged: EventEmitter<any> = new EventEmitter();
    @Input() label: string = 'Search Buildings';
    @Input() controlName!: string; 
    @Input() selectedValue: string = '';
    @Input() isFormGroup: boolean = false;
    @Input() formGroupParent!: FormGroup;

    autocomplete!: any;
    listener: any;
    childForm!: FormGroup | any;
    private placeSelected = false;
    establishmentAutocomplete: any;
    addressAutocomplete: any;
    placeListener1: any;
    placeListener2: any;

    constructor(
        private cdRef: ChangeDetectorRef,
        private parentForm: FormGroupDirective
    ) {}

    ngOnInit(): void {
        if (!this.isGoogleLibExists()) {
            console.error('Google Maps Places library is not loaded.');
            throw new Error('Google Maps Places library is not loaded.');
        }

        this.childForm = this.isFormGroup ? this.formGroupParent : this.parentForm.form;

        this.childForm.get(this.controlName)?.valueChanges.subscribe((value: any) => {
            this.placeSelected = !!value;
            console.log('Form value changed:', value);
        });

        if (this.selectedValue) {
            this.childForm.get(this.controlName)?.setValue(this.selectedValue);
        }
    }

    // ngAfterViewInit(): void {
    //     const options = {
    //         // types: ['establishment', 'address'], 
    //         types: ['geocode'], // Alternative: broader address search
    //         componentRestrictions: { country: 'in' }, // Optional: restrict to a country
    //         fields: ['name', 'formatted_address', 'geometry', 'place_id'], 
    //     };

    //     try {
    //         this.autocomplete = new google.maps.places.Autocomplete(
    //             this.autocompleteInput.nativeElement,
    //             options
    //         );
    //         console.log('Autocomplete initialized:', this.autocomplete);

    //         this.listener = this.autocomplete.addListener('place_changed', () => {
    //             const place = this.autocomplete.getPlace();
    //             console.log('Place selected:', place);
    //             console.log('Geometry:', place.geometry);
    //             console.log('Location:', place.geometry?.location);
    //             console.log('Placesssssss:', place)

    //             if (!place.geometry || !place.geometry.location) {
    //                 console.warn('No geometry available for place:', place);
    //                 return;
    //             }

    //             const location = place.geometry.location;
    //             const lat = location.lat();
    //             const lng = location.lng();
    //             const placeData = {
    //                 name: place.name || '',
    //                 formatted_address: place.formatted_address || '',
    //                 location: {
    //                     lat: location.lat(),
    //                     lng: location.lng(),
    //                 },
    //                 place_id: place.place_id || '',
                   
    //             };
    //             console.log('Latitude:', location.lat());
    //             console.log('Longitude:', location.lng());
    //             console.log("name&formatadd", place.name, place.formatted_address)

    //             this.childForm.get(this.controlName)?.setValue(place.formatted_address || place.name);
    //             this.childForm.get(this.controlName)?.markAsTouched();
    //             this.placeSelected = true;
    //             this.cdRef.detectChanges();

    //             this.placeChanged.emit(placeData);
    //             console.log('Emitted place data:', placeData);
    //         });
    //     } catch (error) {
    //         console.error('Error initializing Autocomplete:', error);
    //     }
    // }

    // ngAfterViewInit(): void {
    //     try {
    //       const commonFields = [
    //         'name',
    //         'formatted_address',
    //         'geometry',
    //         'place_id',
    //         'types'
    //       ];
      
    //       this.establishmentAutocomplete = new google.maps.places.Autocomplete(
    //         this.autocompleteInput.nativeElement,
    //         {
    //           types: ['establishment'],
    //           componentRestrictions: { country: 'in' },
    //           fields: commonFields,
    //         }
    //       );
      
    //       this.addressAutocomplete = new google.maps.places.Autocomplete(
    //         this.autocompleteInput.nativeElement,
    //         {
    //           types: ['address'],
    //           componentRestrictions: { country: 'in' },
    //           fields: commonFields,
    //         }
    //       );
      
    //       const handlePlace = (autocomplete: google.maps.places.Autocomplete) => {
    //         const place = autocomplete.getPlace();
      
    //         if (!place || !place.geometry) return;
      
    //         const location = place.geometry.location;
    //         const isBusiness = place.types?.includes('establishment') ?? false;
      
    //         const placeData = {
    //           name: place.name || '',
    //           formatted_address: place.formatted_address || '',
    //           location: {
    //             lat: location?.lat(),
    //             lng: location?.lng(),
    //           },
    //           place_id: place.place_id || '',
    //           type: isBusiness ? 'BUSINESS' : 'ADDRESS',
    //         };
      
    //         this.childForm
    //           .get(this.controlName)
    //           ?.setValue(place.formatted_address || place.name);
      
    //         this.placeSelected = true;
    //         this.cdRef.detectChanges();
    //         this.placeChanged.emit(placeData);
    //       };
      
    //       this.placeListener1 = this.establishmentAutocomplete.addListener(
    //         'place_changed',
    //         () => handlePlace(this.establishmentAutocomplete)
    //       );
      
    //       this.placeListener2 = this.addressAutocomplete.addListener(
    //         'place_changed',
    //         () => handlePlace(this.addressAutocomplete)
    //       );
      
    //     } catch (error) {
    //       console.error('Autocomplete init failed:', error);
    //     }
    //   }      
ngAfterViewInit(): void {
  try {
    const fields= [
      'name',
      'formatted_address',
      'geometry',
      'place_id',
      'types'
    ];

    this.autocomplete = new google.maps.places.Autocomplete(
      this.autocompleteInput.nativeElement,
      {
        // allow both address + business
        types: ['geocode', 'establishment'],
        componentRestrictions: { country: 'in' },
        fields
      }
    );

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      if (!place?.geometry) return;

      const isBusiness = place.types?.includes('establishment') ?? false;

      const placeData = {
        name: place.name || '',
        formatted_address: place.formatted_address || '',
        location: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        },
        place_id: place.place_id || '',
        type: isBusiness ? 'BUSINESS' : 'ADDRESS'
      };

      this.childForm
        .get(this.controlName)
        ?.setValue(`${place.name}, ${place.formatted_address}` || place.name);

      this.placeSelected = true;
      this.placeChanged.emit(placeData);
      this.cdRef.detectChanges();
    });

  } catch (error) {
    console.error('Autocomplete init failed:', error);
  }
}

    ngOnDestroy(): void {
        if (this.listener) {
            google.maps.event.removeListener(this.listener);
            console.log('Listener removed');
        }
    }

    onInputChange(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.placeSelected = false;
        console.log('Input changed:', value);

        if (!value) {
            this.childForm.get(this.controlName)?.setValue('');
            this.childForm.get(this.controlName)?.markAsTouched();
        }
    }

    onBlur() {
        console.log('controlName',this.controlName)
        if (!this.placeSelected && this.controlName !=='PickupAddress') {
            this.childForm.get(this.controlName)?.setValue('');
            this.childForm.get(this.controlName)?.markAsTouched();
            console.log('Blur: Reset form value');
        }
    }

    private isGoogleLibExists(): boolean {
        const exists = !(!google || !google.maps || !google.maps.places);
        console.log('Google Maps Places library exists:', exists);
        return exists;
    }
}