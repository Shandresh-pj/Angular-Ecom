import { DatePipe } from '@angular/common';
import {
    FormGroup,
    FormControl,
    AbstractControl,
    FormArray,
} from '@angular/forms';
import { rejects } from 'assert';
import moment from 'moment';
import { resolve } from 'path';
import { startWith, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment.development';
import { MatFormFieldAppearance } from '@angular/material/form-field';
// import { ToastrService } from '../shared/service/toastr.service';

export class Utils {
    public showLoader = false;
    public formInitialValues: any;
    public datePipe: DatePipe;
    public formFieldAppearance:MatFormFieldAppearance = environment.formFieldOutline ? 'outline' : 'fill'; 
    // private commonService: any;
    // private toastr: any;
    // private router: any;
    // private activatedRoute: any;
    // private customForm:any;
    //private Id:any;

    // private commonService: any;
    // private toastr: any;
    // private router: any;
    // private activatedRoute: any;
    // private customForm:any;
    //private Id:any;
    constructor() {
        //services?
        this.datePipe = new DatePipe('en-US');
        // this.routerDetails=services?.router?services.router:null;
        // this.activatedRouteDetails=services?.activatedRoute?services.activatedRoute:null;
        // this.commonServiceDetail=services?.commonService?services.commonService:null;
    }
    public tabValidate(
        form: FormGroup,
        formArray: string,
        field: string[] | string
    ) {
        console.log('form', form.controls[formArray]);
        const translations = (form.controls[formArray] as FormArray).controls;

        const TabIndex = translations.findIndex((e: any) => {
            console.log('EE', e.controls);
            if (Array.isArray(field)) {
                return field.some((fi) => e.controls[fi].errors?.['required']);
            } else {
                return e.controls[field]?.errors?.['required'];
            }
        });

        console.log('Index', TabIndex);

        return TabIndex !== -1 ? TabIndex : null;
    }
    public isFieldValid(
        form: FormGroup | AbstractControl,
        field: any,
        error: string
    ) {
        if (form instanceof FormGroup) {
            return (
                form.controls[field]?.hasError(error) &&
                (form.controls[field]?.dirty || form.controls[field]?.touched)
            );
        }
        // else if (form instanceof FormGroup) {
        //   return (
        //     form !== null && form.hasError(error) && (form.dirty || form.touched)
        //   );
        // }
        return false;
    }
    // public isFieldValid(form: FormGroup, field: any, error: string) {
    //   return (
    //     form.controls[field]?.hasError(error) &&
    //     (form.controls[field]?.dirty || form.controls[field]?.touched)
    //   );
    // }
    // public isFieldValid1(control: AbstractControl | null, error: string): boolean {
    //   return (
    //     control !== null &&
    //     control.hasError(error) &&
    //     (control.dirty || control.touched)
    //   );
    // }
    public validateAllFormFields(formGroup: FormGroup | FormArray) {
        Object.keys(formGroup.controls).forEach((field) => {
            const control = formGroup.get(field);

            if (control instanceof FormControl) {
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof FormGroup) {
                this.validateAllFormFields(control);
            } else if (control instanceof FormArray) {
                control.controls.forEach(
                    (formGroupControl: AbstractControl) => {
                        if (formGroupControl instanceof FormGroup) {
                            this.validateAllFormFields(formGroupControl);
                        } else if (formGroupControl instanceof FormControl) {
                            formGroupControl.markAsTouched({ onlySelf: true });
                        }
                    }
                );
            }
            
        });
         const firstInvalidElement = document.querySelector(
    '[formControlName].ng-invalid, [data-form-control].ng-invalid, mat-select.ng-invalid'
  ) as HTMLElement | null;

  if (firstInvalidElement) {
    setTimeout(() => {
        firstInvalidElement.focus();
        firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
    }

//   


// public validateAllFormFields(formGroup: FormGroup | FormArray): void {
//   const markAllAsTouched = (group: FormGroup | FormArray) => {
//     Object.values(group.controls).forEach(control => {
//       if (control instanceof FormControl) {
//         control.markAsTouched({ onlySelf: true });
//         // control.updateValueAndValidity();
//       } else if (control instanceof FormGroup || control instanceof FormArray) {
//         markAllAsTouched(control); 
//       }
//     });
//   };

//   markAllAsTouched(formGroup);

//   const firstInvalidElement = document.querySelector(
//     '[formControlName].ng-invalid, [data-form-control].ng-invalid, mat-select.ng-invalid'
//   ) as HTMLElement | null;

//   if (firstInvalidElement) {
//     setTimeout(() => {
//         firstInvalidElement.focus();
//         firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }, 100);
//   }
// }



    decimalToTime(decimal: number): string {
        if (decimal && decimal.toString().includes(':')) {
            decimal=this.timeToDecimal(decimal.toString())
        }
        const hours = Math.floor(decimal);
        const minutes = Math.round((decimal - hours) * 60);
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    timeToDecimal(time: string): number {
        
        let value = parseFloat(time);
        if (time && time.toString().includes(':')) {
            const [h, m] = time.split(':').map(Number);
            value = parseFloat((h + m / 60).toFixed(2));
        }
        value = isNaN(value) ? 0 : value;
        return value;
    }
    getFormValidationErrors(
        form: FormGroup | FormArray
    ): { controlPath: string; error: string; value: any }[] {
        const result: { controlPath: string; error: string; value: any }[] = [];

        const processControl = (control: AbstractControl, path: string) => {
            if (control.errors) {
                for (const key in control.errors) {
                    result.push({
                        controlPath: path,
                        error: key,
                        value: control.errors[key],
                    });
                }
            }

            if (control instanceof FormGroup) {
                Object.keys(control.controls).forEach((key) =>
                    processControl(
                        control.controls[key],
                        path ? `${path}.${key}` : key
                    )
                );
            } else if (control instanceof FormArray) {
                control.controls.forEach((ctrl, index) =>
                    processControl(ctrl, `${path}[${index}]`)
                );
            }
        };

        processControl(form, '');
        return result;
    }
    // public validateAllFormFields(formGroup: FormGroup) {
    //   Object.keys(formGroup.controls).forEach((field) => {
    //     const control = formGroup.get(field);
    //     if (control instanceof FormControl) {
    //       control.markAsTouched({ onlySelf: true });
    //     } else if (control instanceof FormGroup) {
    //       this.validateAllFormFields(control);
    //     }
    //   });
    // }

    public filter(value: string, options: any[], key?: string): any[] {
        const filterValue = value.toString().toLowerCase();
        console.log('optionsoptionsoptions', options, key);
        return options.filter(
            (option) =>
                option?.[key ? key : 'Name']
                    .toString()
                    .toLowerCase()
                    .indexOf(filterValue) === 0
        );
    }
    // public convertToIST(timeString: any) {
    // console.log("timeString",timeString)
    //   const date = new Date(timeString);

    //   date.setHours(date.getHours()-1);
    //   date.setMinutes(date.getMinutes());

    //   const istTime = date.toLocaleTimeString();
    //   return istTime;
    // }

    public priceFormat(
        amount: any,
        decimalCount: number = 2,
        decimal: any = '.',
        thousands: any = ','
    ) {
        //price = parseFloat(price);
        //return price.toFixed(2);
        try {
            decimalCount = Math.abs(decimalCount);
            decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

            const negativeSign = amount < 0 ? '-' : '';

            let i: any = parseInt(
                (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))
            ).toString();
            let j: any = i.length > 3 ? i.length % 3 : 0;

            return (
                negativeSign +
                (j ? i.substr(0, j) + thousands : '') +
                i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands) +
                (decimalCount
                    ? decimal +
                      Math.abs(amount - i)
                          .toFixed(decimalCount)
                          .slice(2)
                    : '')
            );
        } catch (e) {
            console.log(e);
            return '';
        }
    }
    public convertToFloatFormat(amount: any): number {
        // Remove commas and convert to number
        const numericValue =
            typeof amount === 'string'
                ? amount.toString().replace(/[^0-9.-]/g, '')
                : amount;

        // Convert to string with exactly 3 decimal places
        return parseFloat(parseFloat(numericValue).toFixed(2));
    }

    formatStringWithSpaces(value: string): string {
        // console.log("valuetttt",value)
        if(value=='ApprovalFlow'){
            value='ApprovalLevel'
        } else if(value=='CustomerExtraField'){
            value='AdditionalBookingField'
        }
        // console.log("aftervaluetttt",value)
        return value.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    public toPascalCase(input: string): string {
        return input
            .replace(
                /(\w)(\w*)/g,
                (_, firstLetter, rest) =>
                    firstLetter.toUpperCase() + rest.toLowerCase()
            )
            .replace(/\s+/g, ''); // Remove spaces
    }

    public convertFromUSD(timeString: any) {
        const date = new Date();
        if (timeString) {
            let timesp = timeString.split(':');
            if (timesp.length > 2)
                date.setHours(timesp[0], timesp[1], timesp[2]);

            date.setHours(date.getHours());
            date.setMinutes(date.getMinutes());
            console.log('time', date);
            const istTime = date.toLocaleTimeString();
            return istTime;
        }
        return '-';
    }
    public displayFunction(option?: any): string {
        return option && option.Name ? option.Name : '';
    }

    public search(control: AbstractControl, options: any[], key?: string): any {
        return control?.valueChanges.pipe(
            startWith(''),
            map((value) =>
                typeof value == 'object' && value != null ? value.Name : value
            ),
            map((name) =>
                name ? this.filter(name, options, key) : options.slice()
            )
        );
    }
    public getValueByPath(obj: any, path: string): any {
        return path.split('.').reduce((acc, key) => acc?.[key], obj);
    }
    public transformDate(value: any): string | null {
        if (!value) {
            console.error('Invalid date value:', value);
            return null;
        }

        const date = new Date(value);
        if (isNaN(date.getTime())) {
            console.error('Invalid date object:', value);
            return null;
        }

        const dateValue = this.datePipe.transform(date, 'yyyy-MM-dd');
        console.log('Transformed Date:', dateValue);
        return dateValue;
    }
    public uiDateFormat(value: any): string | null {
        if (!value) {
            console.error('Invalid date value:', value);
            return null;
        }

        const date = new Date(value);
        if (isNaN(date.getTime())) {
            console.error('Invalid date object:', value);
            return null;
        }

        const dateValue = this.datePipe.transform(date, 'dd/MM/yyyy');
        console.log('Transformed Date:', dateValue);
        return dateValue;
    }
    public getTimeFromDate(value: any): string {
        if (!value) return '-';

        const date = new Date(value);
        return isNaN(date.getTime())
            ? '-'
            : this.datePipe.transform(date, 'hh:mm:ss a') || '-';
    }

    /**
     * Check autocomplete have valid object as a input
     */
    // public checkAutocomplete(from: FormGroup, name, event, controls = "", controlname = "") {
    //   if (!event.relatedTarget || !event.relatedTarget.outerHTML.includes('mat-option')) {
    //     if (!controls && controls != '0') {
    //       if (typeof (from.get(name).value) == 'string')
    //         from.get(name).setValue('');
    //     } else {
    //       if (typeof ((from.get(name) as FormArray).controls[controls].controls[controlname].value) == 'string') {
    //         (from.get(name) as FormArray).controls[controls].controls[controlname].setValue('');
    //       }

    //     }

    //   }
    // }
    // public formDataSubmit(
    //   Id: any,
    //   form: any,
    //   customForm: any,
    //   url: any,
    //   services: any,
    //   anotherURL?:any,
    // ) {
    //   console.log("url",url)
    //   console.log("Id",Id)
    //   console.log('form', form);
    //   this.showLoader = true;
    //   if (Id == '' || Id == 0 || Id == null) {

    //     services.commonService?.postFormData(`${url}/Add`, form).subscribe(
    //       (res: any) => {
    //         this.showLoader = false;
    //         Swal.fire({

    //           icon: "success",
    //           title:"Added Successfully",
    //           showConfirmButton: false,
    //           timer: 1500,
    //            width:400,

    //         }).then(()=>{
    //           if(anotherURL){
    //             services.router.navigate([anotherURL.toLowerCase()]);
    //           }else{
    //             services.router.navigate([url.toLowerCase()]);
    //           }

    //           });

    //         services.toastr.openSnackBar(res['message'], 'X', 'green-snackbar');
    //         if (services.redirect) {
    //           console.log('services.redirect', services.redirect);
    //           services.router.navigate([services.redirect]);
    //         }
    //         if (services.formInitialValues) {
    //           customForm.reset(services.formInitialValues);
    //         } else {
    //           customForm.reset();
    //         }

    //       },
    //       (error: any) => {
    //         console.log('error', error);
    //         if (error.status == 500) {
    //           Swal.fire({
    //             icon: 'info',
    //             title: 'Oops...',
    //             text: 'Something went wrong !',
    //           })

    //         }
    //         this.showLoader = false;
    //         this.errorAlert(error);

    //       }
    //     );
    //   } else {
    //     services.commonService
    //       .postFormData(`${url}/Update/${Id}`, form)
    //       .subscribe(
    //         (res: any) => {
    //           Swal.fire({

    //             icon: "success",
    //             title:"Updated Successfully",
    //             showConfirmButton: false,
    //             timer: 2500,
    //              width:400,

    //           }).then(()=>{
    //             if(anotherURL){
    //               services.router.navigate([anotherURL.toLowerCase()]);
    //             }else{
    //               services.router.navigate([url.toLowerCase()]);
    //             }
    //             });

    //           this.showLoader = false;
    //           services.toastr.openSnackBar(res['message'], 'X', 'green-snackbar');

    //         },
    //         (error: any) => {
    //           if (error.status == 500) {
    //             Swal.fire({
    //               icon: 'info',
    //               title: 'Oops...',
    //               text: 'Something went wrong !',
    //             });
    //           }
    //           this.showLoader = false;
    //           this.errorAlert(error);

    //         }
    //       );
    //   }
    // }
    public formDataSubmit(
        Id: any,
        form: any,
        customForm: any,
        url: any,
        services: any,
        customUrl: boolean = false
    ) {
        return new Promise((resolve, reject) => {
            let queryParams: any = {};

            if (Id == '' || Id == 0 || Id == null) {
                services.commonService
                    ?.postFormData(`${url}/Add`, form)
                    .toPromise()
                    .then((res: any) => {
                        this.showLoader = false;

                        if (
                            typeof services.params === 'object' &&
                            Object.keys(services.params).length > 0
                        ) {
                            Object.keys(services.params).map((key: string) => {
                                const encryptedId = services.encryptionService.encrypt({ 
                                company_id: res.data.Id 
                            });
                                queryParams[key] = services.params[key].replace(
                                    '#ID#',
                                    // res.data.Id
                                    encryptedId
                                );
                            });
                        }
                        Swal.fire({
                            // position: "top-end",
                            icon: 'success',
                            title: 'Added Successfully',
                            showConfirmButton: false,
                            timer: 1500,
                            width: 400,
                        }).then(() => {
                            /// window.location.reload();
                            if (services.redirect && services.redirect != '') {
                                services.redirect = services.redirect.replace(
                                    '#ID#',
                                    res.data.Id ? res.data.Id : 10
                                );
                                console.log(
                                    'services.redirect=== ',
                                    services.redirect
                                );
                                services.router.navigate([services.redirect], {
                                    queryParams: queryParams,
                                });
                            }
                            resolve(res);
                        });
                        // Swal.fire('Added Successfully!').then(()=>{
                        //   services.router.navigate([url]);
                        // });
                        services.toastr.openSnackBar(
                            res['message'],
                            'X',
                            'green-snackbar'
                        );
                        if (services.redirect && services.redirect != '') {
                            services.redirect = services.redirect.replace(
                                '#ID#',
                                res.data.Id ? res.data.Id : 10
                            );
                            services.router.navigate([services.redirect]);
                        }
                        if (services.formInitialValues) {
                            customForm.reset(services.formInitialValues);
                        } else {
                            customForm.reset();
                        }
                        // this.dialogRef.close();
                    })
                    .catch((error: any) => {
                        console.log('error', error);
                        if (error.status == 500) {
                            Swal.fire({
                                icon: 'info',
                                title: 'Oops...',
                                text: 'Something went wrong !',
                            });
                            // .then(()=>{
                            //   services.router.navigate([url]);
                            // });;
                        }
                        this.showLoader = false;

                        this.errorAlert(error);
                        reject(error);
                        //  services.toastr.openSnackBar(error.error.message, 'X', 'red-snackbar');
                    });
            } else {
                services.commonService
                    .postFormData(`${url}/Update/${Id}`, form)
                    .toPromise()
                    .then((res: any) => {
                        if (
                            typeof services.params === 'object' &&
                            Object.keys(services.params).length > 0
                        ) {
                            Object.keys(services.params).map((key: string) => {
                                const encryptedId = services.encryptionService.encrypt({ 
                                company_id: Id 
                            });
                                queryParams[key] = services.params[key].replace(
                                    '#ID#',
                                    // Id
                                    encryptedId
                                );
                            });
                        }
                        Swal.fire({
                            // position: "top-end",
                            icon: 'success',
                            title: 'Updated Successfully',
                            showConfirmButton: false,
                            timer: 1500,
                            width: 400,
                        }).then(() => {
                            // window.location.reload();
                            if (services.redirect && services.redirect != '') {
                                services.router.navigate([services.redirect], {
                                    queryParams: queryParams,
                                });
                            }
                            resolve(res);
                        });

                        this.showLoader = false;
                        services.toastr.openSnackBar(
                            res['message'],
                            'X',
                            'green-snackbar'
                        );
                    })
                    .catch((error: any) => {
                        if (error.status == 500) {
                            Swal.fire({
                                icon: 'info',
                                title: 'Oops...',
                                text: 'Something went wrong !',
                            });
                        }
                        this.showLoader = false;
                        this.errorAlert(error);
                        reject(error);
                    });
            }
        });
    }
    public formSubmit(
        form: any,
        customForm: any,
        url: any,
        services: any,
        customUrl: boolean = false
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            this.showLoader = true;

            if (!form.value.Id) {
                form.value.Id = 0;
                services.commonService
                    ?.postApi(
                        `${url}${customUrl ? '' : '/Add'}`,
                        form.value ? form.value : form
                    )
                    .toPromise()
                    .then((res: any) => {
                        this.showLoader = false;
                        Swal.fire({
                            icon: 'success',
                            title: 'Added Successfully',
                            showConfirmButton: false,
                            timer: 2500,
                            width: 400,
                        }).then(() => {
                            resolve(res);
                        });

                        services.toastr.openSnackBar(
                            res['message'],
                            'X',
                            'green-snackbar'
                        );
                        customForm.reset(services.formInitialValues || {});
                    })
                    .catch((error: any) => {
                        this.showLoader = false;
                        this.errorAlert(error);
                        reject(error);
                    });
            } else {
                services.commonService
                    ?.postApi(`${url}/Update/${form.value.Id}`, form.value)
                    .toPromise()
                    .then((res: any) => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Updated Successfully',
                            showConfirmButton: false,
                            timer: 1500,
                            width: 400,
                        }).then(() => {
                            resolve(res);
                        });
                        this.showLoader = false;
                    })
                    .catch((error: any) => {
                        this.showLoader = false;
                        this.errorAlert(error);
                        reject(error);
                    });
            }
        });
    }

    public formSubmit6(
        form: any,
        customForm: any,
        url: any,
        services: any,
        customUrl: boolean = false
    ): any {
        console.log('url', url, form, form.value);
        let queryParams: any = {};
        this.showLoader = true;
        // let item=form;
        // const hasInvalidId =  !item.Id || item.Id == '' || item.Id == 0 || item.Id == null || item.Id == undefined;
        // console.log("hasInvalidId",hasInvalidId )
        if (
            form?.value?.Id == '' ||
            form?.value?.Id == 0 ||
            form?.value?.Id == null
        ) {
            delete form?.value?.Id ? form?.value?.Id : '';
            services.commonService
                ?.postApi(
                    `${url}${customUrl ? '' : '/Add'}`,
                    form.value ? form.value : form
                )
                .subscribe(
                    (res: any) => {
                        this.showLoader = false;
                        // services.redirect=services.redirect.replace("#ID#",res.data.Id?res.data.Id:10)
                        // console.log('services.redirect=== ',services.redirect )
                        // if(typeof services.params==='object' && Object.keys(services.params).length>0){
                        //   Object.keys(services.params).map((key:string)=>{
                        //     queryParams[key]=services.params[key].replace('#ID#',res.data.Id);
                        //   })
                        // }
                        Swal.fire({
                            // position: "top-end",
                            icon: 'success',
                            title: 'Added Successfully',
                            showConfirmButton: false,
                            timer: 2500,
                            width: 400,
                        }).then(() => {
                            // if (services.redirect && services.redirect!='') {
                            //   services.router.navigate([services.redirect], { queryParams:queryParams });
                            // }
                            // window.location.reload();
                            //   services.router.navigate([url.toLowerCase()]);
                        });
                        // Swal.fire('Added Successfully!').then(()=>{
                        //   services.router.navigate([url.toLowerCase()]);
                        // });
                        services.toastr.openSnackBar(
                            res['message'],
                            'X',
                            'green-snackbar'
                        );
                        // if (services.redirect && services.redirec!='') {
                        //   console.log('services.redirect', services.redirect);
                        //   services.router.navigate([services.redirect]);
                        // }
                        if (services.formInitialValues) {
                            customForm.reset(services.formInitialValues);
                        } else {
                            customForm.reset();
                        }
                        // this.dialogRef.close();
                    },
                    (error: any) => {
                        if (error.status == 500) {
                            Swal.fire({
                                icon: 'info',
                                title: 'Oops...',
                                text: 'Something went wrong !',
                            });
                            // .then(()=>{
                            //   services.router.navigate([url.toLowerCase()]);
                            // });;
                        }
                        this.showLoader = false;
                        this.errorAlert(error);
                        //Swal.fire(error.error.message);
                        // services.toastr.openSnackBar(error.error.message, 'X', 'red-snackbar');
                    }
                );
        } else {
            services.commonService
                .postApi(`${url}/${form.value.Id}`, form.value)
                .subscribe(
                    (res: any) => {
                        // if(typeof services.params==='object' && Object.keys(services.params).length>0){
                        //   Object.keys(services.params).map((key:string)=>{
                        //     queryParams[key]=services.params[key].replace('#ID#',form.value.Id);
                        //   })
                        // }
                        Swal.fire({
                            // position: "top-end",
                            icon: 'success',
                            title: 'Updated Successfully',
                            showConfirmButton: false,
                            timer: 1500,
                            width: 400,
                        }).then(() => {
                            // window.location.reload();
                            //  if (services.redirect && services.redirect!='') {
                            //   services.router.navigate([services.redirect], { queryParams:queryParams });
                            // }
                        });
                        // services.toastr.openSnackBar(res['message'], 'X', 'green-snackbar');

                        // Swal.fire('Edit Successfully!').then(()=>{
                        //   services.router.navigate([url.toLowerCase()]);
                        // });
                        this.showLoader = false;

                        //services.router.navigateByUrl(`/${url}`);
                        //this.customForm.reset();
                        // this.dialogRef.close();
                    },
                    (error: any) => {
                        if (error.status == 500) {
                            Swal.fire({
                                icon: 'info',
                                title: 'Oops...',
                                text: 'Something went wrong !',
                            });
                            // .then(()=>{
                            //   services.router.navigate([url.toLowerCase()]);
                            // });;;
                        }
                        this.errorAlert(error);
                        this.showLoader = false;
                        //Swal.fire(error.error.message);
                        // services.toastr.openSnackBar(error.error.message, 'X', 'red-snackbar');
                    }
                );
        }
    }
    public errorAlert(error: any) {
        let errorList = this.JsonToUlLi(error.error?.error);
        //Object.values(error.error?.error).join('\n')
        console.log('errorList', errorList);
        if (errorList == '') {
            errorList = error.error?.message;
        }
        Swal.fire('Error Occured', errorList);
    }

    public JsonToUlLi(arg: any): any {
        if (Object.keys(arg).length <= 0) return '';

        return `<ul>
      ${Object.keys(arg)
          .map((key: any) => {
              // Check if the current element is an array
              if (Array.isArray(arg[key])) {
                  // If the array contains objects, recursively process them
                  return arg[key]
                      .map((item: any) => {
                          if (item && typeof item === 'object') {
                              return `<li class="text-start text-danger">${this.JsonToUlLi(
                                  item
                              )}</li>`;
                          }
                          return `<li class="text-start text-danger">${item}</li>`;
                      })
                      .join('');
              }
              // If it's an object, recursively process it
              if (arg[key] && typeof arg[key] === 'object') {
                  return `<li class="text-start text-danger">${this.JsonToUlLi(
                      arg[key]
                  )}</li>`;
              }
              // Otherwise, handle as simple string/number
              return `<li class="text-start text-danger">${arg[key]}</li>`;
          })
          .join('')}
    </ul>`;
    }

    public getStatus() {
        return ['ACTIVE', 'INACTIVE'];
    }
    numericOnly(event: { key: string; }): boolean {    
        let patt = /^([0-9])$/;
        let result = patt.test(event.key);
        return result;
    }

    // getEditDetails(Id:any,customForm:any,services:any) {
    //   this.showLoader = true;
    //   services.commonService.getApi(`product/${Id}`, { edit: true }).subscribe(res => {
    //     const data = res['data'];
    //     data['IsTaxAllowed'] = data['IsTaxAllowed'].toString();
    //     data['IsAllowNegativeStock'] = data['IsAllowNegativeStock'].toString();
    //     this.showLoader = false;
    //     customForm.patchValue({
    //       ...data
    //     });
    //   });
    // }
}


