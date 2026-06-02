import { Component, Input, Output, EventEmitter, ViewChild, inject, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../core/service/common.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PageEvent, MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatIconModule } from '@angular/material/icon';
import { HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // For search input
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { Location } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
@Component({
  selector: 'app-mat-table',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    FormsModule,
    TranslateModule,
    MatSlideToggleModule
  ],
  templateUrl: './mat-table.component.html',
  styleUrl: './mat-table.component.scss',
})
export class MatTableComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() columns: any[] = [];
  @Input() action: any = { add: true, edit: false, view: false, delete: false, print: false, submissions: false };
  @Input() URL: string = '';
  @Input() addedName: string = '';
  @Input() filterOptions: string[] = ['All'];
  @Input() customParams: any = {};
  @Output() edit = new EventEmitter<any>();
  @Output() view = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>(); 
  @Output() add = new EventEmitter<any>(); 
  @Output() orderClick = new EventEmitter<any>();
  @Output() print = new EventEmitter<any>();
  @Output() submissions = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('searchInput') searchInput!: any;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['action']; 
  totalLength = 0;
  public currentPageIndex: number = 0;
  pageSize = 10;
  showFirstLastButtons = false;
  isSearchOpen = false;
  searchTerm = '';
  sortBy = '';
  sortDirection = '';
