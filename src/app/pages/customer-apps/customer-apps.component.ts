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
import { environment } from '../../../environments/environment';
import { FileuploadComponent } from '../../shared/fileupload/fileupload.component';
import Swal from 'sweetalert2';
import { MatOption } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-customer-apps',
  standalone: true,
  imports: [MatTableComponent,MatCard,MatIcon,MatFormField,MatInput,
    ReactiveFormsModule,MatLabel,FileuploadComponent , MatOption,  MatSelectModule,],
  templateUrl: './customer-apps.component.html',
  styleUrl: './customer-apps.component.scss'
})
export class CustomerAppsComponent   extends Utils implements OnInit{
   @ViewChild('mattablechild') mattablechild!: MatTableComponent;
 CompanyId: any;
  isToggled: any;
    public action = {  add: true,edit:true,view:true,delete: true };
  columns: any;
  showcustomerappsForm=false;
  customerappsForm!:FormGroup;
  formMode: any;
 customerappsurls: any[] = [];
  customerappsfileName: any;
  customerappsImageFile: any;
  deletedImage=false;
  GetInstall: any;
  GetCountry: any;
  GetState: any;
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
           this.customerappsForm = this.formBuilder.group({
         Id:[''],
         Title: ['', Validators.required],
          Url:[''],
          CountryId:[''],
          StateId:[''],
          InstallId:[''],
          })
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
        {
          columnDef: 'ID',
          header: 'ID',
          cell: (element: any) => `${element?.Id}`,
        },
        {
          columnDef: 'Uploaded By',
          header: 'Uploaded By',
          cell: (element: any) =>
            element?.CreatedByUser?.CompanyName || element?.CreatedByUser?.FirstName || '--',
        },
        {
          columnDef: 'Title',
          header: 'App Title',
          cell: (element: any) => `${element?.Title}`,
        },
        {
          columnDef: 'Url',
          header: 'Url',
          cell: (element: any) => `${element.Url}`,
        },
        {
          columnDef: 'Install Count',
          header: 'Install Count',
          cell: (element: any) =>
            element?.InstallCount ?? '--',
        },
        {
          columnDef: 'UploadImage',
          header: 'Image',
          cell: (element: any) => `${element?.UploadImage}`,
        },
        {
          columnDef: 'StatusToggle',
          header: 'Status',
          cell: (element: any) => element?.Status,
          statusOn:  'APPROVED',              // checked  = Approved
          statusOff: 'ACTIVE',               // unchecked = Active
          toggleUrl: 'CustomerApps/Update',  // ← this now gets picked up correctly
        },
      ];
    }

   ngOnInit(): void {
    this.getMasterData()
    this.getCountry()
    this.getState()
  }

  getMasterData(): void {
    this.commonService.getApi('MasterData/All', {}).subscribe({
        next: (res: any) => {
            const responseData = Array.isArray(res?.data?.data) ? res.data.data : [];

            this.GetInstall = responseData.filter((item: any) => item.MasterType === 'Install');
        },
        error: (err) => {
            console.error('Error fetching rental location data:', err);
        },
    });
}

getCountry(): void {
    this.commonService.getApi('Country/All', {}).subscribe({
        next: (res: any) => {
            const responseData = Array.isArray(res?.data?.data) ? res.data.data : [];

            this.GetCountry = responseData

        },
        error: (err) => {
            console.error('Error fetching rental location data:', err);
        },
    });
}

getState(): void {
    this.commonService.getApi('State/All', {}).subscribe({
        next: (res: any) => {
            const responseData = Array.isArray(res?.data?.data) ? res.data.data : [];

            this.GetState = responseData

        },
        error: (err) => {
            console.error('Error fetching rental location data:', err);
        },
    });
}

onViewsChange(viewId: any) {
  const selectedView = this.GetInstall.find((v: any) => v.Id == viewId);
  console.log('selectedView', selectedView);
  if (selectedView) {
      // this.VideosForm.patchValue({
      //     Price: selectedView.Value,
      // });
  }
}


  Toggleclass(value:any,mode:any){

    this.formMode = mode;
    this.showcustomerappsForm = true;
  
    if (mode === 'edit' || mode === 'view') {
  
      this.commonService
      .getApi(`CustomerApps/Detail/${value?.Id}`, {})
      .subscribe((res: any) => {
  
        const data = res?.data; 
  
        const image = data?.UploadImage?.trim() || '';
  
        this.customerappsurls = image
          ? [`${environment.domain}/${image.replace(/\\/g, '/')}`]
          : [];
  
        this.customerappsImageFile = null;
  
        this.customerappsForm.patchValue({
          ...data
        });
  
      });
       if (mode === 'view') {
                this.customerappsForm.disable();
            }
  
    } else if (mode === 'add') {
      this.customerappsForm.reset();

      this.customerappsForm.patchValue({
        Id: '',
        Title: '',
        Url: ''
      });
  
      this.customerappsurls = [];
      this.customerappsImageFile = null;
  
      return;
    }
  
  }

onImageReceived(file: any) {
  this.customerappsImageFile = file;
this.deletedImage = false;
}
onDeleteImage(flag: boolean) {
  this.deletedImage = flag;
  if (flag) {
    this.customerappsImageFile = null; 
  }
}

  onDelete(element: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this customer apps?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#602F80',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.commonService.deleteApi(`CustomerApps/Delete/${element?.Id}`).subscribe({
          next: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Customer Apps deleted successfully.',
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

SubmitCustomerAppsForm(form: FormGroup) {

  if (form.valid) {

    const formData = new FormData();

    if (this.customerappsImageFile) {
      formData.append('UploadImage', this.customerappsImageFile);
    }
    if (this.deletedImage) {
        formData.append('UploadImage', '');
        }

    formData.append('Title', form.value.Title);
    formData.append('Url', form.value.Url);
    formData.append('CountryId', form.value.CountryId);
    formData.append('StateId', form.value.StateId);
    formData.append('InstallId', form.value.InstallId);

    const apiRoute = 'CustomerApps';

    this.formDataSubmit(
      form.value.Id,
      formData,
      this.customerappsForm,
      apiRoute,
      {
        redirect: '/customer-apps',
        formInitialValues: {},
        commonService: this.commonService,
        router: this.router
      }
    ).then(() => {
      this.closeCustomerAppsForm();
    });

  } else {
    this.validateAllFormFields(form);
  }

}
closeCustomerAppsForm(){
  this.showcustomerappsForm = false;
  this.formMode = '';
  this.customerappsurls = [];
   this.customerappsForm.enable();
   this.customerappsForm.reset();
}
}
