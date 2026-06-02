import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-cms',
  standalone: true,
  imports: [MatTableComponent,MatCard,MatIcon,MatFormField,MatInput,
    ReactiveFormsModule,MatLabel,QuillComponent,FileuploadComponent],
  templateUrl: './cms.component.html',
  styleUrl: './cms.component.scss'
})
export class CmsComponent  extends Utils implements OnInit{
 
 CompanyId: any;
  isToggled: any;
    public action = {  add: true,edit:true,view:true };
  columns: any;
  showCmsForm=false;
  cmsForm!:FormGroup;
  formMode: any;
 cmsurls: any[] = [];
  CMSfileName: any;
  CMSImageFile: any;
   deletedImage = false;
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
          this.cmsForm = this.formBuilder.group({
            Id: [''],
            Title: ['',Validators.required],
            Description: [''],
            Image: ['']
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
        {
          columnDef: 'ID',
          header: 'ID',
          cell: (element: any) => `${element?.Id}`,
        },
        {
          columnDef: 'Title',
          header: 'Title',
          cell: (element: any) => `${element?.Title}`,
        },
        {
          columnDef: 'Description',
          header: 'Description',
          width: '50px',
          cell: (element: any) => {
            const text = element.Description
              ? element.Description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
              : '';
        
            return text.length > 50 ? text.substring(0, 50) + '...' : text;
          }
        },
         {columnDef: 'UploadImage',header: 'Image',cell: (element: any) => `${element.UploadImage}`},
      ];
    }

   ngOnInit(): void {
  }


 Toggleclass(value:any,mode:any){
      this.formMode = mode;
  this.showCmsForm = true; 

  if (mode === 'edit' || mode === 'view') {
    this.commonService.getApi(`Cms/Detail/${value?.Id}`, {}).subscribe((res: any) => {
      const cmsEdit = res?.data?.data?.[0];
        const image = cmsEdit?.UploadImage?.trim() || '';
        this.cmsurls = image
        ? [`${environment.domain}/${image.replace(/\\/g, '/')}`]
        : [];
        this.CMSImageFile = null;
        this.cmsForm.patchValue({
        ...cmsEdit
      });
    });
         if (mode === 'view') {
                this.cmsForm.disable();
            }
  } else if (mode === 'add') {
    this.cmsForm.reset();

    this.cmsForm.patchValue({
      Id: '',
      Title: '',
      Description: '',
      Image: ''
    });

    this.cmsurls = [];
    this.CMSImageFile = null;
    this.CMSfileName = '';

    return;
  }
    }


onImageReceived(file: any) {
  this.CMSImageFile = file;
   this.deletedImage = false;
}
onDeleteImage(flag: boolean) {
  this.deletedImage = flag;
  if (flag) {
    this.CMSImageFile = null; 
  }
}

updateDescription(value: string) {
  // console.log('valuevaluevalue', value);
  this.cmsForm.patchValue({
      Description: value,
  });
  // console.log('valuevaluevalues', this.cmsForm.value);
}

SubmitCMSForm(form: FormGroup) {
  console.log('getPreviewImageFile',this.CMSImageFile,this.deletedImage)
  if (form.valid) {

    const formData = new FormData();

    if (this.CMSImageFile) {
      formData.append('UploadImage', this.CMSImageFile);
    }
     if (this.deletedImage) {
        formData.append('UploadImage', '');
        }

    formData.append('Title', form.value.Title);
    formData.append('Description', form.value.Description);

    const apiRoute = 'Cms';

    this.formDataSubmit(
      form.value.Id,
      formData,
      this.cmsForm,
      apiRoute,
      {
        redirect: '/cms',
        formInitialValues: {},
        commonService: this.commonService,
        router: this.router
      }
    ).then(() => {
      this.closeCMSForm();
    });

  } else {
    this.validateAllFormFields(form);
  }
}
closeCMSForm(){
  this.showCmsForm = false;
  this.formMode = '';
  this.cmsurls = [];
  this.cmsForm.enable();
   this.cmsForm.reset();
}
}
