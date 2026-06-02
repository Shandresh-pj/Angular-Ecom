import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Utils } from '../../utils';
import { MatTableComponent } from '../../shared/mat-table/mat-table.component';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/service/auth.service';
import { CommonService } from '../../core/service/common.service';
import { EncryptionService } from '../../core/service/encryption.service';
import { UserService } from '../../core/service/user.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { QuillComponent } from '../../shared/quill/quill.component';
import { BannerComponent } from '../banner/banner.component';

@Component({
  selector: 'app-app-slider-content',
  standalone: true,
  imports: [MatTableComponent,MatCard,MatIcon,MatFormField,MatInput,
    ReactiveFormsModule,MatLabel,QuillComponent,BannerComponent],
  templateUrl: './app-slider-content.component.html',
  styleUrl: './app-slider-content.component.scss'
})
export class AppSliderContentComponent extends Utils implements OnInit{
 CompanyId: any;
  isToggled: any;
    public action = {  add: true,edit:true,view:true };
  columns: any;
  showappsliderForm=false;
  appForm!:FormGroup;
  formMode: any;
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
           this.appForm = this.formBuilder.group({
         Id:[''],
         Page: ['', ],
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
          columnDef: 'Page',
          header: 'Page',
          cell: (element: any) => `${element?.Page}`,
        },
        {
          columnDef: 'Decription',
          header: 'Decription',
          cell: (element: any) => `${element.Decription}`,
        },
       
        {
          columnDef: 'CreatedIp',
          header: 'Created Ip',
          cell: (element: any) => `${element.CreatedIp}`,
        },
      ];
    }

   ngOnInit(): void {
  }


 Toggleclass(value:any,mode:any){
      this.formMode = mode;
  this.showappsliderForm = true; 

  if (mode === 'edit' || mode === 'view') {
    // Populate Bannerurls from the selected row's data
    // e.g., this.Bannerurls = value?.BannerUrls ?? [];
  } else if (mode === 'add') {
  }
    }

    
SubmitAppForm(form:FormGroup){

}
closeAppForm(){
  this.showappsliderForm = false;
  this.formMode = '';
}
}

