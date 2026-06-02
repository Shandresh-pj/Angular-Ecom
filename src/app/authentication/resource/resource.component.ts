import { Component,OnInit} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {ReactiveFormsModule,FormControl, FormGroup, FormBuilder, Validators,FormsModule} from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Utils } from '../../utils';
import { CommonService } from '../../core/service/common.service';
@Component({
  selector: 'app-resource',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatMenuModule, MatTableModule,FormsModule, MatCheckboxModule,MatFormFieldModule, MatInputModule, MatSelectModule,RouterLink,MatFormFieldModule, MatInputModule, FormsModule,
    ReactiveFormsModule , MatSelectModule,MatButtonModule, MatTableModule],
  templateUrl: './resource.component.html',
  styleUrl: './resource.component.scss'
})
export class ResourceComponent extends Utils implements OnInit {
  public apiRoute='Resources';
  public uiPagePath='Resources';
public resourceForm : FormGroup;
resourceTypes: string[] = ['API', 'WEB', 'MOBILE', 'CUSTOMER', 'VENDOR'];
IsPublic: string[] = ['Yes', 'No'];
  displayedColumns: string[] = [ 'id', 'resourcename', 'resourceurl','position', 'action'];
  dataSource = new MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);
    vehicleTypeList: any;
    vehicleTypeEdit: any;
    viewOpen: boolean=true;
    allResources: any;
    ResourcesEdit: any;
    addnew: boolean=true;
constructor(private formBuilder: FormBuilder,
public themeService: CustomizerSettingsService,
private commonService: CommonService,
private router: Router
){
  super();
this.resourceForm = this.formBuilder.group({
  Id: [''],
  ResourceName: ['', Validators.required],
  ResourceType: ['', Validators.required],
  IsPublic: ['', Validators.required],
  Position:['', Validators.required],
  ParentId:['', Validators.required],
  ResourceUrl:['', Validators.required],
});

this.themeService.isToggled$.subscribe(isToggled => {
  this.isToggled = isToggled;
});

}
ngOnInit(): void {
    this.getResourceList()

  }
  getFilterdResources(){
    return this.allResources?.data.filter((val:any)=>val.ResourceType==this.resourceForm.value['ResourceType']).flat();
   }
  
  
    
    getResourceList() {
      this.commonService.getApi('Resources/All').subscribe((res:any) => {
        this.allResources =  res?.object
        this.dataSource = new MatTableDataSource(this.allResources.data || []);
        console.log(this.allResources.data,"this.allResources")
      });
    }
  
applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSource?.data.length;
      return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
      if (this.isAllSelected()) {
          this.selection.clear();
          return;
      }
      this.selection.select(...this.dataSource?.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
      if (!row) {
          return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
      }
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.taskTitle + 1}`;
  }

  // Popup Trigger
  classApplied = false;
  toggleClose(){
    this.classApplied = false;
  }
  toggleClass(value?:any,view?:string) {
    console.log("view or edit",view)
      this.classApplied = true;
      if(view=='view' ){
        this.viewOpen=false;
        this.addnew=false;
        this.commonService.getApi(`Resources/Detail/${value}`,{}).subscribe((res:any) => {
            this.ResourcesEdit= res.data;
            this.resourceForm.patchValue({
                Id:this.ResourcesEdit?.Id,
                ResourceName:this.ResourcesEdit.ResourceName,
                ResourceType: this.ResourcesEdit.ResourceType,
                IsPublic: this.ResourcesEdit.IsPublic,
                Position:this.ResourcesEdit.Position,
                ParentId:this.ResourcesEdit.ParentId,
                ResourceUrl:this.ResourcesEdit.ResourceUrl
              })
            console.log("this.vehicleTypeList",this.vehicleTypeEdit)
          })
      }else if(view=='edit'){
        this.viewOpen=true;
        this.addnew=false;
        this.commonService.getApi(`Resources/Detail/${value}`,{}).subscribe((res:any) => {
            this.ResourcesEdit= res.data;
            this.resourceForm.patchValue({
                Id:this.ResourcesEdit?.Id,
                ResourceName:this.ResourcesEdit.ResourceName,
                ResourceType: this.ResourcesEdit.ResourceType,
                IsPublic: this.ResourcesEdit.IsPublic,
                Position:this.ResourcesEdit.Position,
                ParentId:this.ResourcesEdit.ParentId,
                ResourceUrl:this.ResourcesEdit.ResourceUrl
              })
            console.log("this.vehicleTypeList",this.vehicleTypeEdit)
          })
        
        }else{
            this.addnew=true;
            this.viewOpen=true;
            this.resourceForm.reset();
        }
      

  }

// isToggled
  isToggled = false;
  onSubmit(form: FormGroup) {
  
      if (form.valid) {
   
        this.formSubmit(form, this.resourceForm, this.apiRoute, {redirect:'/'+this.uiPagePath,formInitialValues:this.formInitialValues, commonService: this.commonService, router: this.router })
  
      } else {
        this.validateAllFormFields(form);

      }
      this.resourceForm.reset();
      this.getResourceList();
      this.toggleClose();
      
  }


}
