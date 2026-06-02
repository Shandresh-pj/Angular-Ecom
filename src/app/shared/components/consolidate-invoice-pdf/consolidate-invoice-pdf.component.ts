import {Component,Input,} from '@angular/core';
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
import { CommonService } from '../../../core/service/common.service';
import moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { calculateHours, getIndianCurrency } from '../../../utils';

export interface TableColumn {
    field: string; 
    header: string; 
    editable: boolean;
    type?: string;
    options?: any[];
    optionsDetail?: { label: string; value: string };
    isRequired?: boolean;
    customValidation?: string;
    isHidden?: boolean;
}

@Component({
    selector: 'app-consolidate-invoice-pdf',
    templateUrl: './consolidate-invoice-pdf.component.html',
    styleUrls: ['./consolidate-invoice-pdf.component.scss'],
    standalone: true,
    imports: [
        CommonModule,ReactiveFormsModule,MatTableModule,MatButtonModule,MatInputModule,MatSelectModule,
        MatIconModule,MatCardModule,MatCheckboxModule,
    ],
})
export class ConsolidateInvoicePdfComponent {
    public apiRoute = 'Invoice';
    isGeneratingPDF = false;
    @Input() data: any | null = null;
    invoiceList: any;
    bookingnumber: any;
    constructor(private commonService: CommonService) {}

