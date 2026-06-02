import {  Component,Input } from '@angular/core';
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
    selector: 'app-invoice-group-pdf',
    templateUrl: './invoice-group-pdf.component.html',
    styleUrls: ['./invoice-group-pdf.component.scss'],
    standalone: true,
    imports: [CommonModule,ReactiveFormsModule,MatTableModule,MatButtonModule,MatInputModule,MatSelectModule,MatIconModule,MatCardModule ,MatCheckboxModule],
})
export class InvoiceGroupPdfComponent {
  public apiRoute = 'InvoiceGroup/Pdf';
  isGeneratingPDF = false;
  @Input() data: any | null = null; 
  invoiceList: any;
  bookingnumber: any;
    constructor(private commonService: CommonService,) {}

//     async generatePDF(element?: any) {
//     this.isGeneratingPDF = true;
//     let invoiceData: any[] = [];
//     let invoiceTripDetailData: any[] = [];
//     try {
//       const res: any = await firstValueFrom(
//         this.commonService.getApi(`${this.apiRoute}/${element.Id}`, {})
//       );
//       this.invoiceList = res.data;
//       const invoiceBills = this.invoiceList.Invoices || [];
//         const invoiceDetailsBills = this.invoiceList.TripDetailsBills || [];
//                   const bookings = this.invoiceList.TripDetailsBookings || [];
//                   const customerTariffs = this.invoiceList.TripDetailsCustomerBillTariff || [];
//                   const TripDetailsenrichedBills = invoiceDetailsBills.map((bill: any) => {
//                   const relatedBooking =bookings.find((b: any) => b.Id === bill.BookingId) || {};
//                   const customerTariff =customerTariffs.find((t: any) => t.BillId === bill.Id) ||{};
//                   const parentInvoice = invoiceBills.find((inv: any) =>
//     inv.Bills?.some((b: any) => b.Id === bill.Id)
//   ) || {};
//                       return {
//                           ...bill,
//                               InvoiceNumber: parentInvoice.InvoiceNumber || null, // attach here

//                        Booking: {
//                           ...relatedBooking,
//                           TotalHrs: calculateHours(bill.OpenDate,bill.OpenTime,bill.CloseDate,bill.CloseTime),
//                           TotalKms:parseFloat(bill.CloseKMS) -parseFloat(bill.OpenKMS) || 0,
//                             },
//                           CustomerBillTariff: customerTariff,
//                       };
//                   });
//                   console.log('TripDetailsenrichedBills',TripDetailsenrichedBills)
//                    for (const bill of TripDetailsenrichedBills) {
//                 const invoiceDetail = {
//                     booking_number: bill.Booking.BookingNumber,
//                     BillId: bill.Id || null,
//                     trip_type: bill.Booking?.RentalType?.Code, 
//                     customer_id: bill.CustomerCompanyParentId,
//                     vehicle_no: bill.VehicleNumber,
//                     vehicle_model: bill.VehicleModelId || '',
//                     open_date: bill.OpenDate,
//                     open_time: bill.OpenTime,
//                     close_time: bill.CloseTime,
//                     close_date: bill.CloseDate,
//                     c_total_km: bill.CloseKMS - bill.OpenKMS,
//                     c_total_hrs: bill.TotalHrs,
//                     permit: bill.CustomerBillTariff?.Permit || 0,
//                     others: bill.CustomerBillTariff?.Others || 0,
//                     parking: bill.CustomerBillTariff?.Parking || 0,
//                     cardamount: bill.CustomerBillTariff?.CardAmt || 0,
//                     loc_allowance:Number(bill.CustomerBillTariff?.LocalAllowance) || 0,
//                     TotalAllowance:Number(bill.CustomerBillTariff?.TotalAllowance) || 0,
//                     os_allowance:Number(bill.CustomerBillTariff?.OsAllowance) || 0,
//                     os_night_allowance:Number(bill.CustomerBillTariff?.OsNightAllow) || 0,
//                     c_slab_rate: Number(bill.CustomerBillTariff?.Rate) || 0,
//                     c_ex_km: Number(bill.CustomerBillTariff?.ExtraKms) || 0,
//                     c_ex_km_rate:Number(bill.CustomerBillTariff?.ExtraKmRate) || 0,
//                     c_ex_km_amt: Number(bill.CustomerBillTariff?.ExKmAmt) || 0,
//                     c_ex_hr: Number(bill.CustomerBillTariff?.ExtraHours) || 0,
//                     c_ex_hour_rate:Number(bill.CustomerBillTariff?.ExtraHourRate) || 0,
//                     c_ex_hr_amt: Number(bill.CustomerBillTariff?.ExHrAmt) || 0,
//                     cgst_amt: Number(bill.CustomerBillTariff?.CGST_Amt) || 0,
//                     c_discount_amt:Number(bill.CustomerBillTariff?.DiscountAmt) || 0,
//                     c_card_amt: Number(bill.CustomerBillTariff?.CardAmt) || 0,
//                     c_sgst_amt: Number(bill.CustomerBillTariff?.SGST_Amt) || 0,
//                     c_igst_amt: Number(bill.CustomerBillTariff?.IGST_Amt) || 0,
//                     cgst: Number(bill.CustomerBillTariff?.CGST) || 0,
//                     sgst: Number(bill.CustomerBillTariff?.SGST) || 0,
//                     igst: Number(bill.CustomerBillTariff?.IGST) || 0,
//                     invoice_amt:Number(bill.CustomerBillTariff?.InvoiceAmt) || 0,
//                     card: Number(bill.CustomerBillTariff?.Card) || 0,
//                     Naration: bill.CustomerBillTariff?.Naration || '',
//                     netAmt: Number(bill.CustomerBillTariff?.NetAmt) || 0,
//                     // BookerBy: `${bill?.Booking?.Booker[0]?.FirstName || ''} ${bill?.Booking?.Booker[0]?.LastName || ''}`,
//                     // guest: `${bill?.Booking?.Guests?.FirstName || ''} ${bill?.Booking?.Guests?.LastName || ''}`,
//                 };
//                 const customerDetail = {
//                     customers_id: bill.CustomerCompanyParentId,
//                     customer_name:bill.Booking?.CustomerCompanyParent?.Name || '',
//                     vendor_name: bill.Booking?.VendorCompany?.Name || '',
//                     branch_address: `${bill?.Booking?.VendorCompany?.CompanyAddress?.AddressLine_1 || ''}, ${
//                         bill?.Booking?.VendorCompany?.CompanyAddress?.AddressLine_2 || ''},${
//                         bill?.Booking?.VendorCompany?.CompanyAddress?.City || ''},${
//                         bill?.Booking?.VendorCompany?.CompanyAddress?.State ||''
//                     }`,
//                     company_phone:bill.Booking?.VendorCompany?.PhoneNumber || '',
//                     company_email: bill.Booking?.VendorCompany?.Email || '',
//                     customer_address: `${bill?.Booking?.CustomerCompanyParent?.CustomerAddress?.AddressLine_1 || ''}, ${
//                         bill?.Booking?.CustomerCompanyParent?.CustomerAddress?.AddressLine_2 || ''},${
//                         bill?.Booking?.CustomerCompanyParent?.CustomerAddress?.City || ''},${
//                         bill?.Booking?.CustomerCompanyParent?.CustomerAddress?.State || ''}`,
//                     hsn_code:bill?.Booking?.CustomerCompanyParent?.HsnCode || 'null',
//                     hsn_desc:bill?.Booking?.CustomerCompanyParent?.HsnDescription ||'null',
//                     project_id: bill?.Booking?.ProjectId || '',
//                     request_id: bill?.Booking?.RequestId || '',
//                     employee_id: bill?.Booking?.Guests?.EmployeeCode || '',
//                     gst_no: bill?.Booking?.CustomerCompanyParent?.GstNo || '',
//                     pan_no: bill?.Booking?.CustomerCompanyParent?.PanNo || '',
//                 };

//                 const ceAllowance = invoiceDetail.TotalAllowance;
//                 const total = Number(invoiceDetail.c_slab_rate) + Number(invoiceDetail.c_ex_km_amt) + Number(invoiceDetail.c_ex_hr_amt);

//                 invoiceTripDetailData.push({invoiceDetail,customerDetail,ceAllowance,total,});
//             }
//       for (const invoice of invoiceBills) {
//         const firstBill = invoice.Bills && invoice.Bills.length > 0 ? invoice.Bills[0] : {};
//         const customerBillTariff = firstBill.CustomerBillTariff || {};
//         let totalParking = 0;
//         let totalCgst = 0;
//         let totalSgst = 0;
//         let totalIgst = 0;
//         let totalNetAmt = 0;
//         let totalCardAmt = 0;
//         let totalDiscountAmt = 0;
//         let totalGrossAmt = 0;
//         let totalBata = 0;

//         if (invoice.Bills) {
//           for (const bill of invoice.Bills) {
//             const tariff = bill.CustomerBillTariff || {};
//             totalParking += Number(tariff.Others || 0) + Number(tariff.Parking || 0) + Number(tariff.Permit || 0);
//             totalCgst += Number(tariff.CGST_Amt || 0);
//             totalSgst += Number(tariff.SGST_Amt || 0);
//             totalIgst += Number(tariff.IGST_Amt || 0);
//             totalNetAmt += Number(tariff.InvoiceAmt || 0);
//             totalCardAmt += Number(tariff.CardAmt || 0);
//             totalDiscountAmt += Number(tariff.DiscountAmt || 0);
//             totalGrossAmt += Number(tariff.Rate || 0) + Number(tariff.ExKmAmt || 0) + Number(tariff.ExHrAmt || 0);
//             totalBata += Number(tariff.LocalAllowance || 0) + Number(tariff.OsAllowance || 0) + Number(tariff.OsNightAllow || 0);
//           }
//         }

//         const invoiceDetail = {
//           invoice_number: invoice.InvoiceNumber,
//           bill_id: invoice.Id || null,
//           bill_date: invoice.InvoiceDate, 
//           totalparking: totalParking,
//           cgst_amt: totalCgst,
//           sgst_amt: totalSgst,
//           igst_amt: totalIgst,
//           net_amt: totalNetAmt,
//           card_amt: totalCardAmt,
//           discount_amt: totalDiscountAmt,
//           gross_amt: totalGrossAmt,
//           bata: totalBata,
//           ordered_by: `${invoice?.Bookings?.Booker?.FirstName || ''} ${invoice?.Bookings?.Booker?.LastName || ''}`,
//           passenger: `${invoice?.Bookings?.Guests?.FirstName || ''} ${invoice?.Bookings?.Guests?.LastName || ''}`,
//           Naration: customerBillTariff.Naration || '',
//         };
//         const customerDetail = {
//           customers_id: this.invoiceList.CustomerCompanyId,
//           customer_name: this.invoiceList?.CustomerCompany?.Name || '',
//           vendor_name: this.invoiceList.VendorCompany?.Name || '',
//           branch_address: `${this.invoiceList?.VendorCompany?.CompanyAddress?.AddressLine_2 || ''},${this.invoiceList?.VendorCompany?.CompanyAddress?.City || ''},${this.invoiceList?.VendorCompany?.CompanyAddress?.State || ''}`,
//           company_pincode: this.invoiceList.VendorCompany?.CompanyAddress?.Pincode || '',
//           company_phone: this.invoiceList.VendorCompany?.PhoneNumber || '',
//           company_email: this.invoiceList.VendorCompany?.Email || '',
//           customer_address: `${this.invoiceList?.CustomerCompany?.CompanyAddress?.AddressLine_1 || ''}, ${this.invoiceList?.CustomerCompany?.CompanyAddress?.AddressLine_2 || ''},${this.invoiceList?.CustomerCompany?.CompanyAddress?.City || ''},${this.invoiceList?.CustomerCompany?.CompanyAddress?.State || ''}`,
//           hsn_code: this.invoiceList?.CustomerCompany?.HsnCode || 'null',
//           hsn_desc: this.invoiceList?.CustomerCompany?.HsnDescription || 'null',
//           gst_no: this.invoiceList?.CustomerCompany?.GstNo || '',
//           pan_no: this.invoiceList?.CustomerCompany?.PanNo || '',
//         };
//         invoiceData.push({invoiceDetail, customerDetail});
//       }
//      const pdf = new jsPDF('p', 'mm', 'a4', true);
//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const margin = 10;
//     const scale = 3;

//     // --- PAGE 1: Invoice table ---
//     const htmlContent = this.generateInvoiceHTML(
//       invoiceData.map((data) => data.invoiceDetail),
//       invoiceData[0].customerDetail
//     );
//     const tempDiv = document.createElement('div');
//     tempDiv.style.position = 'absolute';
//     tempDiv.style.left = '-9999px';
//     tempDiv.style.width = `${pageWidth - 2 * margin}mm`;
//     tempDiv.style.fontSize = '12px';
//     tempDiv.innerHTML = htmlContent;
//     document.body.appendChild(tempDiv);

//     const canvas = await html2canvas(tempDiv, {
//       scale: scale,
//       useCORS: true,
//       logging: false,
//       backgroundColor: '#fff',
//       width: tempDiv.offsetWidth,
//       height: tempDiv.offsetHeight
//     });

//     const imgData = canvas.toDataURL('image/png');
//     const imgProps = pdf.getImageProperties(imgData);
//     const pdfWidth = pageWidth - 2 * margin;
//     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
//     pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth, pdfHeight);

//     document.body.removeChild(tempDiv);

//     // --- PAGE 2: Extra Summary Table ---
//    pdf.addPage();
//    const totalSum = invoiceTripDetailData.reduce((sum, data) => sum + data.total,0);
//             const ceAllowanceSum = invoiceTripDetailData.reduce((sum, data) => sum + data.ceAllowance,0);
//             const netAmt = invoiceTripDetailData.reduce((sum, data) => sum + Number(data?.invoiceDetail?.netAmt || 0),0);
//             const extraHtml = this.generateExtraTableHTML(
//                 invoiceTripDetailData.map((data) => data.invoiceDetail),
//                 invoiceTripDetailData[0]?.customerDetail,
//                 totalSum,
//                 ceAllowanceSum,
//                 netAmt
//             );

// const extraDiv = document.createElement('div');
// extraDiv.style.position = 'absolute';
// extraDiv.style.left = '-9999px';
// extraDiv.style.width = `${pageWidth - 2 * margin}mm`;
// extraDiv.style.fontSize = '12px';
// extraDiv.style.backgroundColor = '#fff'; // ensure white background
// extraDiv.innerHTML = extraHtml;
// document.body.appendChild(extraDiv);

// const extraCanvas = await html2canvas(extraDiv, {
//   scale: scale,
//   useCORS: true,
//   logging: false,
//   backgroundColor: '#fff'
// });

// const extraImgData = extraCanvas.toDataURL('image/png');
// const extraImgProps = pdf.getImageProperties(extraImgData);
// const extraPdfWidth = pageWidth - 2 * margin;
// const extraPdfHeight = (extraImgProps.height * extraPdfWidth) / extraImgProps.width;

// // Always start at margin (top-left) of the new page
// pdf.addImage(extraImgData, 'PNG', margin, margin, extraPdfWidth, extraPdfHeight);

// document.body.removeChild(extraDiv);
    
//     pdf.save(`InvoiceGroup_${element?.GroupInvoiceNumber}.pdf`);
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//     } finally {
//       this.isGeneratingPDF = false;
//     }
//   }


async generatePDF(element?: any) {
  this.isGeneratingPDF = true;
  let invoiceData: any[] = [];
  let invoiceTripDetailData: any[] = [];
  
  try {
    const res: any = await firstValueFrom(
      this.commonService.getApi(`${this.apiRoute}/${element.Id}`, {})
    );
    this.invoiceList = res.data;
    const invoiceBills = this.invoiceList.Invoices || [];
    const invoiceDetailsBills = this.invoiceList.TripDetailsBills || [];
    const bookings = this.invoiceList.TripDetailsBookings || [];
    const customerTariffs = this.invoiceList.TripDetailsCustomerBillTariff || [];
    for (const invoice of invoiceBills) {
      const firstBill = invoice.Bills && invoice.Bills.length > 0 ? invoice.Bills[0] : {};
      const customerBillTariff = firstBill.CustomerBillTariff || {};
      let totalParking = 0;
      let totalCgst = 0;
      let totalSgst = 0;
      let totalIgst = 0;
      let totalNetAmt = 0;
      let totalCardAmt = 0;
      let totalDiscountAmt = 0;
      let totalGrossAmt = 0;
      let totalBata = 0;

      if (invoice.Bills) {
        for (const bill of invoice.Bills) {
          const tariff = bill.CustomerBillTariff || {};
          totalParking += Number(tariff.Others || 0) + Number(tariff.Parking || 0) + Number(tariff.Permit || 0);
          totalCgst += Number(tariff.CGST_Amt || 0);
          totalSgst += Number(tariff.SGST_Amt || 0);
          totalIgst += Number(tariff.IGST_Amt || 0);
          totalNetAmt += Number(tariff.InvoiceAmt || 0);
          totalCardAmt += Number(tariff.CardAmt || 0);
          totalDiscountAmt += Number(tariff.DiscountAmt || 0);
          totalGrossAmt += Number(tariff.Rate || 0) + Number(tariff.ExKmAmt || 0) + Number(tariff.ExHrAmt || 0);
          totalBata += Number(tariff.LocalAllowance || 0) + Number(tariff.OsAllowance || 0) + Number(tariff.OsNightAllow || 0);
        }
      }

      const invoiceDetail = {
        invoice_number: invoice.InvoiceNumber,
        bill_id: invoice.Id || null,
        bill_date: invoice.InvoiceDate, 
        totalparking: totalParking,
        cgst_amt: totalCgst,
        sgst_amt: totalSgst,
        igst_amt: totalIgst,
        net_amt: totalNetAmt,
        card_amt: totalCardAmt,
        discount_amt: totalDiscountAmt,
        gross_amt: totalGrossAmt,
        bata: totalBata,
        ordered_by: `${invoice?.Bookings?.Booker?.FirstName || ''} ${invoice?.Bookings?.Booker?.LastName || ''}`,
        passenger: `${invoice?.Bookings?.Guests?.FirstName || ''} ${invoice?.Bookings?.Guests?.LastName || ''}`,
        Naration: customerBillTariff.Naration || '',
      };
      
      const customerDetail = {
        customers_id: this.invoiceList.CustomerCompanyId,
        customer_name: this.invoiceList?.CustomerCompany?.Name || '',
        vendor_name: this.invoiceList.VendorCompany?.Name || '',
        branch_address: `${this.invoiceList?.VendorCompany?.CompanyAddress?.AddressLine_2 || ''},${this.invoiceList?.VendorCompany?.CompanyAddress?.City || ''},${this.invoiceList?.VendorCompany?.CompanyAddress?.State || ''}`,
        company_pincode: this.invoiceList.VendorCompany?.CompanyAddress?.Pincode || '',
        company_phone: this.invoiceList.VendorCompany?.PhoneNumber || '',
        company_email: this.invoiceList.VendorCompany?.Email || '',
        customer_address: `${this.invoiceList?.CustomerCompany?.CompanyAddress?.AddressLine_1 || ''}, ${this.invoiceList?.CustomerCompany?.CompanyAddress?.AddressLine_2 || ''},${this.invoiceList?.CustomerCompany?.CompanyAddress?.City || ''},${this.invoiceList?.CustomerCompany?.CompanyAddress?.State || ''}`,
        hsn_code: this.invoiceList?.CustomerCompany?.HsnCode || 'null',
        hsn_desc: this.invoiceList?.CustomerCompany?.HsnDescription || 'null',
        gst_no: this.invoiceList?.CustomerCompany?.GstNo || '',
        pan_no: this.invoiceList?.CustomerCompany?.PanNo || '',
      };
      
      invoiceData.push({invoiceDetail, customerDetail});
    }
console.log('invoiceDetailsBills',invoiceDetailsBills)
    for (const bill of invoiceDetailsBills) {
      const relatedBooking = bookings.find((b: any) => b.Id === bill.BookingId) || {};
      const customerTariff = customerTariffs.find((t: any) => t.BillId === bill.Id) || {};
      const parentInvoice = invoiceBills.find((inv: any) =>
        inv.Bills?.some((b: any) => b.Id === bill.Id)
      ) || {};
      
      const invoiceNumber = parentInvoice.InvoiceNumber || 'UNKNOWN';
      const invoiceDetail = {
        invoice_number: invoiceNumber,
        invoice_date: parentInvoice.InvoiceDate,
        booking_number: relatedBooking.BookingNumber,
        vehicle_no: bill.VehicleNumber,
        vehicle_model: relatedBooking.TripDetailsVehiclemodel?.Model || '',
        open_date: bill.OpenDate,
        close_date: bill.CloseDate,
        c_total_km: parseFloat(bill.CloseKMS) - parseFloat(bill.OpenKMS) || 0,
        c_total_hrs: calculateHours(bill.OpenDate, bill.OpenTime, bill.CloseDate, bill.CloseTime),
        permit: customerTariff?.Permit || 0,
        others: customerTariff?.Others || 0,
        parking: customerTariff?.Parking || 0,
        cardamount: customerTariff?.CardAmt || 0,
        loc_allowance: Number(customerTariff?.LocalAllowance) || 0,
        TotalAllowance: Number(customerTariff?.TotalAllowance) || 0,
        os_allowance: Number(customerTariff?.OsAllowance) || 0,
        os_night_allowance: Number(customerTariff?.OsNightAllow) || 0,
        c_slab_rate: Number(customerTariff?.Rate) || 0,
        c_ex_km: Number(customerTariff?.ExtraKms) || 0,
        c_ex_km_rate: Number(customerTariff?.ExtraKmRate) || 0,
        c_ex_km_amt: Number(customerTariff?.ExKmAmt) || 0,
        c_ex_hr: Number(customerTariff?.ExtraHours) || 0,
        c_ex_hour_rate: Number(customerTariff?.ExtraHourRate) || 0,
        c_ex_hr_amt: Number(customerTariff?.ExHrAmt) || 0,
        cgst_amt: Number(customerTariff?.CGST_Amt) || 0,
        c_discount_amt: Number(customerTariff?.DiscountAmt) || 0,
        c_card_amt: Number(customerTariff?.CardAmt) || 0,
        c_sgst_amt: Number(customerTariff?.SGST_Amt) || 0,
        c_igst_amt: Number(customerTariff?.IGST_Amt) || 0,
        cgst: Number(customerTariff?.CGST) || 0,
        sgst: Number(customerTariff?.SGST) || 0,
        igst: Number(customerTariff?.IGST) || 0,
        invoice_amt: Number(customerTariff?.InvoiceAmt) || 0,
        card: Number(customerTariff?.Card) || 0,
        Naration: customerTariff?.Naration || '',
        netAmt: Number(customerTariff?.NetAmt) || 0,
      };

      const ceAllowance = invoiceDetail.TotalAllowance;
      const total = Number(invoiceDetail.c_slab_rate) + Number(invoiceDetail.c_ex_km_amt) + Number(invoiceDetail.c_ex_hr_amt);

      invoiceTripDetailData.push({
        invoiceDetail,
        ceAllowance,
        total,
        invoiceNumber: invoiceNumber
      });
    }

    const pdf = new jsPDF('p', 'mm', 'a4', true);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const scale = 3;

    if (invoiceData.length > 0) {
      const htmlContent = this.generateInvoiceHTML(
        invoiceData.map((data) => data.invoiceDetail),
        invoiceData[0].customerDetail
      );
      
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = `${pageWidth - 2 * margin}mm`;
      tempDiv.style.fontSize = '12px';
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#fff',
        width: tempDiv.offsetWidth,
        height: tempDiv.offsetHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth - 2 * margin;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth, pdfHeight);

      document.body.removeChild(tempDiv);
    }


    const tripDataByInvoice: {[key: string]: any[]} = {};
    invoiceTripDetailData.forEach(item => {
      const invoiceNum = item.invoiceNumber;
      if (!tripDataByInvoice[invoiceNum]) {
        tripDataByInvoice[invoiceNum] = [];
      }
      tripDataByInvoice[invoiceNum].push(item);
    });

    const uniqueInvoiceNumbers = [...new Set(invoiceTripDetailData.map(item => item.invoiceNumber))];

    for (const invoiceNumber of uniqueInvoiceNumbers) {
      const tripDataForThisInvoice = tripDataByInvoice[invoiceNumber] || [];
      
      if (tripDataForThisInvoice.length > 0) {
        pdf.addPage();
        
        const totalSum = tripDataForThisInvoice.reduce((sum, data) => sum + data.total, 0);
        const ceAllowanceSum = tripDataForThisInvoice.reduce((sum, data) => sum + data.ceAllowance, 0);        
        const extraHtml = this.generateExtraTableHTML(tripDataForThisInvoice.map((data) => data.invoiceDetail),totalSum,ceAllowanceSum,);
        const extraDiv = document.createElement('div');
        extraDiv.style.position = 'absolute';
        extraDiv.style.left = '-9999px';
        extraDiv.style.width = `${pageWidth - 2 * margin}mm`;
        extraDiv.style.fontSize = '12px';
        extraDiv.style.backgroundColor = '#fff';
        extraDiv.innerHTML = extraHtml;
        document.body.appendChild(extraDiv);

        const extraCanvas = await html2canvas(extraDiv, {
          scale: scale,
          useCORS: true,
          logging: false,
          backgroundColor: '#fff'
        });

        const extraImgData = extraCanvas.toDataURL('image/png');
        const extraImgProps = pdf.getImageProperties(extraImgData);
        const extraPdfWidth = pageWidth - 2 * margin;
        const extraPdfHeight = (extraImgProps.height * extraPdfWidth) / extraImgProps.width;
        pdf.addImage(extraImgData, 'PNG', margin, margin, extraPdfWidth, extraPdfHeight);
        document.body.removeChild(extraDiv);
      }
    }
    
    pdf.save(`InvoiceGroup_${element?.GroupInvoiceNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    this.isGeneratingPDF = false;
  }
}
generateInvoiceHTML(invoiceDetail: any | any[], customerDetail: any): string {
    const isArray = Array.isArray(invoiceDetail);
    const invoiceDetails = isArray ? invoiceDetail : [invoiceDetail];
    const totalnetamt = invoiceDetails.reduce((sum, detail) => sum + (Number(detail.net_amt) || 0), 0);
    const totalcardamt = invoiceDetails.reduce((sum, detail) => sum + (Number(detail.card_amt) || 0), 0);
    const totaligstamt = invoiceDetails.reduce((sum, detail) => sum + (Number(detail.igst_amt) || 0), 0);
    const totalsgstamt = invoiceDetails.reduce((sum, detail) => sum + (Number(detail.sgst_amt) || 0), 0);
    const totalcgstamt = invoiceDetails.reduce((sum, detail) => sum + (Number(detail.cgst_amt) || 0), 0);
    const totalgrossamt = invoiceDetails.reduce((sum, detail) => sum + (Number(detail.gross_amt) || 0), 0);
    const totalparkingamt = invoiceDetails.reduce((sum, detail) => sum + (Number(detail.totalparking) || 0), 0);
    const totalbata = invoiceDetails.reduce((sum, detail) => sum + (Number(detail.bata) || 0), 0);
    const totaldiscountamt = invoiceDetails.reduce((sum, detail) => sum + (Number(detail.discount_amt) || 0), 0.00);
  return `
    <style>
      body {
        font-size: 12px; /* Base font size */
        font-family: Arial, sans-serif;
        color: #000;
        width: 100%;
        margin: 0;
        padding: 0;
      }
      table tbody tr:nth-child(odd) {
        background-color: #F5F5F5;
      }
      
      table tbody tr:nth-child(even) {
        background-color: #FFFFFF;
      }
      .total {
        font-weight: bold;
      }
      .grand.total {
        font-weight: bold;
        font-size: 12px;
      }
      .tablestyle{
      color: #000;
      border: 1px solid #ddd;
      padding: 5px;text-align: left;
      font-size: 9px;
      }
      .tablebodystyle{
      border: 1px solid #ddd;
      padding: 5px;
      font-size: 8px;
      }
    .tablebodystyle1{
      font-weight: bold;
      border: 1px solid #ddd;
      padding: 5px;
      font-size: 8px;
      }
    </style>
    
    <div style="width: 100%; padding: 0; margin: 0;">
      <header style="padding: 5px 0; margin-bottom: 10px; border-bottom: 1px solid #AAAAAA; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center;">
          <img style="height: 30px; width: 150px;" src="Logo/TRYPDEKLOGO2.png" alt="logo-icon" />
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; font-size: 14px;">${customerDetail.vendor_name}</h2>
          <div style="font-size: 11px;">${customerDetail.branch_address}</div>
          <div style="font-size: 11px;">${customerDetail.company_pincode}</div>
          <div style="font-size: 11px;">${customerDetail.company_phone}</div>
          <div style="font-size: 11px;">${customerDetail.company_email}</div>
        </div>
      </header>
      
      <main>        
        <div id="details" style="margin-bottom: 15px;">
          <div style="padding-left: 6px; border-left: 6px solid #0087C3; width: 68%;">
            <div style="margin: 3px 0; font-size: 13px; font-weight: bold;">INVOICE TO:</div>
            <h2 style="margin: 3px 0; font-size: 13px;">${customerDetail.customer_name || 'Unknown Customer'}</h2>
            <div style="font-size: 11px;">${customerDetail.customer_address || ''}</div>
            <div style="font-size: 11px;">Group Invoice No: ${this.invoiceList?.GroupInvoiceNumber || ''}</div>
            <div style="font-size: 11px;">Group Invoice Date: ${new Date(this.invoiceList?.GroupInvoiceDate).toLocaleDateString('en-IN')}</div>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; margin-top: 15px;">
          <thead>
            <tr style="background-color: #fff;">
              <th class="tablestyle">Invoice No</th>
              <th class="tablestyle">Invoice Date</th>
              <th class="tablestyle">Ordered By</th>
              <th class="tablestyle">Passenger</th>
              <th class="tablestyle">Gross Amount</th>
              <th class="tablestyle"> Parking/permit <br> /others</th>
              <th class="tablestyle">Bata</th>
              <th class="tablestyle">Less Dedn</th>
              <th class="tablestyle">Sgst</th>
              <th class="tablestyle">Cgst</th>
              <th class="tablestyle">Igst</th>
              <th class="tablestyle">Card Chargers</th>
              <th class="tablestyle">Net Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceDetails.map((detail) => `
              <tr>
                <td class="tablebodystyle">${detail.invoice_number}</td>
                <td class="tablebodystyle">${detail.bill_date}</td>
                <td class="tablebodystyle">${detail.ordered_by}</td>
                <td class="tablebodystyle">${detail.passenger}</td>
                <td class="tablebodystyle">${(detail.gross_amt || 0).toFixed(2)}</td>
                <td class="tablebodystyle">${(detail.totalparking || 0).toFixed(2)}</td>
                <td class="tablebodystyle">${(detail.bata || 0).toFixed(2)}</td>
                <td class="tablebodystyle">${(detail.discount_amt|| 0).toFixed(2)}</td>
                <td class="tablebodystyle">${(detail.cgst_amt || 0|| 0).toFixed(2)}</td>
                <td class="tablebodystyle">${(detail.sgst_amt || 0).toFixed(2)}</td>
                <td class="tablebodystyle">${(detail.igst_amt|| 0).toFixed(2)}</td>
                <td class="tablebodystyle">${(detail.card_amt|| 0).toFixed(2)}</td>
                <td class="tablebodystyle">${(detail.net_amt|| 0).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="3"></td>
              <td class="tablebodystyle1">Total</td>
              <td class="tablebodystyle1">${(totalgrossamt || 0).toFixed(2)}</td>
              <td class="tablebodystyle1">${(totalparkingamt || 0).toFixed(2)}</td>
              <td class="tablebodystyle1">${(totalbata || 0).toFixed(2)}</td>
              <td class="tablebodystyle1">${(totaldiscountamt || 0).toFixed(2)}</td>
              <td class="tablebodystyle1">${(totalcgstamt || 0).toFixed(2)}</td>
              <td class="tablebodystyle1">${(totalsgstamt || 0).toFixed(2)}</td>
              <td class="tablebodystyle1">${(totaligstamt || 0).toFixed(2)}</td>
              <td class="tablebodystyle1">${(totalcardamt || 0).toFixed(2)}</td>
              <td class="tablebodystyle1">${(totalnetamt || 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div style="margin-top: 10px; margin-bottom: 20px; font-size: 11px;">
          <div>
            HSN/SAC Code: ${customerDetail.hsn_code} (Service Category: ${customerDetail.hsn_desc})<br>
            Pan No: ${customerDetail.pan_no}<br>
            GSTIN/UIN #: ${customerDetail.gst_no}<br>
          </div>
        </div>
        
        <div style="font-size: 16px; margin-bottom: 20px;">Thank you!</div>
        <div style="font-size: 11px; border-bottom: 1px solid #AAAAAA;">
          <div style="padding-left: 6px; border-left: 6px solid #0087C3;">
            <div>Terms and Conditions:</div>
            <p style ="color: #000;">
              1. Clarification if any, on the bill/trip sheet must be sought for within 7 days from the day of submission, failing which it shall deemed to be in order<br>
              2. Surcharge of 5.90% and 3% will be charged on the bill amount for American Express & Master /Visa Cards respectively<br>
              3. Cheque need to be issued in favor of FORZA ENTERPRISES PVT LTD<br>
              4. Amount will be non refundable , Once the bill gets generated and the payment has been done<br>
            </p>
            <span style="float: left;">${getIndianCurrency(totalnetamt)}</span>
          </div>
        </div>
      </main>
    </div>
  `;
}

  generateExtraTableHTML(invoiceDetail: any | any[] | {},total: number,ceAllowance: number): string {
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
    .tablehead{
    border: 1px solid #ddd; 
    padding: 5px; 
    text-align: left;
    }
    .tablebody{
    border: 1px solid #ddd; 
    padding: 5px;
    }
  </style>
     
      <main style="font-family: Arial, sans-serif; font-size: 10px; color: #000;">
        <div style="margin-top: 15px; font-size: 13px; font-weight: bold;">INVOICE DETAILS:</div>
        <table style="width: 100%;  color: #000; border-collapse: collapse; font-size: 9px; margin-top: 15px; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #FFFFFF;">
              <th class="tablehead">Invoice No</th>
              <th class="tablehead">Invoice Date</th>
              <th class="tablehead">Booking No</th>
              <th class="tablehead">Trip Date</th>
              <th class="tablehead">Vehicle No & Type</th>
              <th class="tablehead">Total Usage<br>Kms | Hrs | Days</th>
              <th class="tablehead">Slab Rate</th>
              <th class="tablehead">Extra Hours<br>Hrs | Rate | Amt</th>
              <th class="tablehead">Extra KMS<br>Kms | Rate | Amt</th>
              <th class="tablehead">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceDetails.map((detail) => `
              <tr>
                <td class="tablebody">${detail.invoice_number || ''}</td>
                <td class="tablebody">${detail.invoice_date || ''}</td>
                <td class="tablebody">${detail.booking_number || ''}</td>
                <td class="tablebody">${new Date(detail.open_date).toLocaleDateString('en-IN')}</td>
                <td class="tablebody">${detail.vehicle_no || ''} ${detail.vehicle_model || ''}</td>
                <td class="tablebody">${detail.c_total_km || 0} | ${detail.c_total_hrs || 0} | ${Math.floor((detail.c_total_hrs || 0) / 24)}</td>
                <td class="tablebody">${detail.c_slab_rate?.toFixed(2) || '0.00'}</td>
                <td class="tablebody">${detail.c_ex_hr || 0} | ${detail.c_ex_hour_rate?.toFixed(2) || '0.00'} | ${detail.c_ex_hr_amt?.toFixed(2) || '0.00'}</td>
                <td class="tablebody">${detail.c_ex_km || 0} | ${detail.c_ex_km_rate?.toFixed(2) || '0.00'} | ${detail.c_ex_km_amt?.toFixed(2) || '0.00'}</td>
                <td class="tablebody">${(Number(detail.c_slab_rate || 0) +Number(detail.c_ex_km_amt || 0) +Number(detail.c_ex_hr_amt || 0)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 10px;">
          <div style="width: 70%;"></div>
          <div style="width: 25%;">
            <table style="width: 100%; color: #000; border-collapse: collapse; border: 1px solid #AAAAAA; font-size: 10px;">
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
      </main>
      <footer style="margin-top: 15px; font-size: 10px; text-align: center; color: #000; padding-top: 8px;">
        <div>Invoice was created on a computer and is valid without the signature and seal.</div>
      </footer>
    `;
    }
}