selectedFilter: string = '';

  private liveAnnouncer = inject(LiveAnnouncer);
  private cdr = inject(ChangeDetectorRef);
  @Input() showBackButton: boolean = true;
  constructor(private commonService: CommonService,private translate:TranslateService,private location: Location) {}

  ngOnInit(): void {
    this.updateDisplayedColumns();
    this.getData();
    this.selectedFilter = this.filterOptions[0] || '';
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.sort.sortChange.subscribe((sortState: Sort) => {
      this.announceSortChange(sortState);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['columns'] ||
      changes['action']   
    ) {
      this.updateDisplayedColumns();
    }
    // if (changes['columns'] && !changes['columns'].firstChange) {
    //   this.updateDisplayedColumns();
    // }
    if (changes['customParams'] && !changes['customParams'].firstChange) {
    this.getData();
      }
    if (changes['URL'] && !changes['URL'].firstChange) {
      this.getData();
    }
    if (changes['filterOptions'] && !changes['filterOptions'].firstChange) {
      this.selectedFilter = this.filterOptions[0] || ''; // Reset on options change
    }
  }

  // private updateDisplayedColumns(): void {
  //   this.displayedColumns = [...this.columns.map((col: any) => col.columnDef), 'action'];
  // }
  private updateDisplayedColumns(): void {
    const hasAnyAction =
      this.action?.add ||
      this.action?.edit ||
      this.action?.view ||
      this.action?.delete ||
      this.action?.print ||
      this.action?.submissions; 
  
    this.displayedColumns = [
      ...this.columns.map((col: any) => col.columnDef),
      ...(hasAnyAction ? ['action'] : [])
    ];
  }

  async getData(customParams?: any, pageIndex?: number): Promise<void> {
    
    if (pageIndex !== undefined) {
        this.currentPageIndex = pageIndex;
    }

    let params = new HttpParams()
        .set('currentPage', (this.currentPageIndex + 1).toString())
        .set('pageSize', this.pageSize.toString())
        .set('maxPages', '10');

    if (this.sortBy) {
        params = params.set('sortBy', this.sortBy);
        params = params.set('sortDirection', this.sortDirection || 'asc');
    }

    if (this.searchTerm.trim()) {
        params = params.set('search', this.searchTerm.trim());
    }

    if (this.selectedFilter && this.selectedFilter !== 'Filter') {
        params = params.set('filter', this.selectedFilter);
    }

    const mergedParams = { ...this.customParams, ...customParams };
    if (mergedParams) {
        Object.keys(mergedParams).forEach(key => {
            params = params.set(key, mergedParams[key]);
        });
    }

    try {
        this.commonService.getApi(this.URL, params).subscribe({
            next: (res: any) => {
                let listData = [];
                if (res?.data?.data) {
                    listData = res.data.data;
                } else if (res?.products && Array.isArray(res.products)) {
                    listData = res.products;
                } else if (Array.isArray(res?.data)) {
                    listData = res.data;
                } else if (res?.data?.products) {
                    listData = res.data.products;
                } else {
                    const arrayKey = Object.keys(res || {}).find(
                        (key) => Array.isArray(res[key]) && key !== 'errors'
                    );
                    if (arrayKey) {
                        listData = res[arrayKey];
                    }
                }

                this.dataSource.data = listData || [];
                this.totalLength = res?.data?.totalItems || res?.totalItems || listData?.length || 0;
                this.currentPageIndex = (res?.data?.currentPage || res?.currentPage || 1) - 1;
                this.pageSize = res?.data?.pageSize || res?.pageSize || 10;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching data:', err);
                this.dataSource.data = [];
                this.totalLength = 0;
            }
        });
    } catch (error) {
        console.error('Error in getData:', error);
    }
}

// async getData(customParams?: any): Promise<void> {
//   let params = new HttpParams().set('currentPage', (this.currentPageIndex + 1).toString())
//     .set('pageSize', this.pageSize.toString())
//     .set('maxPages', '10');

//   if (this.sortBy) {
//     params = params.set('sortBy', this.sortBy);
//     params = params.set('sortDirection', this.sortDirection || 'asc');
//   }

//   if (this.searchTerm.trim()) {
//     params = params.set('search', this.searchTerm.trim());
//   }
// if (this.selectedFilter && this.selectedFilter !== 'Filter') {
//     params = params.set('filter', this.selectedFilter); // Backend receives 'filter=Booked' or 'Available'
//   }
//     const mergedParams = { ...this.customParams, ...customParams };
//   if (mergedParams) {
//     Object.keys(mergedParams).forEach(key => {
//       params = params.set(key, mergedParams[key]);
//     });
//   }

//   try {
//     this.commonService.getApi(this.URL, params).subscribe({
//       next: (res: any) => {
//         this.dataSource.data = res?.data?.data || [];
//         this.totalLength = res?.data?.totalItems || 0;
//         this.currentPageIndex = (res?.data?.currentPage || 1) - 1;
//         this.pageSize = res?.data?.pageSize || 10;
//         this.cdr.detectChanges();
//       },
//       error: (err) => {
//         console.error('Error fetching data:', err);
//         this.dataSource.data = [];
//         this.totalLength = 0;
//       }
//     });
//   } catch (error) {
//     console.error('Error in getData:', error);
//   }
// }

onFilterChange(): void {
    this.currentPageIndex = 0; // Reset to first page
    this.getData(); // Re-fetch with new filter param
  }
  onPageChange(event: PageEvent|any): void {
    this.currentPageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getData();
  }

  announceSortChange(sortState: Sort): void {
    console.log('Sort event:', sortState);
    if (sortState.direction) {
      this.liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this.liveAnnouncer.announce('Sorting cleared');
    }
    this.sortBy = sortState.active;
    this.sortDirection = sortState.direction;
    this.currentPageIndex = 0; // Reset to first page on sort
    this.getData();
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      setTimeout(() => {
        this.searchInput?.nativeElement?.focus();
      }, 0);
    } else {
      this.searchTerm = '';
      this.applyFilter({ target: { value: '' } } as unknown as Event);
    }
  }

  closeSearchOnBlur(): void {
    setTimeout(() => {
      this.isSearchOpen = false;
    }, 150);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchTerm = filterValue;
    this.dataSource.filter = filterValue; 
    this.currentPageIndex = 0; 
    this.getData(); 
  }
 onAdd(): void {
    if (this.action.add) {
      this.add.emit();
    }
  }
  onEdit(element: any): void {
    if (this.action.edit) {
      this.edit.emit(element);
    }
  }

  onView(element: any): void {
    if (this.action.view) {
      this.view.emit(element);
    }
  }

  onDelete(element: any): void {
    if (this.action.delete) {
       this.delete.emit(element);    
    }
  }
  onOrderClick(element: any, col: any): void {
    if (col.OrderId) {
      this.orderClick.emit(element); // Emit ID and full element
    }
  }
  onPrint(element: any): void {
    if (this.action.print) {
      this.print.emit(element);
    }
  }
  onExportChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    if (!target) return;
    const value = target.value;
    if (value === 'PDF') {
      this.exportToPDF();
    } else if (value === 'CSV') {
      this.exportToCSV();
    } else if (value === 'XLSX') {
      this.exportToXLSX();
    }
    // Reset select to 'Export' after action (optional)
    // document.getElementById('exportSelect')!.value = 'Export';
  }

  // Export to PDF using jsPDF
  exportToPDF(): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    const tableData = this.columns.map(col => col.header); // Headers
    const tableRows = this.dataSource.data.map(row => 
      this.columns.map(col => col.cell(row) || '') // Rows
    );

    autoTable(doc, {
      head: [tableData],
      body: tableRows,
      startY: 20,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save('table-data.pdf');
  }

  onSubmissions(element: any): void {
    if (this.action.submissions) { this.submissions.emit(element); }
  }

  goBack(): void {
    this.location.back();
  }

  // Export to CSV (manual string build)
  exportToCSV(): void {
    const headers = this.columns.map(col => col.header).join(',');
    const rows = this.dataSource.data.map(row => 
      this.columns.map(col => `"${col.cell(row) || ''}"`).join(',')
    ).join('\n');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'table-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export to XLSX (using xlsx library - npm install xlsx)
  exportToXLSX(): void {
    const ws = XLSX.utils.json_to_sheet(this.dataSource.data.map(row => 
      this.columns.reduce((obj, col) => ({ ...obj, [col.header]: col.cell(row) }), {})
    ));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, 'table-data.xlsx');
  }
  getMediaUrl(path: string) {
  if (!path) return '';
  return environment.domain + '/' + path || 'Logo/noimage1.jpg';
}
truncateText(text: string, limit: number = 16): string {
      if (!text) {
          return ''; 
      }
      return text.length > limit ? text.substring(0, limit) + '...' : text;
  }

  onPageSizeChange(): void {
    this.currentPageIndex = 0;  // ← reset to first page
    this.getData();
  }

  toggleStatus(element: any, col?: any): void {
    const statusOn  = col?.statusOn  || 'ACTIVE';
    const statusOff = col?.statusOff || 'INACTIVE';
    const toggleUrl = col?.toggleUrl || 'Videos/Update';   // ← use col.toggleUrl
  
    const newStatus = element.Status === statusOn ? statusOff : statusOn;
  
    const formData = new FormData();
    formData.append('Status', newStatus);
  
    this.commonService
      .postFormData(`${toggleUrl}/${element.Id}`, formData)  // ← was hardcoded
      .subscribe({
        next: (res: any) => {
          element.Status = newStatus;
          console.log('Status updated successfully', res);
        },
        error: (err: any) => {
          console.error('Status update failed', err);
        },
      });
  }
}