    async generatePDF(element?: any) {
        this.isGeneratingPDF = true;
        let invoiceData: any[] = [];

        try {
            const res: any = await firstValueFrom(
                this.commonService.getApi(`${this.apiRoute}/${element.Id}`, {})
            );
            this.invoiceList = res.data;
            const invoiceBills = this.invoiceList.InvoiceBills || [];
            const bookings = this.invoiceList.Booking || [];
            const customerTariffs = this.invoiceList.CustomerBillTariff || [];
            const enrichedBills = invoiceBills.map((bill: any) => {
            const relatedBooking =bookings.find((b: any) => b.Id === bill.BookingId) || {};
            const customerTariff =customerTariffs.find((t: any) => t.BillId === bill.Id) ||{};
                return {
                    ...bill,
                 Booking: {
                    ...relatedBooking,
                    TotalHrs: calculateHours(bill.OpenDate,bill.OpenTime,bill.CloseDate,bill.CloseTime),
                    TotalKms:parseFloat(bill.CloseKMS) -parseFloat(bill.OpenKMS) || 0,
                      },
                    CustomerBillTariff: customerTariff,
                };
            });
            for (const bill of enrichedBills) {
                const invoiceDetail = {
                    booking_number: bill.Booking.BookingNumber,
                    BillId: bill.Id || null,
                    trip_type: bill.Booking?.RentalType?.Code, 
                    customer_id: bill.CustomerCompanyParentId,
                    vehicle_no: bill.VehicleNumber,
                    vehicle_model: bill.VehicleModelId || '',
                    open_date: bill.OpenDate,
                    open_time: bill.OpenTime,
                    close_time: bill.CloseTime,
                    close_date: bill.CloseDate,
                    c_total_km: bill.CloseKMS - bill.OpenKMS,
                    c_total_hrs: bill.TotalHrs,
                    permit: bill.CustomerBillTariff?.Permit || 0,
                    others: bill.CustomerBillTariff?.Others || 0,
                    parking: bill.CustomerBillTariff?.Parking || 0,
                    cardamount: bill.CustomerBillTariff?.CardAmt || 0,
                    loc_allowance:Number(bill.CustomerBillTariff?.LocalAllowance) || 0,
                    TotalAllowance:Number(bill.CustomerBillTariff?.TotalAllowance) || 0,
                    os_allowance:Number(bill.CustomerBillTariff?.OsAllowance) || 0,
                    os_night_allowance:Number(bill.CustomerBillTariff?.OsNightAllow) || 0,
                    c_slab_rate: Number(bill.CustomerBillTariff?.Rate) || 0,
                    c_ex_km: Number(bill.CustomerBillTariff?.ExtraKms) || 0,
                    c_ex_km_rate:Number(bill.CustomerBillTariff?.ExtraKmRate) || 0,
                    c_ex_km_amt: Number(bill.CustomerBillTariff?.ExKmAmt) || 0,
                    c_ex_hr: Number(bill.CustomerBillTariff?.ExtraHours) || 0,
                    c_ex_hour_rate:Number(bill.CustomerBillTariff?.ExtraHourRate) || 0,
                    c_ex_hr_amt: Number(bill.CustomerBillTariff?.ExHrAmt) || 0,
                    cgst_amt: Number(bill.CustomerBillTariff?.CGST_Amt) || 0,
                    c_discount_amt:Number(bill.CustomerBillTariff?.DiscountAmt) || 0,
                    c_card_amt: Number(bill.CustomerBillTariff?.CardAmt) || 0,
                    c_sgst_amt: Number(bill.CustomerBillTariff?.SGST_Amt) || 0,
                    c_igst_amt: Number(bill.CustomerBillTariff?.IGST_Amt) || 0,
                    cgst: Number(bill.CustomerBillTariff?.CGST) || 0,
                    sgst: Number(bill.CustomerBillTariff?.SGST) || 0,
                    igst: Number(bill.CustomerBillTariff?.IGST) || 0,
                    invoice_amt:Number(bill.CustomerBillTariff?.InvoiceAmt) || 0,
                    card: Number(bill.CustomerBillTariff?.Card) || 0,
                    Naration: bill.CustomerBillTariff?.Naration || '',
                    netAmt: Number(bill.CustomerBillTariff?.NetAmt) || 0,
                    BookerBy: `${bill?.Booking?.Booker[0]?.FirstName || ''} ${bill?.Booking?.Booker[0]?.LastName || ''}`,
                    guest: `${bill?.Booking?.Guests?.FirstName || ''} ${bill?.Booking?.Guests?.LastName || ''}`,
                    night:Number(bill.CustomerBillTariff?.Night) || 0,
                    earlyStart:Number(bill.CustomerBillTariff?.EarlyStart) || 0,
                    sundayOrHoliday:Number(bill.CustomerBillTariff?.SundayOrHoliday) || 0,
                    overTimePerHour:Number(bill.CustomerBillTariff?.OverTimePerHour) || 0,
                    outstation:Number(bill.CustomerBillTariff?.Outstation) || 0,
                    outstationOvernight:Number(bill.CustomerBillTariff?.OutstationOvernight) || 0,
                    extraDuty:Number(bill.CustomerBillTariff?.ExtraDuty) || 0,
                    driverDaily:Number(bill.CustomerBillTariff?.DriverDaily) || 0,
                };
                const customerDetail = {
                    customers_id: bill.CustomerCompanyParentId,
                    customer_name:bill.Booking?.CustomerCompanyParent?.Name || '',
                    vendor_name: bill.Booking?.VendorCompany?.Name || '',
                    branch_address: `${bill?.Booking?.VendorCompany?.CompanyAddress?.AddressLine_1 || ''}, ${
                        bill?.Booking?.VendorCompany?.CompanyAddress?.AddressLine_2 || ''},${
                        bill?.Booking?.VendorCompany?.CompanyAddress?.City || ''},${
                        bill?.Booking?.VendorCompany?.CompanyAddress?.State ||''
                    }`,
                    company_phone:bill.Booking?.VendorCompany?.PhoneNumber || '',
                    company_email: bill.Booking?.VendorCompany?.Email || '',
                    customer_address: `${bill?.Booking?.CustomerCompanyParent?.CustomerAddress?.AddressLine_1 || ''}, ${
                        bill?.Booking?.CustomerCompanyParent?.CustomerAddress?.AddressLine_2 || ''},${
                        bill?.Booking?.CustomerCompanyParent?.CustomerAddress?.City || ''},${
                        bill?.Booking?.CustomerCompanyParent?.CustomerAddress?.State || ''}`,
                    hsn_code:bill?.Booking?.CustomerCompanyParent?.HsnCode || 'null',
                    hsn_desc:bill?.Booking?.CustomerCompanyParent?.HsnDescription ||'null',
                    project_id: bill?.Booking?.ProjectId || '',
                    request_id: bill?.Booking?.RequestId || '',
                    employee_id: bill?.Booking?.Guests?.EmployeeCode || '',
                    gst_no: bill?.Booking?.CustomerCompanyParent?.GstNo || '',
                    pan_no: bill?.Booking?.CustomerCompanyParent?.PanNo || '',
                };

                const ceAllowance = invoiceDetail.night + invoiceDetail.earlyStart + invoiceDetail.sundayOrHoliday + invoiceDetail.overTimePerHour + invoiceDetail.outstation + invoiceDetail.outstationOvernight + invoiceDetail.extraDuty + invoiceDetail.driverDaily;
                const total = Number(invoiceDetail.c_slab_rate) + Number(invoiceDetail.c_ex_km_amt) + Number(invoiceDetail.c_ex_hr_amt);

                invoiceData.push({invoiceDetail,customerDetail,ceAllowance,total,});
            }

            const pdf = new jsPDF('l', 'mm', 'a4', true);
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const totalSum = invoiceData.reduce((sum, data) => sum + data.total,0);
            const ceAllowanceSum = invoiceData.reduce((sum, data) => sum + data.ceAllowance,0);
            const netAmt = invoiceData.reduce((sum, data) => sum + Number(data?.invoiceDetail?.netAmt || 0),0);
            const htmlContent = this.generateSinGlePageInvoiceHTML(
                invoiceData.map((data) => data.invoiceDetail),
                invoiceData[0]?.customerDetail,
                totalSum,
                ceAllowanceSum,
                netAmt
            );

            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = `${pageWidth - 2 * margin}mm`;
            tempDiv.style.fontSize = '10px';
            tempDiv.innerHTML = htmlContent;
            document.body.appendChild(tempDiv);
            const canvas = await html2canvas(tempDiv, {scale: 2,useCORS: true,logging: false,backgroundColor: '#fff',});
            const imgWidth = pageWidth - 2 * margin;
            const pageHeightInPx =(pageHeight - 2 * margin) *(canvas.height / (pageWidth - 2 * margin));
            let remainingHeight = canvas.height;
            let positionY = 0;

            while (remainingHeight > 0) {
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                pageCanvas.height = Math.min(pageHeightInPx, remainingHeight);
                const pageCtx = pageCanvas.getContext('2d');
                if (pageCtx) {
                 pageCtx.drawImage(canvas,0,positionY,canvas.width,pageCanvas.height, 0,0,canvas.width,pageCanvas.height);
                }
                const pageImgData = pageCanvas.toDataURL('image/png');
                const pageImgHeight =(pageCanvas.height * imgWidth) / canvas.width;
                pdf.addImage(pageImgData,'PNG',margin,margin,imgWidth,pageImgHeight);
                remainingHeight -= pageHeightInPx;
                positionY += pageHeightInPx;
                if (remainingHeight > 0) {
                    pdf.addPage();
                }
            }
            pdf.save(`invoice_${element.InvoiceNumber}.pdf`);
            document.body.removeChild(tempDiv);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            this.isGeneratingPDF = false;
        }
    }
    generateSinGlePageInvoiceHTML(invoiceDetail: any | any[],customerDetail: any | {},total: number,ceAllowance: number,totalNet: number): string {
        customerDetail = customerDetail ? customerDetail : {};
        const isArray = Array.isArray(invoiceDetail);
        const invoiceDetails = isArray ? invoiceDetail : [invoiceDetail];
        const permit = invoiceDetails.reduce((sum, detail) =>sum +(Number(detail.permit) || 0) +(Number(detail.others) || 0),0);
        const TotalParking = invoiceDetails.reduce((sum, detail) => {
            const parkingValue = Number(detail.parking);
            return sum + (isNaN(parkingValue) ? 0 : parkingValue);
        }, 0);
        const Totalcardamt = invoiceDetails.reduce((sum, detail) => {
            const cardamountValue = Number(detail.cardamount);
            return sum + (isNaN(cardamountValue) ? 0 : cardamountValue);
        }, 0);
        const TotalnetAmt = invoiceDetails.reduce((sum, detail) => {
            const netAmtValue = Number(detail.netAmt);
            return sum + (isNaN(netAmtValue) ? 0 : netAmtValue);
        }, 0);
        const TotalCgstAmt = invoiceDetails.reduce((sum, detail) => {
            const cgst_amt = Number(detail.cgst_amt);
            return sum + (isNaN(cgst_amt) ? 0 : cgst_amt);
        }, 0);
        const TotalInvoiceAmt = invoiceDetails.reduce((sum, detail) => {
            const cgst_amt = Number(detail.invoice_amt);
            return sum + (isNaN(cgst_amt) ? 0 : cgst_amt);
        }, 0);
        const TotalNetAmt = invoiceDetails.reduce((sum, detail) => {
            const netAmt = Number(detail.netAmt);
            return sum + (isNaN(netAmt) ? 0 : netAmt);
        }, 0);
        const TotalSgstAmt = invoiceDetails.reduce((sum, detail) => {
            const sgst_amt = Number(detail.c_sgst_amt);
            return sum + (isNaN(sgst_amt) ? 0 : sgst_amt);
        }, 0);
        const TotalIgstAmt = invoiceDetails.reduce((sum, detail) => {
            const igst_amt = Number(detail.c_igst_amt);
            return sum + (isNaN(igst_amt) ? 0 : igst_amt);
        }, 0);
        const TotalDiscountAmt = invoiceDetails.reduce((sum, detail) => {
            const discount_amt = Number(detail.c_discount_amt);
            return sum + (isNaN(discount_amt) ? 0 : discount_amt);
        }, 0);
        return `
    <style>
    table tbody tr:nth-child(odd) {
      background-color: #F5F5F5;
    }
    table tbody tr:nth-child(even) {
      background-color: #FFFFFF;
    }
  </style>
      <header style="padding: 5px 0; margin-bottom: 10px; border-bottom: 1px solid #AAAAAA; display: flex; justify-content: space-between; align-items: center; color: #000;">
        <div style="display: flex; align-items: center;">
          <img style="height: 30px; width: 150px;" 
               src="Logo/TRYPDEKLOGO2.png" 
               class="transition position-relative" 
               alt="logo-icon" />
        </div>
        <div style="text-align: right; color: #000;">
          <h2 style="margin: 0; font-size: 15px;">${customerDetail.vendor_name}</h2>
          <div style="font-size: 13px; line-height: 14px;">${customerDetail.branch_address}</div>
          <div style="font-size: 13px; line-height: 14px;">${customerDetail.company_phone}</div>
          <div style="font-size: 13px; line-height: 14px;">${customerDetail.company_email}</div>
        </div>
      </header>
      <main style="font-family: Arial, sans-serif; font-size: 12px; color: #000;">
        <h3 style="text-align: center; font-size: 15px; margin: 15px 0;">Tax Invoice</h3>
        <div id="details" style="margin-bottom: 15px;">
          <div style="padding-left: 6px; border-left: 6px solid #0087C3; font-size: 13px; width: 50%;">
            <div class="to" style="color: #000; font-weight: bold;">INVOICE TO:</div>
            <h2 style="margin: 3px 0; font-size: 14px;">${customerDetail.customer_name || 'Unknown Customer'}</h2>
            <div>${customerDetail.customer_address || ''}</div>
            <div>Bill No: ${this.invoiceList?.InvoiceNumber || ''}</div>
            <div>Bill Date: ${new Date(this.invoiceList?.InvoiceDate).toLocaleDateString('en-IN')}</div>
          </div>
        </div>
        <div style="margin-bottom: 10px; font-size: 12px; display: flex; justify-content: space-between;">
          <div style="width: 40%;">Customer GSTIN/UIN #: ${customerDetail.gst_no || ''}</div>
          <div style="width: 25%;">
            Emp Id: ${customerDetail.employee_id || ''}<br>
            Project Id: ${customerDetail.project_id || ''}<br>
            Request Id: ${customerDetail.request_id || ''}
          </div>
          <div style="width: 25%; text-align: right;">Booked By: ${invoiceDetails[0]?.BookerBy || ''}</div>
        </div>
        <table style="width: 100%;  color: #000; border-collapse: collapse; font-size: 11px; margin-top: 15px; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #FFFFFF;">
              <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Booking No</th>
              <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Trip Date</th>
              <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Booker Name</th>
              <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Passenger</th>
              <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Rental Type</th>
              <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Guest Employee ID</th>
              <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Request ID</th>
              <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Project ID</th>
              <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Vehicle No & Type</th>
              <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Total Usage<br>Kms | Hrs | Days</th>
              <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Slab Rate</th>
              <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Extra Hours<br>Hrs | Rate | Amt</th>
              <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Extra KMS<br>Kms | Rate | Amt</th>
              <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceDetails.map((detail) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 5px;">${detail.booking_number || ''}</td>
                <td style="border: 1px solid #ddd; padding: 5px;">${new Date(detail.open_date).toLocaleDateString('en-IN')}</td>
                <td style="border: 1px solid #ddd; padding: 5px;">${detail.BookerBy || ''}</td>
                <td style="border: 1px solid #ddd; padding: 5px;">${detail.guest || ''}</td>
                <td style="border: 1px solid #ddd; padding: 5px;">${detail.trip_type || ''}</td>
                <td style="border: 1px solid #ddd; padding: 5px;">${customerDetail.employee_id || ''}</td>
                <td style="border: 1px solid #ddd; padding: 5px;">${customerDetail.request_id || ''}</td>
                <td style="border: 1px solid #ddd; padding: 5px;">${customerDetail.project_id || ''}</td>
                <td style="border: 1px solid #ddd; padding: 5px;">${detail.vehicle_no || ''} ${detail.vehicle_model || ''}</td>
                <td style="border: 1px solid #ddd; padding: 5px;">${detail.c_total_km || 0} | ${detail.c_total_hrs || 0} | ${Math.floor((detail.c_total_hrs || 0) / 24)}</td>
                <td style="border: 1px solid #ddd; padding: 5px;">${detail.c_slab_rate?.toFixed(2) || '0.00'}</td>
                <td style="border: 1px solid #ddd; padding: 5px;">${detail.c_ex_hr || 0} | ${detail.c_ex_hour_rate?.toFixed(2) || '0.00'} | ${detail.c_ex_hr_amt?.toFixed(2) || '0.00'}</td>
                <td style="border: 1px solid #ddd; padding: 5px;">${
                    detail.c_ex_km || 0
                } | ${detail.c_ex_km_rate?.toFixed(2) || '0.00'} | ${
                        detail.c_ex_km_amt?.toFixed(2) || '0.00'
                    }</td>
                <td style="border: 1px solid #ddd; padding: 5px;">${(Number(detail.c_slab_rate || 0) +Number(detail.c_ex_km_amt || 0) +Number(detail.c_ex_hr_amt || 0)).toFixed(2)}</td>
              </tr>
            `
                )
                .join('')}
          </tbody>
        </table>
        <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 12px;">
          <div style="width: 70%;">
            <div style="padding-left: 6px; border-left: 6px solid #0087C3;">
              <div><b>Open date:</b> ${new Date(invoiceDetails[0]?.open_date).toLocaleDateString('en-IN')}  <b>Close date:</b> ${new Date(
            invoiceDetails[invoiceDetails.length - 1]?.close_date).toLocaleDateString('en-IN')}</div>
              <div><b>Open time:</b> ${invoiceDetails[0]?.open_time}  <b>Close time:</b> ${invoiceDetails[invoiceDetails.length - 1]?.close_time}</div>
              <div style="margin-top: 8px; font-size: 11px; font-weight: bold; color: #000;">
                For any billing related clarification, please reach us @ billing@forzaenterprises.com - +91 4443542891
              </div>
              <div style="margin-top: 8px;">
                IRN No: ${invoiceDetails[0]?.IRN_No || ''}<br>
                IRN Date: ${invoiceDetails[0]?.IRN_Date || ''}<br>
                Ack No: ${invoiceDetails[0]?.Ack_No || ''}
              </div>
            </div>
          </div>
          <div style="width: 25%;">
            <table style="width: 100%; color: #000; border-collapse: collapse; border: 1px solid #AAAAAA; font-size: 12px;">
              <tr style="background-color: #f2f2f2;">
                <td style="padding: 4px; text-align: left;">Sub Total</td>
                <td style="padding: 4px; text-align: right;">${total.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 4px; text-align: left;">Discount</td>
                <td style="padding: 4px; text-align: right;">${TotalDiscountAmt?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr style="background-color: #f2f2f2;">
                <td style="padding: 4px; text-align: left;">Parking</td>
                <td style="padding: 4px; text-align: right;">${TotalParking.toFixed(2) ?? 0}</td>
              </tr>
              <tr>
                <td style="padding: 4px; text-align: left;">Permit / Others</td>
                <td style="padding: 4px; text-align: right;">${permit.toFixed(2)}</td>
              </tr>
              <tr style="background-color: #f2f2f2;">
                <td style="padding: 4px; text-align: left;">CE Allowance</td>
                <td style="padding: 4px; text-align: right;">${ceAllowance.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 4px; text-align: left;">CGST @ ${invoiceDetails[0]?.cgst || '0.00'}%</td>
                <td style="padding: 4px; text-align: right;">${TotalCgstAmt?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr style="background-color: #f2f2f2;">
                <td style="padding: 4px; text-align: left;">SGST @ ${invoiceDetails[0]?.sgst || '0.00'}%</td>
                <td style="padding: 4px; text-align: right;">${TotalSgstAmt?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr>
                <td style="padding: 4px; text-align: left;">IGST @ ${invoiceDetails[0]?.igst || '0.00'}%</td>
                <td style="padding: 4px; text-align: right;">${TotalIgstAmt?.toFixed(2) || '0.00'}</td>
              </tr>
               <tr style="background-color: #f2f2f2;">
                <td style="padding: 4px; text-align: left;">Invoice Amount</td>
                <td style="padding: 4px; text-align: right;">${TotalInvoiceAmt?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr>
                <td style="padding: 4px; text-align: left;">CARD Charges</td>
                <td style="padding: 4px; text-align: right;">${Totalcardamt?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr style="background-color: #f2f2f2;">
                <td style="padding: 4px; text-align: left;">Net Amount</td>
                <td style="padding: 4px; text-align: right;">${TotalNetAmt?.toFixed(2)}</td>
              </tr>
            </table>
          </div>
        </div>
        <div style="margin-top: 15px; font-size: 12px; font-weight: bold; color: #000; border-top: 1px solid #AAAAAA; border-bottom: 1px solid #AAAAAA; padding: 8px; text-align: center;">
          ${getIndianCurrency(TotalNetAmt)}
        </div>
        <div style="margin-top: 10px; font-size: 11px; color: #000; display: flex; justify-content: space-between;">
          <div>
            GSTIN/UIN #: ${customerDetail.gst_no || ''}   Pan No: ${customerDetail.pan_no || ''}<br>
            HSN/SAC Code: ${customerDetail.hsn_code || ''} (Service Category: ${customerDetail.hsn_desc || ''})<br>
            Bank Name: ICICI BANK / Account Number: 189905002884 / IFSC Code: ICIC0001899<br>
            Naration: ${invoiceDetails[0]?.Naration || ''}
          </div>
          <div style="text-align: right;">
            For Forza Enterprises Pvt. Ltd
          </div>
        </div>
      </main>
      <footer style="margin-top: 15px; font-size: 10px; text-align: center; color: #000; border-top: 1px solid #AAAAAA; padding-top: 8px;">
        <div>Invoice was created on a computer and is valid without the signature and seal.</div>
      </footer>
    `;
    }

   
}
