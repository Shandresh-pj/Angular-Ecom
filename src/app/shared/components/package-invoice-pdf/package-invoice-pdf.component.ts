import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
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
    selector: 'app-package-invoice-pdf',
    templateUrl: './package-invoice-pdf.component.html',
    styleUrls: ['./package-invoice-pdf.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatTableModule,
        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatCardModule,
        MatCheckboxModule,
    ],
})
export class InvoicePackagePdfComponent {
    public apiRoute = 'Invoice';
    isGeneratingPDF = false;
    @Input() data: any | null = null;
    invoiceList: any;
    bookingnumber: any;
    InvoiceDetail: any;

    constructor(private commonService: CommonService) {}
    async generatePDF(element?: any) {
        this.isGeneratingPDF = true;
        let invoiceData: any[] = [];

        try {
            const res: any = await firstValueFrom(
                this.commonService.getApi(`Invoice/${element.Id}`, {})
            );
            this.invoiceList = res.data;
            const InvoiceDetail = this.invoiceList.InvoiceDetails;
            const invoiceBills = this.invoiceList.InvoiceBills || [];
            const bookings = this.invoiceList.Booking || [];
            const customerTariffs = this.invoiceList.CustomerBillTariff || [];
            const packageSubVendorTariffs =this.invoiceList.PackageSubVendorTariff || [];
            const enrichedBills = invoiceBills.map((bill: any) => {
            const relatedInvoice =InvoiceDetail.find((i: any) => i.BillsId === bill.Id) || {};
            const subVendorTariff =packageSubVendorTariffs.find((t: any) => t.InvoiceId === relatedInvoice.InvoiceId) || {};
            const relatedBooking =bookings.find((b: any) => b.Id === bill.BookingId) || {};
            const customerTariff =customerTariffs.find((t: any) => t.BillId === bill.Id) ||{};
                return {
                    ...bill,
                    Booking: {
                        ...relatedBooking,
                        TotalHrs: calculateHours(
                            bill.OpenDate,
                            bill.OpenTime,
                            bill.CloseDate,
                            bill.CloseTime
                        ),
                        TotalKms:parseFloat(bill.CloseKMS) - parseFloat(bill.OpenKMS) || 0,
                    },
                    CustomerBillTariff: customerTariff,
                    PackageSubVendorTariff: subVendorTariff,
                };
            });

            for (const bill of enrichedBills) {
                const invoiceDetail = {
                    BookerBy: `${bill?.Booking?.Booker[0]?.FirstName || ''} ${bill?.Booking?.Booker[0]?.LastName || ''}`,
                    guest: `${bill?.Booking?.Guests[0]?.FirstName || ''} ${bill?.Booking?.Guests[0]?.LastName || ''}`,
                    vehicleModel:bill?.Booking?.VehicleModel?.Model || '',
                };

                const customerDetail = {
                    customers_id: bill.CustomerCompanyParentId,
                    customer_name:bill.Booking?.CustomerCompanyParent?.Name || '',
                    vendor_name: bill.Booking?.VendorCompany?.Name || '',
                    branch_address: `${bill?.Booking?.VendorCompany?.CompanyAddress.AddressLine_2 || ''},${
                        bill?.Booking?.VendorCompany?.CompanyAddress.City || ''},${bill?.Booking?.VendorCompany?.CompanyAddress.Pincode ||''}`,
                    company_phone:bill.Booking?.VendorCompany?.PhoneNumber || '',
                    company_email: bill.Booking?.VendorCompany?.Email || '',
                    customer_address: `${
                        bill?.Booking?.CustomerCompanyParent?.CustomerAddress.AddressLine_1 || ''}, ${
                        bill?.Booking?.CustomerCompanyParent?.CustomerAddress.AddressLine_2 || ''},${
                        bill?.Booking?.CustomerCompanyParent?.CustomerAddress.City || ''},${
                        bill?.Booking?.CustomerCompanyParent?.CustomerAddress.State || ''}`,
                    hsn_code:bill?.Booking?.CustomerCompanyParent?.HsnCode || 'null',
                    hsn_desc:bill?.Booking?.CustomerCompanyParent?.HsnDescription || 'null',
                    project_id: bill?.Booking?.ProjectId || '',
                    request_id: bill?.Booking?.RequestId || '',
                    employee_id: bill?.Booking?.BookingGuests?.EmployeeId || '',
                    gst_no: bill?.Booking?.CustomerCompanyParent?.GstNo || '',
                    pan_no: bill?.Booking?.CustomerCompanyParent?.PanNo || '',
                };
                invoiceData.push({ invoiceDetail, customerDetail });
            }

            const pdf = new jsPDF('p', 'mm', 'a4', true);
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const htmlContent = this.generateSinGlePageInvoiceHTML(enrichedBills,invoiceData[0]?.customerDetail,invoiceData[0]?.invoiceDetail);

            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = `${pageWidth - 1 * margin}mm`; 
            tempDiv.style.fontSize = '10px'; 
            tempDiv.innerHTML = htmlContent;
            document.body.appendChild(tempDiv);
            const scale = 2; 
            const canvas = await html2canvas(tempDiv, {
                scale: scale,
                useCORS: true,
                logging: false,
                backgroundColor: '#fff',
                // width: tempDiv.offsetWidth,
                // height: tempDiv.offsetHeight
            });

            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pageWidth - 2 * margin;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth, pdfHeight);
            document.body.removeChild(tempDiv);
            pdf.save(`invoice_${element.InvoiceNumber}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            this.isGeneratingPDF = false;
        }
    }
    generateSinGlePageInvoiceHTML(invoiceBills: any[],customerDetail: any | {},invoiceDetail: any | {}): string {
        customerDetail = customerDetail ? customerDetail : {};
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
            <img style="height: 40px; width: 180px;" src="Logo/TRYPDEKLOGO2.png" class="transition position-relative" alt="logo-icon" />
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
            <div style="margin-top: 8px;margin-bottom: 19px;">
              IRN No: ${this.invoiceList.PackageCustomerTariff?.IRN_No || ''}<br>
              IRN Date: ${this.invoiceList.PackageCustomerTariff?.IRN_Date || ''}<br>
              Ack No: ${this.invoiceList.PackageCustomerTariff?.Ack_No || ''}
            </div>
            <div style="display: flex;justify-content: space-between;align-items: flex-start;font-size: 13px;margin-bottom: 22px;">
              <div style="width: 50%;padding-left: 6px;border-left: 6px solid #0087C3;">
                <div style="margin: 3px 0;font-size: 14px;">INVOICE TO:</div>
                <h2 style="margin: 3px 0;font-size: 14px;">
                  ${customerDetail.customer_name || 'Unknown Customer'}
                </h2>
                <div>${customerDetail.customer_address || ''}</div>
              </div>
              <div style="width: 35%; text-align: right;">
                <div>Bill No: ${this.invoiceList?.InvoiceNumber || ''}</div>
                <div>Bill Date: ${new Date(
                    this.invoiceList?.InvoiceDate
                ).toLocaleDateString('en-IN')}</div>
              </div>
            </div>
            <div style="margin-bottom: 10px; font-size: 12px; display: flex; justify-content: space-between;">
              <div style="width: 40%;">
                Guest: ${invoiceDetail?.guest || ''}<br>
                Customer GSTIN/UIN #: ${customerDetail.gst_no || ''}
              </div>
              <div style="width: 25%; text-align: right;">
                Booked By: ${invoiceDetail?.BookerBy || ''}
              </div>
            </div>
                <table style="width: 100%;  color: #000; border-collapse: collapse; font-size: 11px; margin-top: 15px; border: 1px solid #ddd;">
              <thead>
                <tr style="background-color: #fff;">
                  <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Date</th>
                  <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Trip No</th>
                  <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Vehicle No</th>
                  <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Opening <br>Time | Kms</th>
                  <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Closing<br>Time | Kms</th>
                  <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Total<br>Hours | Kms</th>
                  <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Extra <br>Hours | Kms</th>
                  <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Bata</th>
                  <th style="border: 1px solid #ddd; padding: 5px; text-align: left;">Parking</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceBills
                    .map((bill) => {
                        return `
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 5px;">${new Date(bill.OpenDate).toLocaleDateString('en-IN') ||''}</td>
                      <td style="border: 1px solid #ddd; padding: 5px;">${bill.Booking?.BookingNumber || ''}</td>
                      <td style="border: 1px solid #ddd; padding: 5px;">${bill.VehicleNumber || ''}</td>
                      <td style="border: 1px solid #ddd; padding: 5px;">${(bill.OpenTime || '').substring(0, 5)} | ${bill.OpenKMS || ''}</td>
                      <td style="border: 1px solid #ddd; padding: 5px;">${(bill.CloseTime || '').substring(0, 5)} | ${bill.CloseKMS || ''}</td>
                      <td style="border: 1px solid #ddd; padding: 5px;">${bill.TotalHrs || ''} | ${bill.TotalKMS || ''}</td>
                      <td style="border: 1px solid #ddd; padding: 5px;">${bill.CustomerBillTariff.ExtraHours || '0.00'} | ${bill.CustomerBillTariff.ExtraKms || ''}</td>
                      <td style="border: 1px solid #ddd; padding: 5px;">
                      ${
                          (Number(bill.CustomerBillTariff?.OverTimePerHour) ||0) +
                          (Number(bill.CustomerBillTariff?.Outstation) || 0) +
                          (Number(bill.CustomerBillTariff?.OutstationOvernight) || 0) +
                          (Number(bill.CustomerBillTariff?.SundayOrHoliday) ||0) +
                          (Number(bill.CustomerBillTariff?.EarlyStart) || 0) +
                          (Number(bill.CustomerBillTariff?.Night) || 0) +
                          (Number(bill.CustomerBillTariff?.ExtraDuty) || 0) +
                          (Number(bill.CustomerBillTariff?.DriverDaily) || 0)
                      }
                    </td>
                      <td style="border: 1px solid #ddd; padding: 5px;">${bill.CustomerBillTariff?.Parking || 0}</td>
                    </tr>
                  `;
                    })
                    .join('')}
           <tr class="back_bor">
            <td colspan="4">Particulars</td>
            <td colspan="">Limit</td>
            <td colspan="">Actual</td>
            <td colspan="">Extra</td>
            <td colspan="">Rate</td>
            <td colspan="">Amount</td>
          </tr>
          <tr class="back_bor">
          <td colspan="8">${invoiceDetail?.vehicleModel || ''} Hire Charges for the period of ${this.invoiceList?.OpenDate || ''} to ${this.invoiceList?.CloseDate || ''}</td>
          <td colspan="">${this.invoiceList.PackageCustomerTariff?.Rate || ''}</td>			
        </tr>
                <tr class="back_bor">
                  <td colspan="4">Kilometers</td>
                  <td colspan="">${this.invoiceList.PackageCustomerTariff?.KiloMeter || ''}</td>			
                  <td colspan="">${this.invoiceList.PackageCustomerTariff?.TotalKms || ''}</td>			
                  <td colspan="">${this.invoiceList.PackageCustomerTariff?.ExtraKms || ''}</td>			
                  <td colspan="">${this.invoiceList.PackageCustomerTariff?.ExtraKmRate || ''}</td>			
                  <td colspan="">${this.invoiceList.PackageCustomerTariff?.ExKmAmt || ''}</td>			
                </tr>
                <tr class="bor">
                  <td colspan="4">Hours</td>
                  <td colspan="">${this.invoiceList.PackageCustomerTariff?.Hours || ''}</td>			
                  <td colspan="">${this.invoiceList.PackageCustomerTariff?.TotalHrs || ''}</td>			
                  <td colspan="">${this.invoiceList.PackageCustomerTariff?.ExtraHours || ''}</td>			
                  <td colspan="">${this.invoiceList.PackageCustomerTariff?.ExtraHourRate ||''}</td>			
                  <td colspan="">${this.invoiceList.PackageCustomerTariff?.ExHrAmt || ''}</td>			
                </tr>
                <tr class="back_bor">
                  <td colspan="4">Days</td>
                  <td colspan="">${this.invoiceList.PackageCustomerTariff?.Days || ''}</td>			
                  <td colspan="">${this.invoiceList.PackageCustomerTariff?.TotalDays || ''}</td>			
                  <td colspan="">${this.invoiceList.PackageCustomerTariff?.ExtraDays || ''}</td>			
                  <td colspan="">${this.invoiceList.PackageCustomerTariff?.PerDayRate || ''}</td>			
                  <td colspan="">${this.invoiceList.PackageCustomerTariff?.ExtraDaysAmt || ''}</td>			
                </tr>
                <tr class="bor">
                  <td colspan="8">Bata</td>
                  <td class="total">${
                    (Number(this.invoiceList.PackageCustomerTariff?.OverTimePerHour) ||0) +
                    (Number(this.invoiceList.PackageCustomerTariff?.Outstation) || 0) +
                    (Number(this.invoiceList.PackageCustomerTariff?.OutstationOvernight) || 0) +
                    (Number(this.invoiceList.PackageCustomerTariff?.SundayOrHoliday) ||0) +
                    (Number(this.invoiceList.PackageCustomerTariff?.EarlyStart) || 0) +
                    (Number(this.invoiceList.PackageCustomerTariff?.Night) || 0) +
                    (Number(this.invoiceList.PackageCustomerTariff?.ExtraDuty) || 0) +
                    (Number(this.invoiceList.PackageCustomerTariff?.DriverDaily) || 0)
                }</td>			
                </tr>
                <tr class="bor">
                  <td colspan="8">Others</td>
                  <td class="total">${this.invoiceList.PackageCustomerTariff?.Others || ''}</td>			
                </tr> 
                <tr class="back_bor">
                  <td colspan="8">Toll Fee</td>
                  <td class="total">${this.invoiceList.PackageCustomerTariff?.Permit || ''}</td>			
                </tr>
                <tr class="bor">
                  <td colspan="8">Parking / Permit</td>
                  <td class="total">${this.invoiceList.PackageCustomerTariff?.Parking || ''}</td>			
                </tr>
                <tr class="bor">
                  <td colspan="7">CGST</td>
                  <td class="total">${this.invoiceList.PackageCustomerTariff?.CGST ? this.invoiceList.PackageCustomerTariff?.CGST + ' %': ''}</td>			
                  <td class="total">${this.invoiceList.PackageCustomerTariff?.CGST_Amt || ''}</td>			
                </tr>
                <tr class="back_bor">
                  <td colspan="7">SGST</td>
                  <td class="total">${this.invoiceList.PackageCustomerTariff?.SGST ? this.invoiceList.PackageCustomerTariff?.SGST + ' %': ''}</td>			
                  <td class="total">${this.invoiceList.PackageCustomerTariff?.SGST_Amt || ''}</td>			
                </tr>
                <tr class="bor">
                  <td colspan="7">IGST</td>
                  <td class="total">${this.invoiceList.PackageCustomerTariff?.IGST ? this.invoiceList.PackageCustomerTariff?.IGST + ' %': ''}</td>			
                  <td class="total">${this.invoiceList.PackageCustomerTariff?.IGST_Amt || ''}</td>			
                </tr>
                <td colspan="6" class="grand total">${getIndianCurrency(this.invoiceList?.PackageCustomerTariff?.NetAmt)}</td>
                <td colspan="2" style="text-align: center;" class="grand total">Net Amount</td>
                <td class="grand total">${this.invoiceList?.PackageCustomerTariff?.NetAmt}</td>
              </tbody>
            </table>
           
            <div style="margin-top: 10px; font-size: 12px; color: #000; display: flex; justify-content: space-between;">
              <div>
                GSTIN/UIN #: ${customerDetail.gst_no || ''}   Pan No: ${customerDetail.pan_no || ''}<br>
                HSN/SAC Code: ${customerDetail.hsn_code || ''} (Service Category: ${customerDetail.hsn_desc || ''})              
              </div>
              <div style="text-align: right;">
                For Forza Enterprises Pvt. Ltd
              </div>
            </div>
          </main>
          <footer style="margin-top: 15px; font-size: 11px; text-align: center; color: #000; border-top: 1px solid #AAAAAA; padding-top: 8px;">
            <div>Invoice was created on a computer and is valid without the signature and seal.</div>
          </footer>
        `;
    }

}
