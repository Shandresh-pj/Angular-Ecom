import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import html2canvas from 'html2canvas';
import { MatCheckboxModule } from '@angular/material/checkbox';
import jsPDF from 'jspdf';
import saveAs from 'file-saver';
import { CommonService } from '../../../core/service/common.service';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/service/auth.service';

export interface TableColumn {
    field: string; // Field in the data source
    header: string; // Displayed header
    editable: boolean; // Whether the column is editable
    type?: string;
    options?: any[];
    optionsDetail?: { label: string; value: string };
    isRequired?: boolean;
    customValidation?: string;
    isHidden?: boolean;
}

@Component({
    selector: 'app-pdf',
    templateUrl: './pdf.component.html',
    styleUrls: ['./pdf.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatTableModule,
        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatCardModule ,MatCheckboxModule
    ],
})
export class PdfComponent {

    isGeneratingPDF = false;
      userDetails: any;
    isGeneratingPDF1 = false;
    @Input() data: any | null = null; 
    Booker: any[] = [];
    @Input() RentalType: any | null = null; 
    @Input() Vehicles: any | null = null; 
    @Input() PaymentType: any | null = null; 
    isPlacardGenerating= false;
    constructor(
  public authService: AuthService,
      private commonService: CommonService,
  
  ) {
this.userDetails = this.authService.fetchUserDetails();

  }
    async generatePDF() {
        this.isGeneratingPDF = true;
      
        try {
         await this.getResourceList();
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const margin = 5;
      
          const dataArray = Array.isArray(this.data) ? this.data : [this.data];
      
          let firstPage = true;
          for (const data of dataArray) {
            if (!data) continue;
      
            const htmlContent = this.generateInvoiceHTML(data);
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px'; // Render off-screen
            // tempDiv.style.width = '210mm';
            // tempDiv.style.padding = '10mm';
            tempDiv.innerHTML = htmlContent;
            document.body.appendChild(tempDiv);
      
            // Ensure fonts/images are loaded
            await document.fonts.ready;
      
            const canvas = await html2canvas(tempDiv, {
              scale: 3,
              useCORS: true,
              logging: false,
              windowWidth: 794, // A4 width at 96 DPI
              windowHeight: 1123, // A4 height at 96 DPI
              backgroundColor: '#ffffff',
            });
      
            if (canvas.width === 0 || canvas.height === 0) {
              throw new Error('Canvas is empty');
            }
      
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pageWidth - 2 * margin;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
            if (!firstPage) pdf.addPage();
            firstPage = false;
      
            pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth, pdfHeight);
            document.body.removeChild(tempDiv);
          }
      
          pdf.save(`trip.pdf`);
        } catch (error) {
          console.error('Error generating PDF:', error);
        } finally {
          this.isGeneratingPDF = false;
        }
      }
      async PlankgeneratePDF() {
        this.isGeneratingPDF1 = true;
      
        try {
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const margin = 10;
      
          const dataArray = Array.isArray(this.data) ? this.data : [this.data];
   
          let firstPage = true;
          for (const data of dataArray) {
            if (!data) {
              console.error('Invalid booking data:', data);
              continue;
            }
      
            const htmlContent = this.PlankgenerateInvoiceHTML(data);
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = '210mm';
            // tempDiv.style.height = '297mm';
            // tempDiv.style.padding = '10mm';
            tempDiv.style.backgroundColor = '#ffffff';
            tempDiv.innerHTML = htmlContent;
            document.body.appendChild(tempDiv);
      
            // Wait for fonts and images to load
            await document.fonts.ready;
      
            const canvas = await html2canvas(tempDiv, {
              scale: 3,
              useCORS: true,
              logging: true,
              windowWidth: 794,
              windowHeight: 1123,
              backgroundColor: '#ffffff',
              scrollX: 0,
              scrollY: 0,
            });
      
            if (canvas.width === 0 || canvas.height === 0) {
              throw new Error('Canvas is empty');
            }
      
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pageWidth - 2 * margin;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
            if (!firstPage) {
              pdf.addPage();
            }
            firstPage = false;
      
            pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth, pdfHeight);
            document.body.removeChild(tempDiv);
          }
      
          pdf.save(`blank_trip.pdf`);
        } catch (error) {
          console.error('Error generating PDF:', error);
        } finally {
          this.isGeneratingPDF1 = false;
          console.log('isGeneratingPDF1', this.isGeneratingPDF1);
        }
      }
      PlankgenerateInvoiceHTML(data: any): string {
        const booking = data || {};
        const vendor = booking.VendorCompany || {};
        const branchAddress = `${vendor.Address?.AddressLine_1 || ''}, ${vendor.Address?.AddressLine_2 || ''}, ${vendor.Address?.City || ''}, ${vendor.Address?.State || ''} - ${vendor.Address?.Pincode || ''}`;
        const companyPhone = vendor.PhoneNumber || 'N/A';
        const companyEmail = vendor.Email || 'info@forzaenterprises.com';
     
    
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Invoice</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'DejaVu Sans', Verdana, sans-serif;
              font-size: 11px;
              color: #000;
              width: 210mm;
              height: 297mm;
              margin: 0 auto;
              padding: 10mm;
              background: #fff;
              position: relative;
            }
            
            a {
              color: #0087C3;
              text-decoration: none;
            }
            header {
              border-bottom: 1px solid #AAAAAA;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            header img {
              float: left;
              height: 36px;
              width: 185px;
            }
      
           
            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid gray;
              margin-top: 10px;
            }
            th, td {
              padding: 5px 8px;
              border: 1px solid gray;
              text-align: center;
            }
            th {
              font-weight: bold;
            
            }
            td.left-align {
              text-align: left;
            }
            .tabled{
              margin-left: 8.5%;
                margin-top: 2%;
                width: 100%;
              border:1px solid gray;
              border-right:0px !important;
              
            }
            #comments {
         
              font-weight: bold;
            }
            #signatures {
              margin-top:-20px;
              border-top: 1px solid gray;
              padding-top: 10px;
            }
            .signature-block {
              width: 50%;
              float: left;
              font-size: 11px;
            }
            .signature-block.right {
              float: right;
              text-align: right;
            }
            .signature-block img {
              max-height: 50px;
              width: 100%;
            }
      
            .vl {
              border-left: 1px solid gray;
              height: 216px;
              position: absolute;
              left: 4%;
              margin-left: 8.5%;
              margin-top: -1.7%;
            }
            .v2 {
              margin-top: -1.7%;
              border-left: 1px solid gray;
              height: 180px;
              position: absolute;
              left: 29.5%;
              margin-left:55%;
           
            }
            .addclit{ margin-top:-4%;}
            .tabled tr{ border:1px solid gray; font-size:11px !important;border-right:0px !important;}
            .park td{ padding-bottom: 18px;padding-top: 0px; }
            .park1 td{ padding-top: 5px; }
            .tabled tr td{ border-right:1px solid gray; font-size:11px !important; padding-bottom: 10px; height:20px;}
            .addressrepr{ height:80px;}
          
            #clients{ font-size: 11px; line-height: 20px; width: 23%;float: left;}
            #sndcolms{     text-align: left;
              margin-top: -20%;
              width: 50%;
              float: right;
              margin-right: 40%;line-height: 20px;font-size: 11px;}
              #trdcolms{     
                text-align: right;
                  margin-top: -20%;
                  width: 30%;
                  float: right;
                  margin-right: 16%;line-height: 20px;font-size: 11px;}
                
              #fothcolms{    
                text-align: left;
                  margin-top: -20%;
                  width: 35%;
                  float: right;
                  margin-right: -70%;
                  line-height: 20px;
                  font-size: 11px;} 
    
    
    
    .addressrepr{ height:80px;}
    
    
    main #detailss {
      margin-bottom: 15px;
      font-size:10px;
    }
    .tripinv{ font-size:10px !important;}
    #client {
      padding-left: 6px;
      border-left: 6px solid #0087C3;
      float: left;
    }
    #clients {
      float: left;
      line-height:20px;
    }
    
    #client .to {
      color: #777777;
    }
    
    h2.name {
      font-size: 1.4em;
      font-weight: normal;
      margin: 0;
    }
    
    
    table {
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;
      margin-bottom: 20px;
      border: 1px solid #ccc;
      font-size: 14px; 
    }
    
    
    table td {
      padding: 15px;
      background: #fff;
      text-align: center;
       font-size: 14px; 
      
    }
    table.ann_td td {
      padding: 15px;
      background: #fff;
      text-align: center;
      font-size: 22px; 
      color:#000;
      font-weight:bold; 
      
    }
    
    
    table.ann_td th {
      white-space: nowrap;        
      font-weight: normal;
      font-size: 22px;
      color:#000;
      font-weight:bold;
    }
    .back_bor td{
    border-bottom: 0px solid #ccc;
    background: #e0e0e0;
    }
    
    table th {
      white-space: nowrap;        
      font-weight: normal;
      font-size: 14px;
    }
    
    table td {
      text-align: right;
    }
    
    table td h3{
      color: #57B223;
      font-size: 1.2em;
      font-weight: normal;
      margin: 0 0 0.2em 0;
    }
    
    table .no {
      color: #FFFFFF;
      font-size: 1.6em;
      background: #57B223;
    }
    
    table .desc {
      text-align: left;
    }
    
    table th {
        padding: 5px 20px;
        color: #5D6975;
        border-bottom: 1px solid #C1CED9;
        white-space: nowrap;
        font-weight: normal;
    }
    
    table tfoot td {
      padding: 10px 20px;
      background: #FFFFFF;
      border-bottom: none;
      font-size: 1.2em;
      white-space: nowrap; 
      border-top: 1px solid #AAAAAA; 
    }
    
    table tfoot tr:first-child td {
      border-top: none; 
    }
    
    table tfoot tr:last-child td {
      color: #57B223;
      font-size: 1.4em;
      border-top: 1px solid #57B223; 
    
    }
    
    table tfoot tr td:first-child {
      border: none;
    }
    
    table tr:nth-child(2n-1) td {
      background: #F5F5F5;
    }
    
    table th,
    table td {
      text-align: left;
    }
    
    table th {
      padding: 5px 20px;
      color: #000000;
      /* color: #5D6975; */
      border-bottom: 1px solid #C1CED9;
      white-space: nowrap;        
      font-weight: bold;
    }
    
    table .service,
    table .desc {
      text-align: left;
    }
    
    table td {
      padding: 15px;
      text-align: left;
    }
    
    table td.service,
    table td.desc {
      vertical-align: top;
    }
    
    .v3 {
        border-left: 1px solid gray;
        height: 216px;
        position: absolute;
        left: 4%;
        
        margin-left: 18.5%;
        margin-bottom: -1.7%;
      }
      .v4 {
        margin-top: -1.7%;
        border-left: 1px solid gray;
        height: 180px;
        position: absolute;
        left: 29.5%;
        margin-left:55%;
     
      }
    
    table td.grand {
      border-top: 1px solid #5D6975;
    
    }
    #fivthcolms{    
        margin-top: -6%;
          float: left;
          font-size: 11px;}
      #seixcolms{
        margin-top: 6.8%;
      }
    #comments{    
        margin-top: -30%;
          float: left;
          font-size: 11px;}
    
    #clients{ font-size: 11px; line-height: 20px; width: 23%;float: left;}
    #signatures {
        display: flex;
        justify-content: space-between;
        gap: 20px;
    
      }
    
      .signature-block {
        flex: 1;
        border-left: 1px solid #ccc;
        border-right: 1px solid #ccc;
      
        text-align: center;
      }
    
      .signature-block img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 10px auto;
      }
          </style>
        </head>
        <body>
          <header class="clearfix">
          <img style="height: 36px; width: 185px;" 
          src="Logo/TRYPDEKLOGO2.png" 
          class="transition position-relative" 
          alt="logo-icon" />
            <div style="float: right;
            text-align: right;
            line-height: 14px;">
              <div>FORZA ENTERPRISES PVT.LTD</div>
              <div>${branchAddress}</div>
              <div>${companyPhone}</div>
              <div><a href="mailto:${companyEmail}">${companyEmail}</a> / <a href="http://www.forzaenterprises.com">www.forzaenterprises.com</a></div>
            </div>
          </header>
          <main>
            <div id="details" class="clearfix">
              <div id="clients">          
              <div class="addclit"> Client</div>
              <div class="address"> Booked By</div>
              <div class="addressrepr">Report To</div>
              <div class="addressph"> Phone   </div>
              
              </div>
          <div class="vl"></div>
          <div id="sndcolms" class="">
         
                <div class=""></div>
                 <div style="line-height: 20px;height:90px;"></div>
              <div style="line-height: 10px;"></div>
              </div>
          <div id="trdcolms" class="clearfix">
                <div style="">Date:</div>
                <div style="">Duty Slip No:</div>
                <div class="">Reporting Time:</div>
                <div class="">Rental Type:</div>
                <div class="">Vehicle No:</div>
                <div class="">Vehicle Type:</div>
                <div class="">Customer Executive:</div>
                <div class="">Mobile No:</div>
              </div>
              <div class="v2"></div>
              <div id="fothcolms">
                <div style=""> </div>
                <div style=""></div>
                <div class=""></div>
                <div class=""></div>
                <div class=""></div>
                <div class=""></div>
                <div class=""></div>
                <div class=""></div>
              </div>
      
          
          </div>
            <table class="tabled" style="margin-top:15px;">
            <thead>
              <tr>
                <th style="margin-bottom: -5px;border-right:1px solid gray;"></th>
                <th style="margin-bottom: -5px;border-right:1px solid gray;">Opening </th>
                <th style="margin-bottom: -5px;border-right:1px solid gray;">Closing</th>
                <th style="margin-bottom: -5px;border-right:1px solid gray;">Total</th>
                <th style="margin-bottom: -5px;border-right:1px solid gray;"></th>   
              </tr>
            </thead>
            <tbody>
              <tr class="park1">
                <td  align="center"  style="width:15%" vertical-align="middle">Date</td>
                <td  align="center"  style="width:20%" vertical-align="middle"></td>
                <td  align="center"  style="width:20%" vertical-align="middle"></td>
                <td  align="center" style="width:15%" vertical-align="middle"></td>
                <td class="" style="text-align: left;padding-top: 0px;color:gray;width:30%">Guest Releasing Place</td>
              </tr>
              <tr class="park1">
                <td class="">Time</td>
                <td class=""></td>
                <td class=""></td>
                <td class=""></td>
                <td class="" style="text-align: left;padding-top: 0px;color:gray;">Guest Releasing Time</td>
              </tr>
              <tr class="park1">
                <td class="">Kilometer</td>
                <td class=""></td>
                <td class=""></td>
                <td class=""></td>
                <td class="" valign="top" style="text-align: left;padding-top: 0px;color:gray;">Guest Releasing Kms</td>
              </tr>
              <tr class="park">
                <td colspan="2" style="text-align: left;">Parking/Toll/Permit/Bata</td>
                <td class="">Extra Hours</td>
                <td class="">Extra Kilometers</td>
                <td colspan="" class="">Mode of Payment<p></p></td>
              </tr>
              <tr class="back_bors" style="border-bottom:0px !important;">
                <td colspan="5" style="padding-left:1px;text-align: left;padding-top: 0px;float:left;"></td>
              </tr>		  
            </tbody>
        
          </table>
           <div id="fivthcolms">Comments</div>
         
        
            <div id="signatures" class="clearfix">
      <div >
        <strong>For Forza Enterprises Pvt. Ltd</strong>
      </div>
      
      <div class="signature-block">
        <strong>Customer Next Requirements</strong>
      </div>
      
      <div >
     
        <strong>Guest Signature</strong><br>
        Guest Feedback / Suggestions
      </div>
    </div>
          </main>
        
        </body>
        </html>
        `;
      }
      getResourceList() {
        let params = new HttpParams();
        params = params.append('CompanyId', this.data?.CustomerCompanyParentId);
        
        return new Promise((resolve, reject) => {
            this.commonService.getApi('Employees/All', params).subscribe({
                next: (res: any) => {
                  this.Booker = res.object.data;
                    console.log('Bookers loaded:', this.Booker);
                    resolve(this.Booker);
                },
                error: (err) => {
                    console.error('Error loading bookers:', err);
                    this.Booker = []; // Fallback to empty array
                    reject(err);
                }
            });
        });
    }
      generateInvoiceHTML(data: any): string {
       console.log('this.Bookerthis.Booker',this.userDetails ,)
        const booking = data || {};
        const Bookername = this.Booker.find((booker: any) => booker.Id == booking.BookerId);
       const PaymentTypeName =  this.PaymentType.find((Payment: any) => Payment.Id == booking.PaymentTypeMasterId);
       const RentalTypeName =  this.RentalType.find((rental: any) => rental.Id == booking.RentalTypeMasterId);
       const VehiclesName =  this.Vehicles.find((rental: any) => rental.Id == booking.VehicleModelId);

       const customer = booking.CustomerCompany || {};
        const vendor = booking.VendorCompany || {};
        const driver = booking.Driver || {};
        const vehicle = booking.Vehicle || {};
        const guest = booking.GuestDetails && booking.GuestDetails.length > 0 ? booking.GuestDetails[0] : {};
    
        const branchAddress = `${vendor.Address?.AddressLine_1 || ''}, ${vendor.Address?.AddressLine_2 || ''}, ${vendor.Address?.City || ''}, ${vendor.Address?.State || ''} - ${vendor.Address?.Pincode || ''}`;
        const companyPhone = vendor.PhoneNumber || '';
        const companyEmail = vendor.Email || '';
        const dutyType = RentalTypeName.Value ;
        const pickupDate = booking.PickupDate || 'N/A';
        const tripId = booking.BookingNumber || 'N/A';
        const reportTime = booking.PickupTime || 'N/A';
        const vehicleNo = vehicle.Number || 'N/A';
        const vehicleModel = VehiclesName?.Name ;
        const driverName = `${driver.FirstName || ''} ${driver.LastName || ''}`.trim();
        const driverPhone = driver.Mobile || 'N/A';
        const startTime = booking.StartTime || 'N/A';
        const closeDate = booking.EndDate || 'N/A';
        const closeTime = booking.EndTime || 'N/A';
        const totalHrs =  booking?.Bill?.TotalHrs || '-';
        const openKm = booking?.Bill?.OpenKMS || '-'; 
        const closeKm = booking?.Bill?.CloseKMS || '-';
        const totalKm = booking?.Bill?.TotalKMS || '-';
        const payType = PaymentTypeName?.Value;
        const username = this.userDetails.UserType =='RootUser' ? 'Super Admin': this.userDetails.UserType
        const comments = booking?.Instruction || 'No comments';
const Guuestsign = `${environment.domain}/${booking?.Documents[0]?.FilePath}`;
const now = new Date();
const formattedDateTime = now.toLocaleString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});
console.log('Guuestsign',Guuestsign)
console.log("uservvvvvvv", this.userDetails)
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Invoice</title>
          <style>
          
            #pdf-content {
              font-family: 'DejaVu Sans', Verdana, sans-serif;
              font-size: 11px;
              color: #000;
              width: 210mm;
              height: 297mm;
              margin: 0 auto;
              padding: 10mm;
              background: #fff;
              position: relative;
            }
            
            a {
              color: #0087C3;
              text-decoration: none;
            }
            header {
              border-bottom: 1px solid #AAAAAA;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            header img {
              float: left;
              height: 36px;
              width: 185px;
            }
      
           
            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid gray;
              margin-top: 10px;
            }
            th, td {
              padding: 5px 8px;
              border: 1px solid gray;
              text-align: center;
            }
            th {
              font-weight: bold;
            
            }
            td.left-align {
              text-align: left;
            }
            .tabled{
              margin-left: 8.5%;
                margin-top: 2%;
                width: 100%;
              border:1px solid gray;
              border-right:0px !important;
              
            }
            #comments {
            margin-top:30px;
              // font-weight: bold;
            }
            #signatures {
            
              border-top: 1px solid gray;
              padding-top: 10px;
            }
            .signature-block {
              width: 50%;
              float: left;
              font-size: 11px;
            }
            .signature-block.right {
              float: right;
              text-align: right;
            }
            .signature-block img {
              max-height: 50px;
              width: 100%;
            }
      
            .vl {
              border-left: 1px solid gray;
              height: 216px;
              position: absolute;
              left: 4%;
              margin-left: 8.5%;
              margin-top: -1.7%;
            }
            .v2 {
              margin-top: -1.7%;
              border-left: 1px solid gray;
              height: 180px;
              position: absolute;
              left: 29.5%;
              margin-left:55%;
           
            }
            .addclit{ margin-top:-4%;}
            .tabled tr{ border:1px solid gray; font-size:11px !important;border-right:0px !important;}
            .park td{ padding-bottom: 18px;padding-top: 0px; }
            .park1 td{ padding-top: 5px; }
            .tabled tr td{ border-right:1px solid gray; font-size:11px !important; padding-bottom: 10px; height:20px;}
            .addressrepr{ height:80px;}
          
            #clients{ font-size: 11px; line-height: 20px; width: 23%;float: left;}
            #sndcolms{     text-align: left;
              margin-top: -20%;
              width: 50%;
              float: right;
              margin-right: 40%;line-height: 20px;font-size: 11px;}
              #trdcolms{     
                text-align: right;
                  margin-top: -20%;
                  width: 30%;
                  float: right;
                  margin-right: 16%;line-height: 20px;font-size: 11px;}
                
              #fothcolms{    
                text-align: left;
                  margin-top: -20%;
                  width: 35%;
                  float: right;
                  margin-right: -70%;
                  line-height: 20px;
                  font-size: 11px;} 
    
    
    
    .addressrepr{ height:80px;}
    
    
    main #detailss {
      margin-bottom: 15px;
      font-size:10px;
    }
    .tripinv{ font-size:10px !important;}
    #client {
      padding-left: 6px;
      border-left: 6px solid #0087C3;
      float: left;
    }
    #clients {
      float: left;
      line-height:20px;
    }
    
    #client .to {
      color: #777777;
    }
    
    h2.name {
      font-size: 1.4em;
      font-weight: normal;
      margin: 0;
    }
    
    
    table {
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;
      margin-bottom: 20px;
      border: 1px solid #ccc;
      font-size: 14px; 
    }
    
    
    table td {
      padding: 15px;
      background: #fff;
      text-align: center;
       font-size: 14px; 
      
    }
    table.ann_td td {
      padding: 15px;
      background: #fff;
      text-align: center;
      font-size: 22px; 
      color:#000;
      font-weight:bold; 
      
    }
    
    
    table.ann_td th {
      white-space: nowrap;        
      font-weight: normal;
      font-size: 22px;
      color:#000;
      font-weight:bold;
    }
    .back_bor td{
    border-bottom: 0px solid #ccc;
    background: #e0e0e0;
    }
    
    table th {
      white-space: nowrap;        
      font-weight: normal;
      font-size: 14px;
    }
    
    table td {
      text-align: right;
    }
    
    table td h3{
      color: #57B223;
      font-size: 1.2em;
      font-weight: normal;
      margin: 0 0 0.2em 0;
    }
    
    table .no {
      color: #FFFFFF;
      font-size: 1.6em;
      background: #57B223;
    }
    
    table .desc {
      text-align: left;
    }
    
    table th {
        padding: 5px 20px;
        color: #5D6975;
        border-bottom: 1px solid #C1CED9;
        white-space: nowrap;
        font-weight: normal;
    }
    
    table tfoot td {
      padding: 10px 20px;
      background: #FFFFFF;
      border-bottom: none;
      font-size: 1.2em;
      white-space: nowrap; 
      border-top: 1px solid #AAAAAA; 
    }
    
    table tfoot tr:first-child td {
      border-top: none; 
    }
    
    table tfoot tr:last-child td {
      color: #57B223;
      font-size: 1.4em;
      border-top: 1px solid #57B223; 
    
    }
    
    table tfoot tr td:first-child {
      border: none;
    }
    
    table tr:nth-child(2n-1) td {
      background: #F5F5F5;
    }
    
    table th,
    table td {
      text-align: left;
    }
    
    table th {
      padding: 5px 20px;
      color: #000000;
      /* color: #5D6975; */
      border-bottom: 1px solid #C1CED9;
      white-space: nowrap;        
      font-weight: bold;
    }
    
    table .service,
    table .desc {
      text-align: left;
    }
    
    table td {
      padding: 15px;
      text-align: left;
    }
    
    table td.service,
    table td.desc {
      vertical-align: top;
    }
    
    .v3 {
        border-left: 1px solid gray;
        height: 216px;
        position: absolute;
        left: 4%;
        
        margin-left: 18.5%;
        margin-bottom: -1.7%;
      }
      .v4 {
        margin-top: -1.7%;
        border-left: 1px solid gray;
        height: 180px;
        position: absolute;
        left: 29.5%;
        margin-left:55%;
     
      }
    
    table td.grand {
      border-top: 1px solid #5D6975;
    
    }
    #fivthcolms{    
        margin-top: -6%;
          float: left;
          font-size: 11px;}
      #seixcolms{
        margin-top: 6.8%;
      }
    #comments{    
        margin-top: -30%;
          float: left;
          font-size: 11px;}
    
    #clients{ font-size: 11px; line-height: 20px; width: 23%;float: left;}
    #signatures {
        display: flex;
        justify-content: space-between;
        gap: 20px;
    
      }
    
      .signature-block {
        flex: 1;
        border-left: 1px solid #ccc;
        border-right: 1px solid #ccc;
      
        text-align: center;
      }
    
      .signature-block img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 10px auto;
      }
          </style>
        </head>
        <body>
        <div id="pdf-content">
          <header class="clearfix">
          <img style="height: 36px; width: 185px;" 
          src="Logo/TRYPDEKLOGO2.png" 
          class="transition position-relative" 
          alt="logo-icon" />
            <div style="float: right;
            text-align: right;
            line-height: 14px;">
              <div>FORZA ENTERPRISES PVT.LTD</div>
              <div>${branchAddress}</div>
              <div>${companyPhone}</div>
              <div><a href="mailto:${companyEmail}">${companyEmail}</a> / <a href="http://www.forzaenterprises.com">www.forzaenterprises.com</a></div>
            </div>
          </header>
          <main>
            <div id="details" class="clearfix">
              <div id="clients">          
              <div class="addclit"> Client</div>
              <div class="address"> Booked By</div>
              <div class="addressrepr">Report To</div>
              <div class="addressph"> Phone   </div>
              
              </div>
          <div class="vl"></div>
          <div id="sndcolms" class="">
             <div class="">${customer.Name}</div>
                <div class="">${Bookername?.FirstName || 'N/A'} ${Bookername?.LastName || 'N/A'} - ${Bookername?.Mobile || 'N/A'}</div>
                 <div style="line-height: 20px;height:90px;">${guest.FirstName || ''} ${guest.LastName || ''}<br>${booking.PickupAddress || 'N/A'}</div>
              <div style="line-height: 10px;">${guest.Mobile || 'N/A'}</div>
              </div>
          <div id="trdcolms" class="clearfix">
                <div style="">Date:</div>
                <div style="">Duty Slip No:</div>
                <div class="">Reporting Time:</div>
                <div class="">Rental Type:</div>
                <div class="">Vehicle No:</div>
                <div class="">Vehicle Type:</div>
                <div class="">Customer Executive:</div>
                <div class="">Mobile No:</div>
              </div>
              <div class="v2"></div>
              <div id="fothcolms">
                <div style=""><b>${new Date(pickupDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</b> </div>
                <div style=""><b>${tripId}</b></div>
                <div class="">${reportTime}</div>
                <div class="">${dutyType}</div>
                <div class="">${vehicleNo}</div>
                <div class="">${vehicleModel}</div>
                <div class="">${driverName.slice(0, 13)}</div>
                <div class="">${driverPhone}</div>
              </div>
      
          
          </div>
            <table class="tabled" style="margin-top:15px;">
            <thead>
              <tr>
                <th style="margin-bottom: -5px;border-right:1px solid gray;"></th>
                <th style="margin-bottom: -5px;border-right:1px solid gray;">Opening </th>
                <th style="margin-bottom: -5px;border-right:1px solid gray;">Closing</th>
                <th style="margin-bottom: -5px;border-right:1px solid gray;">Total</th>
                <th style="margin-bottom: -5px;border-right:1px solid gray;"></th>
               
              </tr>
            </thead>
            <tbody>
              <tr class="park1">
                <td  align="center"  style="width:15%" vertical-align="middle">Date</td>
                <td  align="center"  style="width:20%" vertical-align="middle">${new Date(pickupDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                <td  align="center"  style="width:20%" vertical-align="middle">${new Date(closeDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                <td  align="center" style="width:15%" vertical-align="middle"></td>
                <td class="" style="text-align: left;padding-top: 0px;color:gray;width:30%">Guest Releasing Place</td>
              </tr>
              <tr class="park1">
                <td class="">Time</td>
                <td class="">${startTime}</td>
                <td class="">${closeTime}</td>
                <td class="">${totalHrs}</td>
                <td class="" style="text-align: left;padding-top: 0px;color:gray;">Guest Releasing Time</td>
              </tr>
              <tr class="park1">
                <td class="">Kilometer</td>
                <td class="">${openKm}</td>
                <td class="">${closeKm}</td>
                <td class="">${totalKm}</td>
                <td class="" valign="top" style="text-align: left;padding-top: 0px;color:gray;">Guest Releasing Kms</td>
              </tr>
              <tr class="park">
                <td colspan="2" style="text-align: left;">Parking/Toll/Permit/Bata</td>
                <td class="">Extra Hours</td>
                <td class="">Extra Kilometers</td>
                <td colspan="" class="">Mode of Payment<p>${payType}</p></td>
              </tr>
              <tr class="back_bors" style="border-bottom:0px !important;">
                <td colspan="5" style="padding-left:1px;text-align: left;padding-top: 0px;float:left;">${comments}</td>
              </tr>		  
            </tbody>
        
          </table>
            <div id="comments">Comments</div>
            <div id="signatures" class="clearfix">
      For Forza Enterprises Pvt. Ltd<br><br>
      ${username || `${this.userDetails?.Prefix} ${this.userDetails?.FirstName} ${this.userDetails?.LastName}` || ''} [${formattedDateTime}]
      <div class="signature-block">
       Guest Feedback / Suggestions
      </div>
      
      <div style="text-align: right;">
  Customer Next Requirements<br>
  <img 
    style="height: 36px; width: 185px;" 
    src="${Guuestsign}" 
    class="transition position-relative" 
  /><br>
  Guest Signature
</div>

          </main>
          <div >
        </body>
        </html>
        `;
      }
    
      downloadDocument(): void {
        // Ensure data has the required booking data
        if (!this.data) {
          console.error('No booking data available to generate document');
          return;
        }
        this.isPlacardGenerating = true; // Set loading state
    
        try {
        const bookingMaster:any = this.data;
        const customer = bookingMaster.CustomerCompany || {};
        const guestNames = this.getGuestNames(bookingMaster);
        const pickupLocation = bookingMaster.RentalLocation || {};
        const address = pickupLocation.Address ? pickupLocation.Address.replace(/,+/g, '<br>') : 'N/A';
    
        // HTML content with Word-compatible markup
        const content = `
          <!DOCTYPE html>
          <html xmlns:v="urn:schemas-microsoft-com:vml"
                xmlns:o="urn:schemas-microsoft-com:office:office"
                xmlns:w="urn:schemas-microsoft-com:office:word"
                xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
                xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=Windows-1252">
            <title>Placard</title>
            <!--[if gte mso 9]>
            <xml>
              <w:WordDocument>
                <w:View>Print</w:View>
                <w:orient="landscape" />
                <w:Zoom>100</w:Zoom>
                <w:DoNotOptimizeForBrowser/>
              </w:WordDocument>
            </xml>
            <![endif]-->
            <style>
              @page {
                mso-page-border-surround-header: no;
                mso-page-border-surround-footer: no;
              }
              @page Section1 {
                size: 841.9pt 595.3pt;
                mso-page-orientation: landscape;
                margin: 0.7cm 0.7cm 0.7cm 0.7cm;
                mso-header-margin: 42.55pt;
                mso-footer-margin: 49.6pt;
                mso-paper-source: 0;
                layout-grid: 18.0pt;
              }
              div.Section1 {
                page: Section1;
              }
              h1 { font-family: Arial; font-size: 45px; text-align: center; }
              h2 { font-family: Arial; font-size: 20px; text-align: center; font-weight: normal; }
              h3 { font-family: Arial; font-size: 25px; text-align: center; font-weight: normal; }
              p.para { font-family: Arial; font-size: 13.5px; text-align: left; width: 50%; }
              .flightd { font-size: 25px; text-align: left; padding-left: 20px; }
              .flightl { font-size: 25px; text-align: left; text-align-last: right; }
            </style>
          </head>
          <body>
            <div class="Section1">
              <h3>${customer.Name || 'N/A'}<br><b>WELCOMES</b></h3><br/>
              <h1>${guestNames}</h1>
              <p>&nbsp;</p>
              <p>&nbsp;</p>
              <hr>
              <div class="flightd">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${bookingMaster.FlightDetails || 'N/A'}</div>
              <div class="flightl">
              <img style="height: 36px; width: 185px;" 
              src="Logo/TRYPDEKLOGO2.png" 
              class="transition position-relative" 
              alt="logo-icon" />
              </div>
            </div>
          </body>
          </html>
        `;
    
        // Create a Blob with the content
        const blob = new Blob([content], { type: 'application/msword' });
        const filename = 'Placard.doc';
    
        // Trigger download using file-saver
        saveAs(blob, filename);
      }catch (error) {
        console.error('Error generating document:', error);
        alert('Failed to generate placard. Please try again.');
      } finally {
        this.isPlacardGenerating = false; // Reset loading state
      }
    }
    
      /**
       * Helper method to construct guest names string
       */
      private getGuestNames(booking: any): string {
        const guestDetails = booking.GuestDetails || [];
        let guestNames = '';
    
        if (guestDetails.length > 0) {
          guestNames += `${guestDetails[0].Prefix || ''}.${guestDetails[0].FirstName || ''} ${guestDetails[0].LastName || ''}`.trim();
        }
        if (guestDetails.length > 1) {
          guestNames += `<br>${guestDetails[1].Prefix || ''}.${guestDetails[1].FirstName || ''} ${guestDetails[1].LastName || ''}`.trim();
        }
        if (guestDetails.length > 2) {
          guestNames += `<br>${guestDetails[2].Prefix || ''}.${guestDetails[2].FirstName || ''} ${guestDetails[2].LastName || ''}`.trim();
        }
        if (guestDetails.length > 3) {
          guestNames += `<br>${guestDetails[3].Prefix || ''}.${guestDetails[3].FirstName || ''} ${guestDetails[3].LastName || ''}`.trim();
        }
    
        return guestNames || 'N/A';
      }
    
}
