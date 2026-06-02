import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatTableComponent } from '../../shared/mat-table/mat-table.component';
import { MatCard } from '@angular/material/card';
import { Utils } from '../../utils';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../../core/service/auth.service';
import { CommonService } from '../../core/service/common.service';
import { EncryptionService } from '../../core/service/encryption.service';
import { UserService } from '../../core/service/user.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';

@Component({
  selector: 'app-points',
  standalone: true,
  imports: [MatTableComponent,MatCard],
  templateUrl: './points.component.html',
  styleUrl: './points.component.scss'
})
export class PointsComponent  extends Utils implements OnInit{

  CompanyId: any;
  isToggled: any;
    public action = {  add: false,edit:false,view:false };
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
          columnDef: 'User',
          header: 'User',
          cell: (element: any) => `${element?.FirstName}`,
        },
        {
          columnDef: 'PointsDetails',
          header: 'Points Details',
          cell: (element: any) => `${element.AvailablePoints}`,
        },
       
        // {
        //   columnDef: 'CreatedDate',
        //   header: 'Created Date',
        //   cell: (element: any) => `${element.CreatedAt}`,
        // },
        {columnDef: 'CreatedDate',header: 'Created Date',cell: (element: any) =>
          `${this.datePipe.transform(element.CreatedAt, 'MMM dd, yyyy') || ''}`},
        {
          columnDef: 'Status',
          header: 'Status',
          cell: (element: any) => `${element.StatusName}`,
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

