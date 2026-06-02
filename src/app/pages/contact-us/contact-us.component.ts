import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { CommonService } from '../../core/service/common.service';
import { EncryptionService } from '../../core/service/encryption.service';
import { UserService } from '../../core/service/user.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { Utils } from '../../utils';
import { MatTableComponent } from '../../shared/mat-table/mat-table.component';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [MatTableComponent,MatCard],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})
export class ContactUsComponent  extends Utils implements OnInit{

  CompanyId: any;
  isToggled: any;
    public action = {  add:false,edit:false,view:false };
  columns: any;
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
          columnDef: 'Email',
          header: 'Email',
          cell: (element: any) => `${element.Email}`,
        },
       
        {
          columnDef: 'Subject',
          header: 'Subject',
          cell: (element: any) => `${element.Subject}`,
        },
        {
          columnDef: 'Message',
          header: 'Message',
          cell: (element: any) => `${element.Message}`,
        },
      ];
    }


  ngOnInit(): void {
  }

   Toggleclass(value:any,mode:any){
      this.formMode = mode;

  if (mode === 'edit' || mode === 'view') {
    // Populate Bannerurls from the selected row's data
    // e.g., this.Bannerurls = value?.BannerUrls ?? [];
  } else if (mode === 'add') {
  }
    }

}