// export function removeSpecialCharacters(str: string): string {
//     // Regular expression to remove everything except alphanumeric characters (A-Z, a-z, 0-9)
//     return str.replace(/[^a-zA-Z0-9]/g, '');
// }
export function removeSpecialCharacters(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // spaces → hyphen
    .replace(/[^a-z0-9-]/g, ''); // remove other special characters
}
export function splitCamelCase(text: string): string {
    return text.replace(/([a-z])([A-Z])/g, '$1 $2');
}
export function arrayObjectGroupBy<T>(
    array: T[],
    key: keyof T
): { [key: string]: T[] } {
    return array.reduce((result, currentValue) => {
        const groupKey = currentValue[key] as string;
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(currentValue);
        return result;
    }, {} as { [key: string]: T[] });
}

export function getIndianCurrency(number: number): string {
    const decimal = Math.round((number - Math.floor(number)) * 100);
    const no = Math.floor(number);
    const str: string[] = [];
    
    const words: { [key: number]: string } = {
      0: '', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five',
      6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten',
      11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen',
      15: 'Fifteen', 16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen',
      19: 'Nineteen', 20: 'Twenty', 30: 'Thirty', 40: 'Forty',
      50: 'Fifty', 60: 'Sixty', 70: 'Seventy', 80: 'Eighty', 90: 'Ninety'
    };
    const units = ['', 'Hundred', 'Thousand', 'Lakh', 'Crore'];
    const convertLessThanThousand = (num: number): string => {
      if (num === 0) return '';
      if (num < 20) return words[num];
      if (num < 100) return `${words[Math.floor(num / 10) * 10]} ${num % 10 ? words[num % 10] : ''}`.trim();
      return `${words[Math.floor(num / 100)]} Hundred${num % 100 ? ' and ' + convertLessThanThousand(num % 100) : ''}`.trim();
    };
    if (no === 0) str.push('Zero');
    else {
      const crores = Math.floor(no / 10000000);
      const lakhs = Math.floor((no % 10000000) / 100000);
      const thousands = Math.floor((no % 100000) / 1000);
      const hundreds = no % 1000;
      if (crores) str.push(`${convertLessThanThousand(crores)} ${units[4]}`);
      if (lakhs) str.push(`${convertLessThanThousand(lakhs)} ${units[3]}`);
      if (thousands) str.push(`${convertLessThanThousand(thousands)} ${units[2]}`);
      if (hundreds) str.push(convertLessThanThousand(hundreds));
    }
    const rupees = str.length ? `Rupees ${str.join(' ')}` : '';
    const paise = decimal ? ` and ${convertLessThanThousand(decimal)} Paise` : '';
    return `${rupees} ${paise} Only`.trim();
  }

  export function calculateHours(openDate: string,openTime: string,closeDate: string,closeTime: string): number {
        const start = moment(`${openDate} ${openTime}`);
        const end = moment(`${closeDate} ${closeTime}`);
        return end.diff(start, 'hours');
    }

    
