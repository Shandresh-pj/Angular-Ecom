import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { CommonService } from '../../core/service/common.service';
import { EncryptionService } from '../../core/service/encryption.service';
import { UserService } from '../../core/service/user.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { Utils } from '../../utils';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatTableComponent } from '../../shared/mat-table/mat-table.component';
import { QuillComponent } from '../../shared/quill/quill.component';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [MatTableComponent,MatCard,MatIcon,MatFormField,MatInput,
        ReactiveFormsModule,MatLabel,QuillComponent],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss'
})
export class FeedbackComponent extends Utils implements OnInit{

 CompanyId: any;
  isToggled: any;
    public action = {  add: true,edit:true,view:true };
  columns: any;
  showfeedbackForm=false;
  feedbackForm!:FormGroup;
  formMode: any;
  feedbackdetails: any;
  apiRoute= 'FeedbackTestimonial';
  uiPagePath: any;
  feedbackurl= false;
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
           this.feedbackForm = this.formBuilder.group({
         Id:[''],
         Name: ['', Validators.required],
        Company:[''],
         Description: [''],
         Type:['']
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
          columnDef: 'Name',
          header: 'Name',
          cell: (element: any) => `${element?.Name}`,
        },
        {
          columnDef: 'Company',
          header: 'Company',
          cell: (element: any) => `${element.Company}`,
        },
       
        {
          columnDef: 'Description',
          header: 'Description',
         cell: (element: any) =>element.Description
                ? element.Description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g,' ',): '',
        },
      ];
    }

   ngOnInit(): void {
    this.feedbackurl=this.router.url.includes('feedback');
  }

  updateDescription(value: string) {
  this.feedbackForm.patchValue({
      Description: value,
  });
}

 Toggleclass(value:any,mode:any){
      this.formMode = mode;
  this.showfeedbackForm = true; 
     if (mode === 'edit' || mode === 'view') {
              this.commonService
                  .getApi(`FeedbackTestimonial/Detail/${value?.Id}`, {})
                  .subscribe((res: any) => {
                      this.feedbackdetails = res.data;
                      this.feedbackForm.patchValue({
                          ...this.feedbackdetails,
                      });
                  });
               if (mode === 'view') {
                  this.feedbackForm.disable();
              }
          } else if (mode === 'add') {
          }
    }

   
SubmitFeedbackForm(form:FormGroup){
  if (form.valid) {
    form.patchValue({
      Type:this.feedbackurl ? 'Feedback' : 'Testimonial'
    })
    
      this.formSubmit(form,this.feedbackForm, this.apiRoute, { redirect: '/' + this.uiPagePath, formInitialValues: this.formInitialValues, commonService: this.commonService, router: this.router })
        .then(() => {
          this.closeFeedbackForm();
        })
    } else {
      this.validateAllFormFields(form);
    }
}
closeFeedbackForm(){
  this.showfeedbackForm = false;
  this.formMode = '';
    this.feedbackForm.enable();
        this.feedbackForm.reset();
}

}
