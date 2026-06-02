import {
    Component,
    Input,
    OnInit,
    SkipSelf,
    Output,
    EventEmitter,
    OnChanges,
    SimpleChanges,
    OnDestroy,
    ChangeDetectorRef,
    forwardRef,
    AfterViewInit,
    ViewChild,
    ElementRef,
} from '@angular/core';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import {
    FormGroup,
    FormBuilder,
    Validators,
    FormControl,
    AbstractControl,
    ControlContainer,
    FormGroupDirective,
    FormArrayName,
    ReactiveFormsModule,
    NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Utils } from '../../../utils';
import { CommonService } from '../../../core/service/common.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'CT-searchable-autocomplete',
    templateUrl: './searchable-autocomplete.component.html',
    styleUrl: './searchable-autocomplete.component.scss',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,MatIconModule,
        MatAutocompleteModule,
    ],
    viewProviders: [
        {
            provide: ControlContainer,
            useExisting: FormGroupDirective,
            useFactory: (container: ControlContainer) => container,
            deps: [[new SkipSelf(), ControlContainer]],
        },
    ],
    // providers: [
    //     {
    //         provide: NG_VALUE_ACCESSOR,
    //         useExisting: forwardRef(() => SearchableAutocompleteComponent),
    //         multi: true,
    //     },
    // ],
})
export class SearchableAutocompleteComponent
    extends Utils
    implements OnInit, OnChanges, OnDestroy,AfterViewInit
{
    public childForm: any;
    @Input() public options: any[] = [];
    public optionsAll: any[] = [];
    public filteredOptions: Observable<any[]> = of([]);
    public filteredOptionsArray: any[] = [];
    public toFilteredOptions!: Observable<any[]>;
    @Input() public selectedValue: any = '';
    myControl!: FormControl; // Declare without initializing
    @Input() label: string = 'Label';
    @Input() public controlName: any;
    @Input() public apiUrl!: string;
    @Input() controlLabel!: string;
    @Input() LabelValue:any={Value:'Id',Label:"Name"};
    @Input() public isFormGroup: boolean = false;
    @Input() public isReadOnly: boolean = false;
    @Input() public apiResultPath: string = '';
    @Input() public disableAutoSelect: boolean = false;
    @Input() ClearPreffermobile: boolean = false;
    @Input() ClearBranchSelected: boolean = false;
    @Input() formGroupParent!: FormGroup | any;
    @Input() resetSelection: boolean = false;
    showDeleteIcon: boolean = false;
    @Output() optionSelected = new EventEmitter<string>();
    @Output() dashboardBranchSelected = new EventEmitter<string>();
    @Output() optionSelectedSubVendor = new EventEmitter<string>();
    private subscription!: Subscription;
    keyinputchange: any;
    @ViewChild('autoInput') autoInput!: ElementRef<HTMLInputElement>;
    @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;
    static currentlyOpenPanel: MatAutocompleteTrigger | null = null;
    constructor(
        private cdr: ChangeDetectorRef,
        private commonServices: CommonService,
        private formBuilder: FormBuilder,
        private parentForm: FormGroupDirective
    ) {
        super();
        //this.controlName=
        // this.currencyForm = this.formBuilder.group({
        //   from: ['', Validators.required],
        //   to: ['', Validators.required],
        //   amount: ['', Validators.required],
        // });
    }

    // clearInput(event: any) {
    //     console.log('Clear icon clicked'); 
    //     this.childForm.get(this.controlName)?.setValue('');
        
    // }
    onSearchClick(event: Event) {
        event.stopPropagation();
        this.showDeleteIcon = this.isReadOnly?false:true; // Show the delete icon when input is clicked
        // this.getList()
    }
    
      clearInput(event: Event) {
        event.stopPropagation();
        this.myControl.setValue(''); // Clear the input value
        this.childForm?.controls[this.controlName].setValue('');
        this.showDeleteIcon = false; // Hide the delete icon after clearing
        if (this.ClearPreffermobile) {
         this.optionSelected.emit('');
        }
        this.optionSelectedSubVendor.emit('');
        if (this.ClearBranchSelected) {
          this.dashboardBranchSelected.emit('');
          this.optionSelected.emit('');
        }
        console.log('dashboardBranchSelected', this.dashboardBranchSelected);
      }
    // resetForm(){
    //     this.childForm.reset();
    //   }
    ngOnInit() {
        
        this.myControl = new FormControl(this.selectedValue || '');
        if (this.isFormGroup) {
            // this.controlName=tmpCtrlName[1];
            this.childForm = this.formGroupParent as FormGroup; //this.parentForm.form.get(tmpCtrlName[0])['controls'][this.groupArrayIndex];
        } else {
            // this.childForm = this.parentForm.form;
            if (this.parentForm?.form) {
                this.childForm = this.parentForm.form;
              } else {
                console.error('parentForm.form is undefined:', this.parentForm);
              }
        }
        // if (Array.isArray(this.options)) {
        // this.getList();
        // }
        // console.log(this.childForm);
        if (this.apiUrl && this.apiUrl !== '') {
            this.childForm?.controls[this.controlName].valueChanges.subscribe(
                (value: any) => {
                    this.selectedValue = value;
                    console.log('this.childForm', value, this.childForm.value);
                    if (value) this.autoSelect(value);
                }
            );
        }
        this.childForm?.controls[this.controlName].valueChanges.subscribe(
            (value: any) => {
             
                // console.log('closeicon', value, this.childForm.value);
                // if(!value)
                // this.clearInput();
                if(!value){
                    this.showDeleteIcon=false;
                    this.myControl.reset();
                    this.myControl.setValue('', { emitEvent: false });
                    this.childForm?.controls[this.controlName].setValue('', { emitEvent: false });
                }
            }
        );
        this.myControl.valueChanges.subscribe(value => {
            this.showDeleteIcon =this.isReadOnly?false: !!value; // Show icon if there's a value, hide otherwise
          });
    }
    onKeyInput(event: any) {
        // this.keyinputchange=event.target.value;
        console.log("Key Pressed:", event.target.value, this.optionsAll,this.filteredOptionsArray);
      }
    ngOnChanges(changes: SimpleChanges): void {
        if(!this.myControl)
            this.myControl = new FormControl(this.selectedValue || '');
        if (changes['options'] && changes['options'].currentValue) {
            this.optionsAll = [...changes['options'].currentValue];
            this.filteredOptionsArray=[...this.optionsAll]
            this.getList();
        }
        if (changes['apiUrl']) {
            const prev = changes['apiUrl'].previousValue;
            const curr = changes['apiUrl'].currentValue;
            console.log('🛠️ Detected change in input 111:', curr);
            if (prev !== curr) {
                console.log('🛠️ Detected change in input:', curr);
                this.getList();
            }
        }
        if (changes['resetSelection']?.currentValue === true) {
            this.resetControl();
          }
    }

    resetControl() {
        this.selectedValue = null;
      
        this.myControl?.setValue(null, { emitEvent: false });
        this.childForm?.controls[this.controlName]?.setValue(null, { emitEvent: false });
      
        this.showDeleteIcon = false;
      
        if (this.autocompleteTrigger?.panelOpen) {
          this.autocompleteTrigger.closePanel();
        }
      
        this.cdr.detectChanges();
      }

    ngAfterViewInit() {
        setTimeout(() => {
            this.getList();
          },200);
    }
    getList() {
        if (this.apiUrl && this.apiUrl !== '') {
            this.subscription = this.commonServices
                .getApi(this.apiUrl)
                .pipe(
                    switchMap((res: any) => {
                        this.options = this.getValueByPath(res, this.apiResultPath);
                        console.log('✅ API Response Processed:', this.options);
                        this.optionsAll = [...this.options];
                        
                        // Sort optionsAll in ascending order based on LabelValue.Label
                        this.optionsAll.sort((a, b) => {
                            const aLabel = a[this.LabelValue.Label].toLowerCase();
                            const bLabel = b[this.LabelValue.Label].toLowerCase();
                            return aLabel.localeCompare(bLabel);
                        });
    
                        if (this.filteredOptionsArray.length === 1 && !this.disableAutoSelect) {
                            const singleOption = this.filteredOptionsArray[0];
                            this.myControl.setValue(singleOption, { emitEvent: false });
                            this.childForm?.controls[this.controlName].setValue(singleOption[this.LabelValue.Value], { emitEvent: false });
                            this.selectedValue = singleOption[this.LabelValue.Value];
                            this.optionSelected.emit(singleOption);
                        }
                        
                        this.filteredOptions = this.search(
                            this.myControl,
                            this.optionsAll,
                            this.LabelValue.Label ? this.LabelValue.Label : 'Name'
                        );
                        
                        if (!(this.filteredOptions instanceof Observable)) {
                            console.warn('⚠️ search() is not returning an Observable');
                            return of([]); // Return empty array if invalid
                        }
    
                        return this.filteredOptions;
                    })
                )
                .subscribe({
                    next: (options: any) => {
                        // Sort the filtered options array in ascending order
                        this.filteredOptionsArray = [...options].sort((a, b) => {
                            const aLabel = a[this.LabelValue.Label].toLowerCase();
                            const bLabel = b[this.LabelValue.Label].toLowerCase();
                            return aLabel.localeCompare(bLabel);
                        });
                        this.optionsAll = [...this.filteredOptionsArray];
                        this.autoSelect();
                        this.cdr.detectChanges();
                    },
                    error: (err) => console.error('❌ API Error:', err),
                });
        } else if (Array.isArray(this.optionsAll)) {
            // Sort optionsAll in ascending order
            this.optionsAll.sort((a, b) => {
                const aLabel = a[this.LabelValue.Label].toLowerCase();
                const bLabel = b[this.LabelValue.Label].toLowerCase();
                return aLabel.localeCompare(bLabel);
            });
    
            this.filteredOptions = this.search(
                this.myControl,
                this.optionsAll,
                this.LabelValue.Label ? this.LabelValue.Label : 'Name'
            );
            
            this.autoSelect();
            
            if (this.filteredOptions instanceof Observable) {
                this.subscription = this.filteredOptions.subscribe((options) => {
                    // Sort the filtered options array in ascending order
                    this.filteredOptionsArray = [...options].sort((a, b) => {
                        const aLabel = a[this.LabelValue.Label].toLowerCase();
                        const bLabel = b[this.LabelValue.Label].toLowerCase();
                        return aLabel.localeCompare(bLabel);
                    });
                    
                    if (this.filteredOptionsArray.length === 1 && !this.disableAutoSelect) {
                        const singleOption = this.filteredOptionsArray[0];
                        this.myControl.setValue(singleOption, { emitEvent: false });
                        this.childForm?.controls[this.controlName].setValue(singleOption?.[this.LabelValue.Value], { emitEvent: false });
                        this.selectedValue = singleOption?.[this.LabelValue.Value];
                        this.optionSelected.emit(singleOption);
                    }
                    this.cdr.detectChanges();
                });
            } else {
                console.warn('⚠️ search() is not returning an Observable', this.filteredOptions);
            }
        }
    }
    // getList() {
    //     if (this.apiUrl && this.apiUrl !== '') {
    //         this.subscription = this.commonServices
    //             .getApi(this.apiUrl)
    //             .pipe(
    //                 switchMap((res: any) => {
    //                     this.options = this.getValueByPath(
    //                         res,
    //                         this.apiResultPath
    //                     );
    //                     console.log('✅ API Response Processed:', this.options);
    //                     this.optionsAll = [...this.options];
                        
    //                     if (this.filteredOptionsArray.length === 1 && !this.disableAutoSelect) {
    //                         const singleOption = this.filteredOptionsArray[0];
    //                         this.myControl.setValue(singleOption, { emitEvent: false });
    //                         this.childForm?.controls[this.controlName].setValue(singleOption[this.LabelValue.Value], { emitEvent: false });
    //                         this.selectedValue = singleOption[this.LabelValue.Value];
    //                         this.optionSelected.emit(singleOption);
    //                     }
    //                     // 🔹 Ensure search() returns an Observable
    //                     this.filteredOptions = this.search(
    //                         this.myControl,
    //                         this.options,
    //                         this.LabelValue.Label?this.LabelValue.Label:'Name'
    //                     );
    //                     if (!(this.filteredOptions instanceof Observable)) {
    //                         console.warn(
    //                             '⚠️ search() is not returning an Observable'
    //                         );
    //                         return []; // Return empty array if invalid
    //                     }

    //                     return this.filteredOptions;
    //                 })
    //             )
    //             .subscribe({
    //                 next: (options: any) => {
    //                     this.filteredOptionsArray = [...options];
    //                     this.optionsAll = [...options];
    //                     this.autoSelect();
    //                     this.cdr.detectChanges(); // ✅ Ensure UI updates properly
    //                 },
    //                 error: (err) => console.error('❌ API Error:', err),
    //             });
    //     } else if (Array.isArray(this.optionsAll)) {
    //         this.filteredOptions = this.search(this.myControl, this.optionsAll,this.LabelValue.Label?this.LabelValue.Label:'Name');
    //         this.autoSelect();
    //         if (this.filteredOptions instanceof Observable) {
    //             this.subscription = this.filteredOptions.subscribe(
    //                 (options) => {
    //                     this.filteredOptionsArray = [...options];
    //                     if (this.filteredOptionsArray.length === 1 && !this.disableAutoSelect) {
    //                         const singleOption = this.filteredOptionsArray[0];
    //                         this.myControl.setValue(singleOption, { emitEvent: false });
    //                         this.childForm?.controls[this.controlName].setValue(singleOption?.[this.LabelValue.Value], { emitEvent: false });
    //                         this.selectedValue = singleOption?.[this.LabelValue.Value];
    //                         this.optionSelected.emit(singleOption);
    //                     }
    //                     this.cdr.detectChanges();
    //                 }
    //             );
    //         } else {
    //             console.warn('⚠️ search() is not returning an Observable', this.filteredOptions);
    //         }
    //     }
    // }
    get displayFunc() {
        return (value: any) => {
            if (!value || !Array.isArray(this.optionsAll)) return '';
            const selectedOption = this.optionsAll.find(
                (opt) => opt?.[this.LabelValue.Value] === value
            );
            return selectedOption ? selectedOption[this.LabelValue.Label] : '';
        };
    }
    autoSelect(id?: any) {
        console.log(
            '🎯 Updated filteredOptions:',
            this.optionsAll,
            this.controlName,
            this.selectedValue,
            '===',
            id,
            '44==',
            this.childForm?.value[this.controlName]
        );

            if (Array.isArray(this.optionsAll)) {
                this.optionsAll.map((val: any) => {
                    if (
                        (this.childForm &&
                            this.childForm.value[this.controlName] == val[this.LabelValue.Value]) ||
                        (this.selectedValue && this.selectedValue == val[this.LabelValue.Value])
                    ) {
                        this.myControl.setValue(val, { emitEvent: false });
                        this.childForm?.controls[this.controlName].setValue(val?.[this.LabelValue.Value], { emitEvent: false });
                      
                      setTimeout(() => {
                          if (this.autocompleteTrigger && this.autocompleteTrigger.panelOpen) {
                              this.autocompleteTrigger.closePanel();
            
          }
        },100);
        this.cdr.detectChanges(); 
                       // Force UI update

                    }
                });
            }
      
    }
    checkSelected() {
        setTimeout(() => {
            if (
                !this.selectedValue ||
                this.selectedValue !== this.childForm.value[this.controlName]
            ) {
                console.log('resetting', this.controlName);
                let tmp: any = {};
                tmp[this.controlName] = '';
                this.childForm.patchValue({ ...tmp });
                this.selectedValue = '';
            }
        }, 200);
    }
    updateSelectedOption(event: any) {
        console.log('event.option.selected', event);
        let tmp: any = {};
        this.selectedValue = event[this.LabelValue.Value];
        tmp[this.controlName] = event[this.LabelValue.Value];
        this.childForm.patchValue({ ...tmp });
        //if(event.option.value.optionSelected)
        this.optionSelected.emit(event);
        // this.getList()
        // this.childForm.controls[this.controlName] = event.option.selected;
    }
    ngOnDestroy() {
        // if (SearchableAutocompleteComponent.currentlyOpenPanel === this.autocompleteTrigger) {
        //     SearchableAutocompleteComponent.currentlyOpenPanel = null;
        //   }
        this.subscription?.unsubscribe();
    }
    // onFocus() {
    //     // if (
    //     //   SearchableAutocompleteComponent.currentlyOpenPanel &&
    //     //   SearchableAutocompleteComponent.currentlyOpenPanel !== this.autocompleteTrigger
    //     // ) {
    //     //   SearchableAutocompleteComponent.currentlyOpenPanel.closePanel();
    //     // }
    
    //     // SearchableAutocompleteComponent.currentlyOpenPanel = this.autocompleteTrigger;
    //   }
    onBlur() {
        const currentValue = this.myControl.value;
        const controlvalue=this.childForm?.controls[this.controlName].value;
        const isValidOption = this.optionsAll.some(
            (opt) => opt[this.LabelValue.Value] === currentValue || opt[this.LabelValue.Value] === currentValue || opt[this.LabelValue.Value]===controlvalue
        );

        if (!isValidOption) {
            this.myControl.setValue('', { emitEvent: false });
            this.childForm?.controls[this.controlName].setValue('', { emitEvent: false });
            this.selectedValue = '';
            this.showDeleteIcon = false;
            this.cdr.detectChanges(); 
        }
       
        // console.log('clearcheck',this.myControl)
    }
    private _disabled = false;
    @Input() set disabled(value: boolean) {
  if (this.myControl) {
    value ? this.myControl.disable({ emitEvent: false }) : this.myControl.enable({ emitEvent: false });
  }
  this._disabled = value;
}
get disabled(): boolean {
  return this._disabled;
}

focusAndOpen() {
  setTimeout(() => {
    if (!this.isReadOnly) {
      this.autoInput?.nativeElement.focus();
      this.autocompleteTrigger?.openPanel();
    }
  }, 0);
}


}

