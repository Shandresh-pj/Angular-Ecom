import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Utils } from '../../utils';
import { MatTableComponent } from '../../shared/mat-table/mat-table.component';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/service/auth.service';
import { CommonService } from '../../core/service/common.service';
import { EncryptionService } from '../../core/service/encryption.service';
import { UserService } from '../../core/service/user.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { QuillComponent } from '../../shared/quill/quill.component';
import { environment } from '../../../environments/environment';
import { FileuploadComponent } from '../../shared/fileupload/fileupload.component';
import { MatOption, MatSelect } from '@angular/material/select';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-master-data',
  standalone: true,
  imports: [MatFormField,ReactiveFormsModule,MatFormField, MatLabel, MatTableComponent, MatCard,MatInput,          // ← was missing!
    MatSelect,         // ← for the Status dropdown
    MatOption,],
    templateUrl: './master-data.component.html',
    styleUrl: './master-data.component.scss'
  })
  // export class MasterDataComponent {
export class MasterDataComponent  extends Utils implements OnInit{
 
 CompanyId: any;
  isToggled: any;
    public action = {  add: true,edit:true,view:true,delete: true };
  columns: any;
  showMasterDataForm=false;
  masterdataForm!:FormGroup;
  formMode: any;
 masterdataurls: any[] = [];
  MasterDatafileName: any;
  MasterDataImageFile: any;
   deletedImage = false;
 @ViewChild('mattablechild') mattablechild!: MatTableComponent;
    constructor(
          private formBuilder: FormBuilder,
          public themeService: CustomizerSettingsService,
          private commonService: CommonService,
          private activatedRoute: ActivatedRoute,
          private authService:AuthService,
          private cdr: ChangeDetectorRef,
          private route: ActivatedRoute,
          private router: Router,
          public userService: UserService,
          private encryptionService: EncryptionService
      ) {
          super();
          this.masterdataForm = this.formBuilder.group({
            Id: [''],
            MasterType: ['', Validators.required],
            Code: ['', Validators.required],
            Value: ['', Validators.required],
            Position: [0, Validators.required],
            Status: ['Active', Validators.required],
          });
           this.themeService.isToggled$.subscribe((isToggled) => {
              this.isToggled = isToggled;
          });
  
          this.activatedRoute.queryParams.subscribe((params) => {
              const encryptedData = params['data'];
              this.CompanyId = params['company_id'] || 0;
              if (encryptedData) {
                  const decryptedObj =
                      this.encryptionService.decrypt(encryptedData);
                  console.log('Decrypted Params:', decryptedObj);
                  this.CompanyId = decryptedObj.company_id || 0;
              }
          });
  
          this.columns = [
            { columnDef: 'Id', header: 'ID', cell: (e: any) => e.Id },
            { columnDef: 'MasterType', header: 'Type', cell: (e: any) => e.MasterType },
            { columnDef: 'Code', header: 'Code', cell: (e: any) => e.Code },
            { columnDef: 'Value', header: 'Value', cell: (e: any) => e.Value },
            { columnDef: 'Position', header: 'Position', cell: (e: any) => e.Position },
            { columnDef: 'Status', header: 'Status', cell: (e: any) => e.Status },
          ];
    }

   ngOnInit(): void {
  }


 Toggleclass(value:any,mode:any){
      this.formMode = mode;
  this.showMasterDataForm = true; 

  if (mode === 'edit' || mode === 'view') {
    this.commonService.getApi(`MasterData/${value?.Id}`, {})
    .subscribe((res: any) => {
      const data = res?.data;
  
      this.masterdataForm.patchValue({
        Id: data.Id,
        MasterType: data.MasterType,
        Code: data.Code,
        Value: data.Value,
        Position: data.Position,
        Status: data.Status
      });
  
      if (mode === 'view') {
        this.masterdataForm.disable();
      }
    });
  } else if (mode === 'add') {
    this.masterdataForm.reset();

    this.masterdataForm.patchValue({
      Id: '',
      Title: '',
      Description: '',
      Image: ''
    });

    this.masterdataurls = [];
    this.MasterDataImageFile = null;
    this.MasterDatafileName = '';

    return;
  }
    }


onImageReceived(file: any) {
  this.MasterDataImageFile = file;
   this.deletedImage = false;
}
onDeleteImage(flag: boolean) {
  this.deletedImage = flag;
  if (flag) {
    this.MasterDataImageFile = null; 
  }
}

updateDescription(value: string) {
  // console.log('valuevaluevalue', value);
  this.masterdataForm.patchValue({
      Description: value,
  });
  // console.log('valuevaluevalues', this.masterdataForm.value);
}

onDelete(element: any): void {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You want to delete this master data?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#602F80',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      this.commonService.deleteApi(`MasterData/${element?.Id}`).subscribe({
        next: () => {
          Swal.fire({
            title: 'Deleted!',
            text: 'Master Data deleted successfully.',
            icon: 'success',
            confirmButtonColor: '#602F80'
          });
          this.mattablechild.getData();
        },
              error: (err) => {
                const errorMessage = err?.error?.message || 'Delete failed. Please try again.';
                Swal.fire({
                  title: 'Error!',
                  text: errorMessage,   
                  icon: 'error',
                  confirmButtonColor: '#602F80'
                });
                console.error('Delete failed:', err);
              }
      });
    }
  });
}

SubmitMasterDataForm(form: FormGroup) {
  if (form.valid) {

    const payload = {
      MasterType: form.value.MasterType,
      Code: form.value.Code,
      Value: form.value.Value,
      Position: form.value.Position,
      Status: form.value.Status
    };

    const apiRoute = 'MasterData';

    this.formDataSubmit(
      form.value.Id,
      payload,
      this.masterdataForm,
      apiRoute,
      {
        redirect: '/master-data',
        formInitialValues: {},
        commonService: this.commonService,
        router: this.router
      }
    ).then(() => {
      this.closeMasterDataForm();
    });

  } else {
    this.validateAllFormFields(form);
  }
}
closeMasterDataForm(){
  this.showMasterDataForm = false;
  this.formMode = '';
  this.masterdataurls = [];
  this.masterdataForm.enable();
   this.masterdataForm.reset();
}
}
