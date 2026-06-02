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
  selector: 'app-orders',
  standalone: true,
  imports: [MatTableComponent,MatCard],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent  extends Utils implements OnInit{

  CompanyId: any;
  isToggled: any;
    public action = {  add: false,edit:true,view:true };
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
          columnDef: 'OrderId',
          header: 'Order Id',
          cell: (element: any) => `${element?.OrderNumber}`,
        },
        // {
        //   columnDef: 'OrderDate',
        //   header: 'OrderDate',
        //   cell: (element: any) => `${element.OrderDate}`,
        // },
        {columnDef: 'Order Date',header: 'OrderDate',cell: (element: any) =>
          `${this.datePipe.transform(element.CreatedAt, 'MMM dd, yyyy') || ''}`},
        {
          columnDef: 'UserId',
          header: 'User Id',
          cell: (element: any) => `${element.UserId}`,
        },
        // {
        //   columnDef: 'TotalQty',
        //   header: 'Total Qty',
        //   cell: (element: any) => `${element.TotalQty}`,
        // },
        {columnDef: 'TotalQty',header: 'Total Qty',cell: (element: any) =>
          `${element.OrderItems[0]?.Qty ? element.OrderItems[0]?.Qty : element.OrderItems[1]?.Qty}`,
        },
         {
          columnDef: 'TotalAmount',
          header: 'Total Amount',
          cell: (element: any) => `${element.TotalPoints}`,
        },
        {columnDef: 'Status',header: 'Status',cell: (element: any) =>
          `${element.Status?.StatusCode ? element.Status?.StatusCode : element.Status?.StatusCode}`,
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
